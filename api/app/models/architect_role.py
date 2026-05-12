from sqlalchemy import Column, String, ForeignKey, UUID
from app.models.entity import EntityAbstract
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.project_architects import project_architects
class ArchitectRole(EntityAbstract):
    __tablename__ = "architect_role"
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    entity_type = Column(String, nullable=True)
     
    user = relationship("User", back_populates="architect_role")
    projects = relationship(
    "Project",
    secondary=project_architects,
    back_populates="architects"
)