from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
project_suppliers = Table(
    "project_suppliers",
    Base.metadata,
    Column("project_id", UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("supplier_id", UUID(as_uuid=True), ForeignKey("supplier_role.id", ondelete="CASCADE"), primary_key=True)
)
