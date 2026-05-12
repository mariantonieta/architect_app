from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
project_architects = Table(
    "project_architects",
    Base.metadata,
    Column("project_id", UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("architect_id", UUID(as_uuid=True), ForeignKey("architect_role.id", ondelete="CASCADE"), primary_key=True)
)
