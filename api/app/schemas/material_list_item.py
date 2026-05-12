from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from app.schemas.enum import MaterialItemStatus

class MaterialListItemBase(BaseModel):
    name: str
    description: Optional[str] 
    unity: str
    quantity: float
    status: Optional[MaterialItemStatus] = MaterialItemStatus.requested
class MaterialListItemCreate(MaterialListItemBase):
    pass

class MaterialListItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unity: Optional[str] = None
    quantity: Optional[float] = None
    status: Optional[MaterialItemStatus] = None
    material_list_id: Optional[UUID] = None

class MaterialListItemOut(MaterialListItemBase):
    id: UUID
    material_list_id: UUID

    class Config:
        orm_mode = True
        from_attributes = True
