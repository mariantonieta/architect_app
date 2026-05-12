from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import User, Role, RoleType


async def get_or_create_google_user(user_info: dict, db: AsyncSession) -> User:
    email = user_info["email"]
    first_name = user_info.get("given_name", "")
    last_name = user_info.get("family_name", "")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()

    if not user:

        result_role = await db.execute(select(Role).where(Role.type == RoleType.pending))
        role_pending = result_role.scalars().first()
        if not role_pending:
            role_pending = Role(type=RoleType.pending)
            db.add(role_pending)
            await db.commit()
            await db.refresh(role_pending)

        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            hashed_password=None,
            is_completed=False,
            type=RoleType.pending,
            role_id=role_pending.id
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
