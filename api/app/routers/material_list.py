from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.services import material_list_service
from app.core.database import  get_sync_db
from app.schemas.material_list import MaterialListCreate, MaterialListUpdate, MaterialListOut
from app.core.deps import get_current_user
from app.models.user import User, RoleType
router = APIRouter(prefix="/material-lists", tags=["material_list"])


@router.post("/", response_model=MaterialListOut)
def create_material_list(
    material_list: MaterialListCreate,
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)  
):
    return material_list_service.create_material_list(
        db=db,
        data=material_list,
        invited_by_id=current_user.id  
    )



@router.get("/", response_model=List[MaterialListOut])
def list_all_material_lists(db: Session = Depends(get_sync_db)):
    return material_list_service.list_material_lists(db)


@router.get("/project/{project_id}", response_model=MaterialListOut)
def get_material_list_by_project(project_id: UUID, db: Session = Depends(get_sync_db),
                                 current_user = Depends(get_current_user)):
    material_list = material_list_service.get_material_list_by_project(db, project_id)
    if not material_list:
        raise HTTPException(status_code=404, detail="Material list not found for this project")
    if current_user.type == RoleType.architect:
        return MaterialListOut.from_orm(material_list)
    elif current_user.type == RoleType.supplier:
        supplier_ids = [user.id for user in getattr(material_list, "suppliers", [])]
        if current_user.id in supplier_ids:
            return MaterialListOut.from_orm(material_list)
        else:
            raise HTTPException(status_code=403, detail="Not authorized to view this material list")
    else:
        raise HTTPException(status_code=403, detail="Not authorized to view this material list")

@router.patch("/project/{project_id}", response_model=MaterialListOut)
def update_material_list_by_project(
    project_id: UUID,
    updates: MaterialListUpdate,
    db: Session = Depends(get_sync_db)
):
    material_list = material_list_service.get_material_list_by_project(db, project_id)
    if not material_list:
        raise HTTPException(status_code=404, detail="Material list not found for this project")
    
    updated = material_list_service.update_material_list(
        db, list_id=material_list.id, updates=updates
    )
    return updated



@router.delete("/{list_id}")
def delete_material_list(list_id: UUID, db: Session = Depends(get_sync_db)):
    material_list_service.delete_material_list(db, list_id)
    return {"detail": "Material list deleted successfully"}

@router.delete("/items/{item_id}")
def delete_material_list_item(item_id: UUID, db: Session = Depends(get_sync_db)):
    success = material_list_service.delete_material_list_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found or already deleted")
    return {"detail": "Material list item deleted successfully"}

