from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from typing import Optional


async def check_permission(
    db: AsyncSession,
    user: User,
    permission_name: str,
    resource: Optional[object] = None,
) -> bool:
    # Asegurar que el rol y permisos estén cargados
    if not user.role:
        await db.refresh(user, attribute_names=["role"])

    if not user.role.permissions:
        await db.refresh(user.role, attribute_names=["permissions"])

    user_permissions = {p.name for p in user.role.permissions}

    if permission_name not in user_permissions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing permission: '{permission_name}'"
        )

    if resource:
        # Si el usuario creó el recurso, tiene permiso completo
        if hasattr(resource, "created_by_id") and resource.created_by_id == user.id:
            return True

        if permission_name in ("edit_project", "delete_project"):
            if not hasattr(resource, "architects"):
                raise HTTPException(status_code=403, detail="Invalid resource")
            if user.id not in [ar.user_id for ar in resource.architects]:
                raise HTTPException(status_code=403, detail="Not allowed to modify this project")

        if permission_name == "view_project":
            allowed = False

            if hasattr(resource, "architects") and user.id in [ar.user_id for ar in resource.architects]:
                allowed = True
            elif hasattr(resource, "customers") and user.id in [cr.user_id for cr in resource.customers]:
                allowed = True
            elif hasattr(resource, "suppliers") and user.id in [sr.user_id for sr in resource.suppliers]:
                allowed = True
            elif hasattr(resource, "invitations") and user.email in [inv.email for inv in resource.invitations]:
                allowed = True

            if not allowed:
                raise HTTPException(status_code=403, detail="Not allowed to view this project")

    return True
