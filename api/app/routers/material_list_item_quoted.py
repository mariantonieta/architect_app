from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, aliased
from sqlalchemy import select, func
from uuid import UUID, uuid4
from typing import List
from app.core.database import get_sync_db
from app.models.user import User
from app.core.deps import get_current_user
from app.models.material_list_item_quoted import MaterialListItemQuoted
from app.models.material_list_item import MaterialListItem
from app.models.material_list import MaterialList
from app.models.project import Project
from app.models.material_list_supplier import material_list_supplier
from app.schemas.material_list_item_quoted import MaterialListItemQuotedOut, SupplierRequestOut, SupplierQuotedItemsOut
from app.schemas.bulk_material_list_item_quoted import BulkMaterialListItemQuotedPatch
from app.schemas.enum import MaterialItemStatus, RoleType

router = APIRouter(prefix="/material-list-quoted-items", tags=["material_list_item_quoted"])


def sync_quoted_items(db: Session, material_list_id: UUID, supplier_id: UUID):
    base_items = db.query(MaterialListItem).filter_by(material_list_id=material_list_id).all()

    existing_quoted_ids = set(
    db.execute(
        select(MaterialListItemQuoted.original_item_id).where(
            MaterialListItemQuoted.material_list_id == material_list_id,
            MaterialListItemQuoted.supplier_id == supplier_id
        )
    ).scalars().all()
)


    

    items_to_create = [item for item in base_items if item.id not in existing_quoted_ids]

    quoted_items = [
        MaterialListItemQuoted(
            id=uuid4(),
            original_item_id=item.id,
            material_list_id=material_list_id,
            supplier_id=supplier_id,
            name=item.name,
            description=item.description,
            unity=item.unity,
            quantity=item.quantity,
            price=None,
            comment=None,
            status=MaterialItemStatus.requested
        )
        for item in items_to_create
    ]

    if quoted_items:
        db.bulk_save_objects(quoted_items)
        db.commit()

    return db.query(MaterialListItemQuoted).filter_by(
        material_list_id=material_list_id,
        supplier_id=supplier_id
    ).all()
    
@router.get("/material-list/{material_list_id}", response_model=List[MaterialListItemQuotedOut])
def get_quoted_items_by_material_list(
    material_list_id: UUID,
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type == RoleType.supplier:

        items = sync_quoted_items(db, material_list_id, current_user.id)

    elif current_user.type == RoleType.architect:
        
        items = db.query(MaterialListItemQuoted).filter_by(
            material_list_id=material_list_id
        ).all()

    else:
        raise HTTPException(status_code=403, detail="No autorizado")

    return items

@router.get("/", response_model=List[SupplierRequestOut])
def get_supplier_requests(
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type not in [RoleType.supplier, RoleType.architect]:
        raise HTTPException(status_code=403, detail="Solo disponible para suppliers y architects")

    Creator = aliased(User)   
    Supplier = aliased(User) 

    stmt = (
        select(
            MaterialList,
            func.concat(Creator.first_name, ' ', Creator.last_name).label('architect_name'),
            func.concat(Supplier.first_name, ' ', Supplier.last_name).label('supplier_name'),
            Supplier.id.label("supplier_id"),
        )
        .join(material_list_supplier, material_list_supplier.c.material_list_id == MaterialList.id)
        .join(Project, Project.id == MaterialList.project_id)
        .join(Creator, Creator.id == Project.created_by_id)
        .join(Supplier, Supplier.id == material_list_supplier.c.user_id)
    )

    if current_user.type == RoleType.supplier:
        stmt = stmt.where(Supplier.id == current_user.id)

    if current_user.type == RoleType.architect:
        stmt = stmt.where(Project.created_by_id == current_user.id)

    rows = db.execute(stmt).all()

    return [
        SupplierRequestOut(
            material_list_id=row[0].id,
            project_id=row[0].project_id,
            project_name=row[0].project.name if row[0].project else None,
            architect_name=row[1],
            supplier_name=row[2],              
            supplier_id=row[3],                
            create_date=row[0].create_date.isoformat() if row[0].create_date else None,
        )
        for row in rows
    ]

from fastapi import Body

@router.patch("/material-list/{material_list_id}", response_model=List[MaterialListItemQuotedOut])
def update_quoted_items(
    material_list_id: UUID,
    payload: BulkMaterialListItemQuotedPatch,   
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.type != RoleType.supplier:
        raise HTTPException(status_code=403, detail="Solo suppliers pueden modificar")

    items = db.query(MaterialListItemQuoted).filter_by(
        material_list_id=material_list_id,
        supplier_id=current_user.id
    ).all()

    if not items:
        raise HTTPException(status_code=404, detail="No items found")

    for item_patch in payload.items:  
        for db_item in items:
            if db_item.id == item_patch.id:
                if item_patch.price is not None:
                    db_item.price = item_patch.price
                if item_patch.comment is not None:
                    db_item.comment = item_patch.comment
                if item_patch.status is not None:
                    db_item.status = item_patch.status

    db.commit()
    db.refresh(items[0])
    return items

@router.get("/material-list/{material_list_id}/by-supplier", response_model=List[SupplierQuotedItemsOut])
def get_quoted_items_by_supplier(
    material_list_id: UUID,
    db: Session = Depends(get_sync_db),
    current_user: User = Depends(get_current_user)
):

    if current_user.type not in [RoleType.architect, RoleType.supplier]:
        raise HTTPException(status_code=403, detail="No autorizado")

    stmt = (
        select(User.id, User.email, func.concat(User.first_name, " ", User.last_name))
        .join(material_list_supplier, material_list_supplier.c.user_id == User.id)
        .where(material_list_supplier.c.material_list_id == material_list_id)
    )

    if current_user.type == RoleType.supplier:
        stmt = stmt.where(User.id == current_user.id)

    suppliers = db.execute(stmt).all()

    result = []
    for supplier_id, supplier_email, supplier_name in suppliers:
     
        items = sync_quoted_items(db, material_list_id, supplier_id)

        result.append(
            SupplierQuotedItemsOut(
                supplier_id=supplier_id,
                supplier_email=supplier_email,
                supplier_name=supplier_name,
                items=items
            )
        )

    return result
