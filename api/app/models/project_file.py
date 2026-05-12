from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.entity import EntityAbstract
from sqlalchemy.dialects.postgresql import UUID

class ProjectFile(EntityAbstract):
    __tablename__ = "project_files"
    
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    file_type = Column(String, nullable=True)  
    filename = Column(String, nullable=False)
    original_name = Column(String, nullable=False)
    url = Column(String, nullable=True) 

    project = relationship("Project", back_populates="files")
