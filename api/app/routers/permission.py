
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.core.database import get_db as get_async_session

from typing import List

from app.schemas.permission import PermissionRead, PermissionCreate, PermissionUpdate
from app.crud import permission as crud

router = APIRouter(prefix="/permissions", tags=["permissions"])

@router.get("/", response_model=List[PermissionRead])
async def list_permissions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_async_session)):
    return await crud.get_permissions(db, skip=skip, limit=limit)

@router.get("/{permission_id}", response_model=PermissionRead)
async def get_permission(permission_id: UUID, db: AsyncSession = Depends(get_async_session)):
    perm = await crud.get_permission(db, permission_id)
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    return perm

@router.post("/", response_model=PermissionRead, status_code=201)
async def create_permission(permission: PermissionCreate, db: AsyncSession = Depends(get_async_session)):
    return await crud.create_permission(db, permission)

@router.put("/{permission_id}", response_model=PermissionRead)
async def update_permission(permission_id: UUID, updates: PermissionUpdate, db: AsyncSession = Depends(get_async_session)):
    perm = await crud.update_permission(db, permission_id, updates)
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    return perm

@router.delete("/{permission_id}", response_model=PermissionRead)
async def delete_permission(permission_id: UUID, db: AsyncSession = Depends(get_async_session)):
    perm = await crud.delete_permission(db, permission_id)
    if not perm:
        raise HTTPException(status_code=404, detail="Permission not found")
    return perm
