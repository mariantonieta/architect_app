from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from app.schemas.enum import MaterialItemStatus

class SupplierRequestOut(BaseModel):
    material_list_id: UUID
    project_id: UUID
    project_name: str | None
    architect_name: str | None
    supplier_name: str     
    supplier_id: UUID 
    create_date: str | None
    

    class Config:
        orm_mode = True
        from_attributes = True
        
class MaterialListItemQuotedBase(BaseModel):
    name: str
    description: Optional[str]
    unity: str
    quantity: float
    status: Optional[MaterialItemStatus] = MaterialItemStatus.requested
    price: Optional[float] = None
    comment: Optional[str] = None

class MaterialListItemQuotedUpdate(BaseModel):
    price: Optional[float] = None
    comment: Optional[str] = None
    status: Optional[MaterialItemStatus] = None
    
    
class MaterialListItemQuotedOut(MaterialListItemQuotedBase):
    id: UUID
    material_list_id: UUID

    class Config:
        orm_mode = True
        from_attributes = True

class SupplierQuotedItemsOut(BaseModel):
    supplier_id: UUID
    supplier_name: str
    items: List[MaterialListItemQuotedOut]


class MaterialListItemQuotedOut(MaterialListItemQuotedBase):
    id: UUID
    material_list_id: UUID

    class Config:
        orm_mode = True
        from_attributes = True

class SupplierQuotedItemsOut(BaseModel):
    supplier_id: UUID
    supplier_email: str
    supplier_name: Optional[str]
    items: List[MaterialListItemQuotedOut]

    class Config:
        orm_mode = True