from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload
from sqlalchemy.future import select
from uuid import UUID

from app.models.invitation import InvitationStatus
from app.models import (
    User, Role, RoleType, CustomerRole, SupplierRole, ArchitectRole, Invitation
)
from app.schemas.user import UserCreate, UserUpdate, UserUpdateFull, UserInDB, UserRead
from app.core.security import verify_password, get_password_hash, create_access_token
from app.services.invitations_service import complete_invitation_for_user


async def get_role_by_type(db: AsyncSession, role_type: RoleType) -> Role:
    result = await db.execute(select(Role).where(Role.type == role_type.value))
    role = result.scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role type")
    return role


async def create_user(user: UserCreate, db: AsyncSession) -> User:
    if await get_user_by_email(db, user.email):
        raise HTTPException(status_code=405, detail="Email already registered")

    if user.role in [RoleType.customer, RoleType.supplier]:
        invitation_result = await db.execute(
            select(Invitation).where(
                Invitation.email == user.email,
                Invitation.status == InvitationStatus.pending
            )
        )
        invitation = invitation_result.scalar_one_or_none()
        if not invitation:
            raise HTTPException(status_code=403, detail="Valid invitation required to register")

    role_obj = await get_role_by_type(db, user.role)
    hashed_pw = get_password_hash(user.password)

    new_user = User(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hashed_pw,
        type=user.role,
        role_id=role_obj.id
    )
    db.add(new_user)
    await db.flush()

    role_instance = build_role_instance(user, new_user.id)
    db.add(role_instance)

    await db.commit()
    await db.refresh(new_user)
    if user.role in [RoleType.customer, RoleType.supplier, RoleType.architect]:
        await complete_invitation_for_user(user.email, new_user.id, db)

    return new_user


def build_role_instance(user: UserCreate, user_id: UUID):
    if user.role == RoleType.customer:
        return CustomerRole(user_id=user_id, phone=user.phone, address=user.address)
    elif user.role == RoleType.supplier:
        return SupplierRole(user_id=user_id, phone=user.phone, company=user.company, address=user.address)
    elif user.role == RoleType.architect:
        return ArchitectRole(user_id=user_id, entity_type=user.entity_type)
    else:
        raise HTTPException(status_code=400, detail="Unsupported role")


async def complete_user_registration(user: User, data: dict, db: AsyncSession) -> str:
    role_type = RoleType(data["role"])

    result_role = await db.execute(select(Role).where(Role.type == role_type.value))
    role = result_role.scalars().first()
    if not role:
        role = Role(type=role_type.value)
        db.add(role)
        await db.commit()
        await db.refresh(role)

    user.hashed_password = get_password_hash(data["password"])
    user.type = role_type.value
    user.role_id = role.id
    user.is_completed = True
    db.add(user)

    if role_type == RoleType.customer:
        role_instance = CustomerRole(user_id=user.id, phone=data["customer_phone"], address=data.get("customer_address", ""))
    elif role_type == RoleType.supplier:
        role_instance = SupplierRole(
            user_id=user.id,
            phone=data["supplier_phone"],
            company=data["company"],
            address=data["supplier_address"]
        )
    elif role_type == RoleType.architect:
        role_instance = ArchitectRole(user_id=user.id, entity_type=data["architect_info"])
    else:
        raise ValueError("Invalid role")

    db.add(role_instance)
    await db.commit()

    return create_access_token(subject=str(user.id))


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User:
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.role),
            selectinload(User.customer_role),
            selectinload(User.supplier_role),
            selectinload(User.architect_role),
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def disable_user(db: AsyncSession, user_id: UUID) -> None:
    user = await get_user_by_id(db, user_id)
    user.disabled = True
    db.add(user)
    await db.commit()


async def update_user_data(db: AsyncSession, user: User, update_dict: dict) -> User:
    if "password" in update_dict:
        user.hashed_password = get_password_hash(update_dict.pop("password"))

    for field, value in update_dict.items():
        setattr(user, field, value)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> UserInDB:
    stmt = (
        select(User)
        .options(selectinload(User.role))
        .where(User.email == email)
    )
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")

    return UserInDB(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=user.hashed_password,
        disabled=user.disabled,
        role_name=user.role.type
    )


async def register_user(
    db: AsyncSession,
    password: str,
    first_name: str,
    last_name: str,
    email: str,
    role_name: str = RoleType.customer.value
) -> User:
    result = await db.execute(select(User).where(User.email == email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    role_str = role_name.value if isinstance(role_name, RoleType) else str(role_name)

    result = await db.execute(select(Role).where(Role.type == role_str))
    role_obj = result.scalars().first()

    if not role_obj:
        raise HTTPException(status_code=400, detail=f"Invalid role type: {role_str}")

    new_user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        hashed_password=get_password_hash(password),
        disabled=False,
        is_completed=False,
        type=role_str,
        role=role_obj
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def full_update(user_id: UUID, user_data: UserUpdateFull, db: AsyncSession) -> UserRead:
    result = await db.execute(
        select(User).options(joinedload(User.role), selectinload(User.architect_role)).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.email = user_data.email
    user.first_name = user_data.first_name
    user.last_name = user_data.last_name

    if user_data.password:
        user.hashed_password = get_password_hash(user_data.password)

    user.is_completed = user_data.is_completed

    if user_data.role:
        role_result = await db.execute(select(Role).where(Role.type == user_data.role.value))
        role_obj = role_result.scalar_one_or_none()
        if not role_obj:
            raise HTTPException(status_code=400, detail="Invalid role type")
        user.role_id = role_obj.id
        user.type = user_data.role.value

    if user.type == RoleType.architect.value and user_data.entity_type is not None:
        role_obj = await db.get(ArchitectRole, user.id)
        if role_obj:
            role_obj.entity_type = user_data.entity_type
            db.add(role_obj)

    await db.commit()
    await db.refresh(user)

    entity_type = user.architect_role.entity_type if user.architect_role else None

    return UserRead(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_completed=user.is_completed,
        role_id=user.role.id,
        role_name=user.type,
        entity_type=entity_type
    )


async def update_user_service(user_id: UUID, update_data: UserUpdate, db: AsyncSession) -> UserRead:
    result = await db.execute(
        select(User)
        .options(
            joinedload(User.role),
            selectinload(User.architect_role),
            selectinload(User.supplier_role),
            selectinload(User.customer_role),
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_dict = update_data.dict(exclude_unset=True)

    if "password" in update_dict:
        user.hashed_password = get_password_hash(update_dict.pop("password"))

    role_fields = ["phone", "address", "company", "entity_type"]
    role_update = {k: update_dict.pop(k) for k in role_fields if k in update_dict}

    for field, value in update_dict.items():
        setattr(user, field, value)

    if role_update:
        if user.type == RoleType.customer.value:
            role_obj = await db.get(CustomerRole, user.id)
            if role_obj:
                for k, v in role_update.items():
                    if k in ["phone", "address"]:
                        setattr(role_obj, k, v)
                db.add(role_obj)
        elif user.type == RoleType.supplier.value:
            role_obj = await db.get(SupplierRole, user.id)
            if role_obj:
                for k, v in role_update.items():
                    if k in ["phone", "company", "address"]:
                        setattr(role_obj, k, v)
                db.add(role_obj)
        elif user.type == RoleType.architect.value:
            role_obj = await db.get(ArchitectRole, user.id)
            if role_obj and "entity_type" in role_update:
                role_obj.entity_type = role_update["entity_type"]
                db.add(role_obj)

    await db.commit()
    await db.refresh(user)

    return UserRead(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_completed=user.is_completed,
        role_id=user.role.id,
        role_name=user.type,
        entity_type=user.architect_role.entity_type if user.architect_role else None,
        phone=(
            user.supplier_role.phone
            if user.supplier_role else
            user.customer_role.phone
            if user.customer_role else None
        ),
        address=(
            user.supplier_role.address
            if user.supplier_role else
            user.customer_role.address
            if user.customer_role else None
        ),
        company=user.supplier_role.company if user.supplier_role else None,
    )
