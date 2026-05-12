from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

request_budgets = Table(
    "request_budgets", 
    Base.metadata,
    Column("original_budget_id", UUID(as_uuid=True), ForeignKey("budget.id", ondelete="CASCADE"), primary_key=True),
    Column("budget_id", UUID(as_uuid=True), ForeignKey("budget.id", ondelete="CASCADE"), primary_key=True),
)
