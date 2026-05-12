from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.entity import EntityAbstract
from app.models.project_suppliers import project_suppliers
from app.models.material_list_supplier import material_list_supplier

class SupplierRole(EntityAbstract):
    __tablename__ = "supplier_role"

    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    phone = Column(String, nullable=True)
    company = Column(String, nullable=True)
    address = Column(String, nullable=True)

    user = relationship("User", back_populates="supplier_role")

    projects = relationship(
        "Project",
        secondary=project_suppliers,
        back_populates="suppliers"
    )

    material_lists = relationship(
        "MaterialList",
        secondary=material_list_supplier,
        primaryjoin="SupplierRole.id == material_list_supplier.c.supplier_role_id",
        secondaryjoin="MaterialList.id == material_list_supplier.c.material_list_id",
        back_populates="supplier_roles"
    )
