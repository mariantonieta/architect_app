from fastapi import APIRouter, status, HTTPException, Depends
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserUpdateFull
from sqlalchemy.orm import joinedload, selectinload
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from app.services import user_services
from app.models import User
from app.core.security import get_password_hash
from app.utils.user_utils import build_user_read

router = APIRouter(tags=["CRUD Users"])

@router.post("/register", response_model=UserRead)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    new_user = await user_services.create_user(user, db)
    result = await db.execute(
        select(User)
        .options(
            joinedload(User.role),
            selectinload(User.architect_role),
            selectinload(User.supplier_role),
            selectinload(User.customer_role),
        )
        .where(User.id == new_user.id)
    )
    user_with_relations = result.scalar_one()
    return await build_user_read(user_with_relations, db)

@router.get("/all", response_model=list[UserRead])
async def get_all_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).options(
            joinedload(User.role),
            selectinload(User.architect_role),
            selectinload(User.supplier_role),
            selectinload(User.customer_role),
        )
    )
    users = result.scalars().all()
    return [await build_user_read(user, db) for user in users]

@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = await user_services.get_user_by_id(db, user_id)
    return await build_user_read(user, db)

@router.put("/{user_id}", response_model=UserRead)
async def full_update(user_id: UUID, user_data: UserUpdateFull, db: AsyncSession = Depends(get_db)):
    return await user_services.full_update(user_id, user_data, db)

@router.patch("/{user_id}", response_model=UserRead)
async def update_user(user_id: UUID, update_data: UserUpdate, db: AsyncSession = Depends(get_db)):
    return await user_services.update_user_service(user_id, update_data, db)

@router.delete("/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = await user_services.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.disabled = True
    db.add(user)
    await db.commit()
    return {"msg": f"User with ID {user_id} successfully disabled"}
