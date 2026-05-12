from typing import List, Optional
from pydantic import BaseModel
from uuid import UUID
from app.schemas.enum import MaterialItemStatus
from app.schemas.material_list_item_quoted import MaterialListItemQuotedUpdate

class BulkMaterialListItemQuotedUpdate(BaseModel):
    items: List[MaterialListItemQuotedUpdate]

class BulkMaterialListItemQuotedPatch(BaseModel):
    items: List[dict]  
class MaterialListItemQuotedPatch(BaseModel):
    id: UUID
    price: Optional[float] = None
    comment: Optional[str] = None
    status: Optional[MaterialItemStatus] = None

class BulkMaterialListItemQuotedPatch(BaseModel):
    items: List[MaterialListItemQuotedPatch]