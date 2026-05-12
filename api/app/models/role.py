from sqlalchemy import Column, Enum, String
from sqlalchemy.orm import relationship
from app.models.entity import EntityAbstract
from app.models.permission import role_permissions

class Role(EntityAbstract):
    __tablename__ = "role"
    type = Column(String(50), nullable=False, unique=True) 
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")
  
