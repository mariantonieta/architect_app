from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, Depends, status, APIRouter
from typing import Optional
from uuid import UUID
import logging

from app.models.invitation import Invitation, InvitationStatus
from app.models.user import User, RoleType
from app.models.architect_role import ArchitectRole
from app.models.supplier_role import SupplierRole
from app.models.customer_role import CustomerRole
from app.models.project import Project

from app.utils.utils import invite_user_by_email  

logger = logging.getLogger(__name__)
router = APIRouter()

EXPIRATION_HOURS = 48

async def create_invitation(
    email: str,
    role: RoleType,
    db: AsyncSession,
    current_user: User,
    project: Optional[Project] = None,
) -> Invitation:

    existing_inv_result = await db.execute(
        select(Invitation).where(
            Invitation.project_id == (project.id if project else None),
            Invitation.email == email,
            Invitation.role == role,
            Invitation.status.in_([InvitationStatus.pending, InvitationStatus.accepted])
        )
    )
    existing_inv = existing_inv_result.scalars().first()
    if existing_inv:
        logger.info(f"Invitation already exists for {email} with role {role} in project {project.name if project else 'None'}.")
        return existing_inv

    user_result = await db.execute(select(User).where(User.email == email))
    user = user_result.scalars().first()

    new_inv = Invitation(
        project_id=project.id if project else None,
        email=email,
        role=role,
        invited_by_id=current_user.id,
        status=InvitationStatus.pending,
        user_id=user.id if user else None,
        create_date=datetime.utcnow(),
    )
    db.add(new_inv)
    await db.flush()
    

    try:
        await invite_user_by_email(
            email=email,
            role=role.value,
            inviter_name=current_user.first_name,
            project_name=project.name if project else None,
        )
    except Exception as e:
        logger.warning(f"Failed to send invitation email to {email}: {e}")

    return new_inv


async def cancel_expired_invitations(db: AsyncSession):
    expiration_time = datetime.utcnow() - timedelta(hours=EXPIRATION_HOURS)
    result = await db.execute(
        select(Invitation).where(
            Invitation.status == InvitationStatus.pending,
            Invitation.create_date < expiration_time
        )
    )
    expired = result.scalars().all()

    for invitation in expired:
        await db.delete(invitation)

    if expired:
        await db.commit()


async def complete_invitation_for_user(email: str, user_id: UUID, db: AsyncSession):
    result = await db.execute(
        select(Invitation).where(
            Invitation.email == email,
            Invitation.status == InvitationStatus.pending
        )
    )
    invitation = result.scalars().first()
    if invitation:
        invitation.status = InvitationStatus.accepted
        invitation.user_id = user_id
        db.add(invitation)
        await db.commit()
