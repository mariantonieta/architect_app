from sqlalchemy import Column, String, Float, ForeignKey,  Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.entity import EntityAbstract
from app.schemas.enum import MaterialItemStatus
class MaterialListItem(EntityAbstract):
    __tablename__ = "material_list_item"

    name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    unity = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(Enum(MaterialItemStatus), name="material_item_status", default=MaterialItemStatus.not_requested)
    material_list_id = Column(
    UUID(as_uuid=True),
    ForeignKey("material_list.id", ondelete="CASCADE"),
    nullable=False
)
    material_list = relationship("MaterialList", back_populates="material_list_items")
