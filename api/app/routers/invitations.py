from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Body

from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload, joinedload, aliased
from app.models.invitation import Invitation, InvitationStatus
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, RoleType

from app.models.invitation import Invitation
import logging
from app.utils.utils import invite_user_by_email
from app.models.project import Project
from app.schemas.invitation import (
    InvitationCreate,
    InvitationUpdate,
    InvitationOutWithUser
)
from pydantic import BaseModel
from typing import Optional
from app.models.user import RoleType
from app.services.invitations_service import (
    create_invitation,
    cancel_expired_invitations
)
logger = logging.getLogger(__name__)
router = APIRouter(tags=["invitations"])

class InvitationCreate(BaseModel):
    email: str
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    inviter_name: Optional[str] = None

@router.post("/invite/{role}", status_code=status.HTTP_200_OK)
async def invite_user(
    role: RoleType,
    data: InvitationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = None
    if data.project_id:
        result = await db.execute(select(Project).where(Project.id == data.project_id))
        project = result.scalar_one_or_none()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

    return await create_invitation(
        email=data.email,
        role=role,
        db=db,
        current_user=current_user,
        project=project,
    )
@router.post("/invitationsagenda/{role}", status_code=status.HTTP_200_OK)
async def invite_to_agenda(
    role: RoleType,
    email: str = Body(..., embed=True, description="Email of the person to invite"),
    inviter_name: Optional[str] = Body(None, embed=True, description="Name of the inviter"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != RoleType.architect:
        raise HTTPException(status_code=403, detail="Only architects can invite to agenda")

    result = await db.execute(
        select(Invitation).where(
            Invitation.email == email,
            Invitation.role == role,
            Invitation.status.in_([InvitationStatus.pending, InvitationStatus.accepted]),
            Invitation.project_id.is_(None),
        )
    )
    existing_inv = result.scalars().first()
    if existing_inv:
        return {"msg": "Invitation already exists", "invitation_id": existing_inv.id}

    user_result = await db.execute(select(User).where(User.email == email))
    user = user_result.scalars().first()

    invitation = Invitation(
        email=email,
        role=role,
        invited_by_id=current_user.id,
        status=InvitationStatus.pending,
        user_id=user.id if user else None,
        project_id=None
    )
    db.add(invitation)
    await db.flush()
    await db.commit()

    try:
        await invite_user_by_email(
            email=email,
            role=role.value,
            inviter_name=inviter_name or current_user.first_name, 
            project_name=None
        )
    except Exception as e:
        logger.warning(f"Email sending failed: {e}")

    return {"msg": "Invitation sent", "invitation_id": invitation.id}

@router.post("/invitationsagenda/{role}", status_code=status.HTTP_200_OK)
async def invite_to_agenda(
    role: RoleType,
    email: str = Body(..., embed=True, description="Email of the person to invite"),
    inviter_name: Optional[str] = Body(None, embed=True, description="Name of the inviter"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != RoleType.architect:
        raise HTTPException(status_code=403, detail="Only architects can invite to agenda")

    result = await db.execute(
        select(Invitation).where(
            Invitation.email == email,
            Invitation.role == role,
            Invitation.status.in_([InvitationStatus.pending, InvitationStatus.accepted]),
            Invitation.project_id.is_(None),
        )
    )
    existing_inv = result.scalars().first()
    if existing_inv:
        return {"msg": "Invitation already exists", "invitation_id": existing_inv.id}

    user_result = await db.execute(select(User).where(User.email == email))
    user = user_result.scalars().first()

    invitation = Invitation(
        email=email,
        role=role,
        invited_by_id=current_user.id,
        status=InvitationStatus.pending,
        user_id=user.id if user else None,
        project_id=None
    )
    db.add(invitation)
    await db.flush()
    await db.commit()

    try:
        await invite_user_by_email(
            email=email,
            role=role.value,
            inviter_name=inviter_name or current_user.first_name,
            project_name=None
        )
    except Exception as e:
        logger.warning(f"Email sending failed: {e}")

    return {"msg": "Invitation sent", "invitation_id": invitation.id}

@router.get("/invitation/status/{email}", response_model=InvitationOutWithUser)
async def get_invitation_status(
    email: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await cancel_expired_invitations(db)

    result = await db.execute(
        select(Invitation)
        .options(joinedload(Invitation.user))
        .where(Invitation.email == email)
    )
    invitation = result.scalars().first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    return invitation

@router.get("/invitations", response_model=List[InvitationOutWithUser])
async def list_invitations_by_role(
    role: RoleType = Query(..., description="Role to filter invitations"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != RoleType.architect:
        raise HTTPException(status_code=403, detail="Only architects can view invitations.")

    await cancel_expired_invitations(db)
    
    result = await db.execute(
        select(Invitation)
        .options(
            selectinload(Invitation.user).selectinload(User.supplier_role),
            selectinload(Invitation.user).selectinload(User.architect_role),
            selectinload(Invitation.user).selectinload(User.customer_role),
            selectinload(Invitation.invited_by)
        )
        .where(
            Invitation.invited_by_id == current_user.id,
            or_(
                Invitation.role == role,
                Invitation.user.has(User.type == role)
            )
        )
        .order_by(Invitation.create_date.desc())
    )

    invitations = result.scalars().all()
    return [await InvitationOutWithUser.from_orm_async(db, inv) for inv in invitations]

@router.patch("/invitation/{invitation_id}", status_code=status.HTTP_200_OK)
async def update_invitation(
    invitation_id: int,
    data: InvitationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Invitation).where(Invitation.id == invitation_id))
    invitation = result.scalars().first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.invited_by_id != current_user.id or current_user.type != RoleType.architect:
        raise HTTPException(status_code=403, detail="Not allowed to edit this invitation")

    if data.email is not None:
        invitation.email = data.email
    if data.status is not None:
        invitation.status = data.status

    db.add(invitation)
    await db.commit()
    await db.refresh(invitation)

    return {"msg": "Invitation updated", "invitation_id": invitation.id}


@router.delete("/invitation/{invitation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_invitation(
    invitation_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(Invitation).where(Invitation.id == invitation_id))
    invitation = result.scalars().first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.invited_by_id != current_user.id or current_user.type != RoleType.architect:
        raise HTTPException(status_code=403, detail="Not allowed to delete this invitation")

    await db.delete(invitation)
    await db.commit()

    return {"msg": "Invitation deleted"}


@router.get("/invitations/search")
async def search_invitation_by_email_and_role(
    email: str = Query(...),
    role: RoleType = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.type != RoleType.architect:
        raise HTTPException(status_code=403, detail="Only architects can search invitations")
    
    
    result = await db.execute(
        select(User)
        .join(Invitation, User.email == Invitation.email)
        .where(
            User.email.ilike(f"%{email}%"),
            User.type == role,
            Invitation.invited_by_id == current_user.id
        )
        .limit(10)
    )
    invitations = result.scalars().all()
    return [inv.email for inv in invitations]

