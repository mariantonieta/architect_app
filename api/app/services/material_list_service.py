from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from sqlalchemy import insert, select
from app.models.material_list import MaterialList
from app.models.material_list_item import MaterialListItem
from app.models.user import User
from app.schemas.material_list import MaterialListCreate, MaterialListUpdate
from app.schemas.enum import RoleType, MaterialItemStatus
from app.utils.utils import generate_material_list_notification_email, send_email
from app.models.supplier_role import SupplierRole
from app.models.material_list_supplier import material_list_supplier
from app.services.material_list_item_quoted_service import create_quoted_items_for_suppliers
from app.models.material_list_item_quoted import MaterialListItemQuoted

def create_material_list(db: Session, data: MaterialListCreate, invited_by_id: UUID) -> MaterialList:
    list_data = data.dict(exclude={"material_list_items", "supplier_emails"})
    items_data = data.material_list_items or []
    supplier_emails = list(set(data.supplier_emails or []))

    material_list = db.query(MaterialList).filter(MaterialList.project_id == data.project_id).first()
    if not material_list:
        material_list = MaterialList(**list_data, id=uuid4())
        db.add(material_list)
        db.flush()

    existing_item_names = {item.name for item in db.query(MaterialListItem).filter(MaterialListItem.material_list_id == material_list.id).all()}
    new_items = [
        MaterialListItem(**item.dict(), material_list_id=material_list.id)
        for item in items_data
        if item.name not in existing_item_names
    ]
    if new_items:
        db.add_all(new_items)
        db.flush()

    suppliers_notified = []
    if supplier_emails:
        existing_suppliers = db.execute(
            select(User).where(User.email.in_(supplier_emails), User.type == RoleType.supplier)
        ).scalars().all()

        for supplier in existing_suppliers:
            supplier_role = db.query(SupplierRole).filter(SupplierRole.user_id == supplier.id).first()
            if not supplier_role:
                continue

            already_associated = db.execute(
                select(material_list_supplier).where(
                    material_list_supplier.c.material_list_id == material_list.id,
                    material_list_supplier.c.user_id == supplier.id
                )
            ).first()

            if not already_associated:
                db.execute(
                    insert(material_list_supplier).values(
                        material_list_id=material_list.id,
                        user_id=supplier.id,
                        supplier_role_id=supplier_role.id,
                    )
                )

            base_items = db.query(MaterialListItem).filter(MaterialListItem.material_list_id == material_list.id).all()
            existing_quoted_ids = {
                q.original_item_id
                for q in db.query(MaterialListItemQuoted.original_item_id)
                        .filter(MaterialListItemQuoted.material_list_id == material_list.id,
                                MaterialListItemQuoted.supplier_id == supplier.id)
                        .all()
            }

            items_to_create = [item for item in base_items if item.id not in existing_quoted_ids]
            if items_to_create:
                create_quoted_items_for_suppliers(
                    db=db,
                    items_data=items_to_create,
                    material_list_id=material_list.id,
                    supplier_id=supplier.id
                )

            suppliers_notified.append(supplier)

    db.commit()
    db.refresh(material_list)

    for supplier in suppliers_notified:
        email_data = generate_material_list_notification_email(
            email_to=supplier.email,
            project_name=getattr(material_list.project, "name", None),
            project_id=material_list.project_id
        )
        send_email(
            email_to=supplier.email,
            subject=email_data.subject,
            html_content=email_data.html_content
        )

    return material_list


def update_material_list(db: Session, list_id: str, updates: MaterialListUpdate):
    material_list = db.query(MaterialList).filter(MaterialList.id == list_id).first()
    if not material_list:
        return None

    for key, value in updates.dict(
        exclude={"material_list_items", "supplier_emails", "project_id"},
        exclude_unset=True
    ).items():
        setattr(material_list, key, value)

    current_items = db.query(MaterialListItem).filter(MaterialListItem.material_list_id == list_id).all()
    current_items_dict = {str(item.id): item for item in current_items}
    existing_item_names = {item.name for item in current_items}

    new_items_to_add = []
    if updates.material_list_items:
        for item in updates.material_list_items:
            item_data = item.dict(exclude_unset=True)
            item_id = str(item_data.get("id"))

            if item_id and item_id in current_items_dict:

                db_item = current_items_dict[item_id]
                for k, v in item_data.items():
                    if k != "id":
                        setattr(db_item, k, v)
                db_item.status = MaterialItemStatus.requested
            elif item_data.get("name") not in existing_item_names:
                item_data.pop("material_list_id", None)
                item_data.pop("status", None)
                new_item = MaterialListItem(
                    id=uuid4(),
                    **item_data,
                    material_list_id=list_id,
                    status=MaterialItemStatus.requested
                )
                new_items_to_add.append(new_item)

    if new_items_to_add:
        db.add_all(new_items_to_add)
        db.flush()
    suppliers_notified = []
    if updates.supplier_emails:
        supplier_emails = list(set(updates.supplier_emails))
        existing_suppliers = db.execute(
            select(User).where(User.email.in_(supplier_emails), User.type == RoleType.supplier)
        ).scalars().all()

        for supplier in existing_suppliers:
            supplier_role = db.query(SupplierRole).filter(SupplierRole.user_id == supplier.id).first()
            if not supplier_role:
                continue

            already_associated = db.execute(
                select(material_list_supplier).where(
                    material_list_supplier.c.material_list_id == list_id,
                    material_list_supplier.c.user_id == supplier.id
                )
            ).first()

            if not already_associated:
                db.execute(
                    insert(material_list_supplier).values(
                        material_list_id=list_id,
                        user_id=supplier.id,
                        supplier_role_id=supplier_role.id
                    )
                )

            all_items = db.query(MaterialListItem).filter(MaterialListItem.material_list_id == list_id).all()
            existing_quoted_ids = {
                q.original_item_id
                for q in db.query(MaterialListItemQuoted.original_item_id)
                        .filter(MaterialListItemQuoted.material_list_id == list_id,
                                MaterialListItemQuoted.supplier_id == supplier.id)
                        .all()
            }
            items_to_create = [item for item in all_items if item.id not in existing_quoted_ids]

            if items_to_create:
                create_quoted_items_for_suppliers(
                    db=db,
                    items_data=items_to_create,
                    material_list_id=list_id,
                    supplier_id=supplier.id
                )

            suppliers_notified.append(supplier)

    db.commit()
    db.refresh(material_list)

    for supplier in suppliers_notified:
        email_data = generate_material_list_notification_email(
            email_to=supplier.email,
            project_name=getattr(material_list.project, "name", None),
            project_id=material_list.project_id
        )
        send_email(
            email_to=supplier.email,
            subject=email_data.subject,
            html_content=email_data.html_content
        )

    return material_list

def get_material_list_by_project(db: Session, project_id: UUID):
    return db.query(MaterialList).filter(MaterialList.project_id == project_id).first()
