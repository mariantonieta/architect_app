from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Role, Permission


async def create_role_with_permissions(
    db: AsyncSession,
    role_type: str,
    permission_names: list[str]
):
    result = await db.execute(select(Permission).where(Permission.name.in_(permission_names)))
    permissions = result.scalars().all()

    role = Role(type=role_type, permissions=permissions)
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return role
async def get_role_by_type(db: AsyncSession, role_type: str):
    result = await db.execute(select(Role).where(Role.type == role_type))
    return result.scalars().first()
async def get_all_roles(db: AsyncSession):
    result = await db.execute(select(Role))
    return result.scalars().all()

async def update_role_permissions(
    db: AsyncSession,
    role_type: str,
    permission_names: list[str]
):
    role = await get_role_by_type(db, role_type)
    if not role:
        raise Exception("Rol no encontrado")

    result = await db.execute(select(Permission).where(Permission.name.in_(permission_names)))
    permissions = result.scalars().all()

    role.permissions = permissions
    await db.commit()
    await db.refresh(role)
    return role

async def delete_role(db: AsyncSession, role_type: str):
    role = await get_role_by_type(db, role_type)
    if not role:
        raise Exception("Rol no encontrado")

    await db.delete(role)
    await db.commit()
