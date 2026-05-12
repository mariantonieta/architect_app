from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionUpdate(BaseModel):
    name: Optional[str]
    description: Optional[str]

class PermissionRead(PermissionBase):
    id: UUID

    class Config:
        from_attributes = True
