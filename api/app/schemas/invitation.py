from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from sqlalchemy.orm import selectinload
from sqlalchemy.future import select
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.invitation import Invitation
from app.models.user import User
class UserLite(BaseModel):
    id: UUID
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_completed: Optional[bool] = None
    role_id: Optional[UUID] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    entity_type: Optional[str] = None

    class Config:
        from_attributes = True
        extra = "ignore"

    class Config:
        from_attributes = True
        extra = "ignore" 
class InvitationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    expired = "expired"

class InvitationBase(BaseModel):
    email: EmailStr
    role: str

class InvitationCreate(InvitationBase):
    pass

class InvitationOut(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    status: str
    create_date: datetime
    invited_by_id: UUID
    user: Optional[UserLite] = None 
    class Config:
        from_attributes = True
class InvitationUpdate(BaseModel): 
    status: Optional[InvitationStatus] = None
    class Config:
        from_attributes = True
        populate_by_name = True

class InvitationOutWithUser(InvitationOut):
    invited_by: Optional[UserLite] = None
    project_id: Optional[UUID] = None

    @classmethod
    async def from_orm_async(cls, db: AsyncSession, invitation: Invitation) -> 'InvitationOutWithUser':
        result = await db.execute(
            select(Invitation)
            .options(
                selectinload(Invitation.user).selectinload(User.supplier_role),
                selectinload(Invitation.user).selectinload(User.architect_role),
                selectinload(Invitation.user).selectinload(User.customer_role),
                selectinload(Invitation.invited_by)
            )
            .where(Invitation.id == invitation.id)
        )
        invitation = result.scalars().first()

        user_data = None
        if invitation.user:
            phone = None
            address = None
            company = None
            entity_type = None
            
            if invitation.user.supplier_role:
                phone = invitation.user.supplier_role.phone
                address = invitation.user.supplier_role.address
                company = invitation.user.supplier_role.company
            elif invitation.user.architect_role:
                entity_type = invitation.user.architect_role.entity_type
            elif invitation.user.customer_role:
                phone = invitation.user.customer_role.phone
                address = invitation.user.customer_role.address

            user_data = UserLite(
                id=invitation.user.id,
                email=invitation.user.email,
                first_name=invitation.user.first_name,
                last_name=invitation.user.last_name,
                is_completed=invitation.user.is_completed,
                role_id=invitation.user.role_id,
                phone=phone,
                address=address,
                company=company,
                entity_type=entity_type
            )

        invited_by_data = None
        if invitation.invited_by:
            invited_by_data = UserLite(
                id=invitation.invited_by.id,
                email=invitation.invited_by.email,
                first_name=invitation.invited_by.first_name,
                last_name=invitation.invited_by.last_name,
                is_completed=invitation.invited_by.is_completed,
                role_id=invitation.invited_by.role_id
            )

        return cls(
            id=invitation.id,
            email=invitation.email,
            role=invitation.role.value if hasattr(invitation.role, 'value') else str(invitation.role),
            status=invitation.status.value,
            create_date=invitation.create_date,
            invited_by_id=invitation.invited_by_id,
            user=user_data,
            invited_by=invited_by_data,
            project_id=invitation.project_id
        )