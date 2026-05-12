from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

material_list_material_list_item_quoted = Table(
    "material_list_material_list_item_quoted",
    Base.metadata,
    Column("material_list_id", UUID(as_uuid=True), ForeignKey("material_list.id", ondelete="CASCADE"), primary_key=True),
    Column("material_list_item_quoted_id", UUID(as_uuid=True), ForeignKey("material_list_item_quoted.id", ondelete="CASCADE"), primary_key=True),
)