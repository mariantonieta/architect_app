
from app.models.material_list_item_quoted import MaterialListItemQuoted
def create_quoted_items_for_suppliers(db, items_data, material_list_id, supplier_id):
    quoted_items = []
    for item in items_data:
        item_data = {
            "name": item.name,
            "description": item.description,
            "unity": item.unity,
            "quantity": item.quantity,
            "material_list_id": material_list_id,
            "supplier_id": supplier_id,
            "original_item_id": item.id,
            "price": None,
            "comment": None
        }

        quoted_items.append(MaterialListItemQuoted(**item_data))

    db.bulk_save_objects(quoted_items)
    db.flush()
