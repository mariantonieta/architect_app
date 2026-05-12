from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

material_list_supplier = Table(
    "material_list_supplier",
    Base.metadata,
    Column("material_list_id", UUID(as_uuid=True), ForeignKey("material_list.id", ondelete="CASCADE"), primary_key=True),
    Column("supplier_role_id", UUID(as_uuid=True), ForeignKey("supplier_role.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), primary_key=True),  
)