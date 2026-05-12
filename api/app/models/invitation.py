from sqlalchemy import Column, String, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.entity import EntityAbstract
from app.schemas.enum import RoleType, InvitationStatus
from sqlalchemy.dialects.postgresql import UUID

class Invitation(EntityAbstract):
    __tablename__ = "invitation"

    email = Column(String, nullable=False)
    role = Column(Enum(RoleType, name="roletype"), nullable=False)
    status = Column(Enum(InvitationStatus, name="invitationstatus"), default=InvitationStatus.pending)
    invited_by_id = Column(ForeignKey("user.id", ondelete="SET NULL"))
    invited_by = relationship("User", foreign_keys=[invited_by_id])
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=True)
    user = relationship("User", foreign_keys=[user_id], back_populates="invitations")
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=True)
    project = relationship("Project", back_populates="invitations")