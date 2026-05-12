from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import Optional, List
from app.schemas.enum import Currency
from app.schemas.material_list_item import MaterialListItemCreate, MaterialListItemOut, MaterialListItemUpdate

class MaterialListBase(BaseModel):
    name: str
    currency: Optional[Currency]
    project_id: UUID

class MaterialListCreate(MaterialListBase):
    material_list_items: Optional[List[MaterialListItemCreate]] = []
    supplier_emails: Optional[List[EmailStr]] = []


class MaterialListUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[Currency] = None
    project_id: Optional[UUID] = None
    material_list_items: Optional[List[MaterialListItemUpdate]] = []
    supplier_emails: Optional[List[EmailStr]] = [] 

class MaterialListOut(MaterialListBase):
    id: UUID
    material_list_items: List[MaterialListItemOut] = []
    supplier_emails: Optional[List[EmailStr]] = []

    class Config:
        orm_mode = True
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        supplier_emails = [user.email for user in getattr(obj, "suppliers", [])]
        items = [
            MaterialListItemOut.from_orm(item)
            for item in getattr(obj, "material_list_items", [])
        ]
        material_list_out = super().from_orm(obj)
        material_list_out.supplier_emails = supplier_emails
        material_list_out.material_list_items = items
        return material_list_out