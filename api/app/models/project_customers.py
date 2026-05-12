from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
project_customers = Table(
    "project_customers",
    Base.metadata,
    Column("project_id", UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("customer_id", UUID(as_uuid=True), ForeignKey("customer_role.id", ondelete="CASCADE"), primary_key=True)
)
