import sys
import os
import uuid
import asyncio
from sqlalchemy import select
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from typing import Optional
from sqlalchemy.exc import NoResultFound
from app.models import Role, Permission
from app.core.database import async_session

async def get_or_create_role(session, role_type) -> Role:
    stmt = select(Role).where(Role.type == role_type)
    result = await session.execute(stmt)
    role = result.scalars().first()
    if role:
        print(f"Role '{role_type}' found (id={role.id})")
        return role
    else:
        new_role = Role(type=role_type)
        session.add(new_role)
        await session.flush()
        print(f"Role '{role_type}' created (id={new_role.id})")
        return new_role

PERMISSIONS = [
    ("create_project", "Allows creating projects"),
    ("edit_project", "Allows editing projects"),
    ("delete_project", "Allows deleting projects"),
    ("view_project", "Allows viewing projects"),
    ("manage_users", "Allows managing users"),
    ("view_reports", "Allows viewing reports"),  
]

async def seed_roles_permissions():
    async with async_session() as session:
        async with session.begin():

            permissions = []
            for name, desc in PERMISSIONS:
                result = await session.execute(select(Permission).where(Permission.name == name))
                permission = result.scalars().first()
                if not permission:
                    permission = Permission(name=name, description=desc)
                    session.add(permission)
                    await session.flush()
                    print(f"Permission '{name}' created")
                permissions.append(permission)

            architect = await get_or_create_role(session, "architect")
            customer = await get_or_create_role(session, "customer")
            supplier = await get_or_create_role(session, "supplier")

            await session.refresh(architect, attribute_names=["permissions"])
            await session.refresh(customer, attribute_names=["permissions"])
            await session.refresh(supplier, attribute_names=["permissions"])

            architect.permissions = [p for p in permissions if p.name in ("create_project", "edit_project", "delete_project", "view_project")]
            customer.permissions = [p for p in permissions if p.name == "view_project"]
            supplier.permissions = [p for p in permissions if p.name == "view_reports"]

        await session.commit()
        print("Base roles and permissions seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed_roles_permissions())
