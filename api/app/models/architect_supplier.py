from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

architect_supplier = Table(
    "architect_supplier",
    Base.metadata,
    Column("architect_id", UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), primary_key=True),
    Column("supplier_id", UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), primary_key=True),
)

