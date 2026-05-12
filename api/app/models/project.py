from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, String, Float, ForeignKey, Enum as SqlEnum, Text
from sqlalchemy.orm import relationship
from app.models.entity import EntityAbstract
from app.schemas.enum import ProjectType, Currency, ProjectStatus

from app.models.project_architects import project_architects
from app.models.project_suppliers import project_suppliers
from app.models.project_customers import project_customers

class Project(EntityAbstract):
    __tablename__ = "projects"

    name = Column(String, nullable=False)
    project_type = Column(SqlEnum(ProjectType, name="project_type"), nullable=False)
    currency = Column(SqlEnum(Currency, name="currency", create_type=False), nullable=True)
    estimated_budget = Column(Float, nullable=True)
    location = Column(String, nullable=False)
    status = Column(SqlEnum(ProjectStatus, name="project_status"), default=ProjectStatus.in_progress)
    description = Column(Text, nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    created_by = relationship("User", foreign_keys=[created_by_id], backref="created_projects")

   
    architects = relationship(
    "ArchitectRole",
    secondary=project_architects,
    back_populates="projects"
)
    customers = relationship(
    "CustomerRole",
    secondary=project_customers,
    back_populates="projects"
)
    suppliers = relationship(
    "SupplierRole",
    secondary=project_suppliers,
    back_populates="projects"
)


    files = relationship("ProjectFile", back_populates="project", cascade="all, delete-orphan")
    invitations = relationship("Invitation", back_populates="project", cascade="all, delete-orphan")
    material_list = relationship("MaterialList", back_populates="project", cascade="all, delete-orphan")