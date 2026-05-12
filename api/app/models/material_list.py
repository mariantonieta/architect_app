from sqlalchemy import Column, String, ForeignKey, Enum as SqlEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.entity import EntityAbstract
from app.schemas.enum import Currency
from app.models.material_list_supplier import material_list_supplier

class MaterialList(EntityAbstract):
    __tablename__ = "material_list"

    name = Column(String, nullable=False)
    currency = Column(SqlEnum(Currency, name="currency", create_type=False), nullable=True)

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    project = relationship("Project", back_populates="material_list")

    material_list_items = relationship(
        "MaterialListItem", 
        back_populates="material_list", 
        cascade="all, delete, delete-orphan",
        passive_deletes=True
    )

    material_list_items_quoted = relationship(
        "MaterialListItemQuoted",
        back_populates="material_list",
        cascade="all, delete, delete-orphan",
        passive_deletes=True
    )

    suppliers = relationship(
        "User",
        secondary=material_list_supplier,
        primaryjoin="MaterialList.id == material_list_supplier.c.material_list_id",
        secondaryjoin="User.id == material_list_supplier.c.user_id",
        backref="material_lists"
    )

    supplier_roles = relationship(
        "SupplierRole",
        secondary=material_list_supplier,
        primaryjoin="MaterialList.id == material_list_supplier.c.material_list_id",
        secondaryjoin="SupplierRole.id == material_list_supplier.c.supplier_role_id",
        back_populates="material_lists"
    )