from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.entity import EntityAbstract
from app.models.project_customers import project_customers
class CustomerRole(EntityAbstract):
    __tablename__ = "customer_role"

    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    user = relationship("User", back_populates="customer_role")
    projects = relationship(
        "Project",
        secondary=project_customers,
        back_populates="customers"
    )
