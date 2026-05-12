from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from fastapi import Form
from enum import Enum
from uuid import UUID
from app.models.user import RoleType
from app.schemas.invitation import InvitationOut

class ProjectType(str, Enum):
    single_family_home = "single_family_home"
    residential_building = "residential_building"
    commercial_building = "commercial_building"
    industrial = "industrial"
    renovation = "renovation"
    recreational = "recreational"
    other = "other"
class Currency(str, Enum):
    ars = "ars"
    usd = "usd"
    eur = "eur"

class ProjectStatus(str, Enum):
    idea = "idea"
    budgeting = "budgeting"
    in_progress = "in_progress"
    finished = "finished"

class FileType(str, Enum):
    bim_model = "bim_model"
    renders = "renders"
    material_takeoff = "material_takeoff"
    reports = "reports"
    blueprints = "blueprints"

class UserLite(BaseModel):
    id: UUID
    email: EmailStr
    
    class Config:
        from_attributes = True 

class ProjectFileBase(BaseModel):
    id: UUID
    filename: str
    original_name: str
    url: str
    file_type: FileType 

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    project_type: ProjectType
    currency: Currency
    estimated_budget: float
    location: str
    status: ProjectStatus

    class Config:
        use_enum_values = True

class ProjectCreate(ProjectBase):
    customer_email: Optional[List[str]] = None
    supplier_email: Optional[List[str]] = None
    architect_email: Optional[List[str]] = None
    


    @validator("customer_email", "supplier_email", pre=True, always=True)
    def empty_str_to_none(cls, v):
        return v or None

class ProjectUpdate(BaseModel):
    name: Optional[str]
    project_type: Optional[ProjectType]
    currency: Optional[Currency]
    estimated_budget: Optional[float]
    location: Optional[str]
    status: Optional[ProjectStatus]
    customer_id: Optional[UUID] = None

class ProjectDelete(BaseModel):
    id: UUID

class ProjectInDB(BaseModel):
    id: UUID
    name: str
    project_type: ProjectType
    currency: Optional[Currency] = None
    estimated_budget: Optional[float] = None
    location: str
    status: ProjectStatus
    description: Optional[str] = None
    created_at: Optional[datetime] = Field(None, alias="create_date")
    updated_at: Optional[datetime] = Field(None, alias="update_date")
    
    architects: List[UserLite] = []
    customers: List[UserLite] = []
    suppliers: List[UserLite] = []
    
    invitations: Optional[List[InvitationOut]] = []
    sent_invitations: Optional[List[InvitationOut]] = []
    
    customerEmail: List[str] = []
    supplierEmail: List[str] = []
    architectEmail: List[str] = []
    files: List[ProjectFileBase] = []

    class Config:
        from_attributes = True

    @classmethod
    def from_orm_with_emails(cls, project_orm, invitations, sent_invitations=None):
        customers = [{"email": r.user.email} for r in project_orm.customers if r.user]
        suppliers = [{"email": r.user.email} for r in project_orm.suppliers if r.user]
        architects = [{"email": r.user.email} for r in project_orm.architects if r.user]

        inv_data = []
        for inv in invitations:
            inv_data.append({
                "id": inv.id,
                "email": inv.email,
                "role": inv.role,
                "status": inv.status,
                "create_date": inv.create_date,
                "invited_by_id": inv.invited_by_id,
                "user": {
                    "id": inv.user.id,
                    "email": inv.user.email,
                    "first_name": inv.user.first_name,
                    "last_name": inv.user.last_name
                } if inv.user else None
            })


        customer_emails = list(set(
            [r.user.email for r in project_orm.customers if r.user] +
            [inv.email for inv in invitations if inv.role == RoleType.customer]
        ))

        supplier_emails = list(set(
            [r.user.email for r in project_orm.suppliers if r.user] +
            [inv.email for inv in invitations if inv.role == RoleType.supplier]
        ))

        architect_emails = list(set(
            [r.user.email for r in project_orm.architects if r.user] +
            [inv.email for inv in invitations if inv.role == RoleType.architect]
        ))

        return cls(
            id=project_orm.id,
            name=project_orm.name,
            project_type=project_orm.project_type,
            currency=project_orm.currency,
            estimated_budget=project_orm.estimated_budget,
            location=project_orm.location,
            status=project_orm.status,
            description=project_orm.description,
            created_at=project_orm.create_date,
            updated_at=project_orm.update_date,

            customers=customers,
            suppliers=suppliers,
            architects=architects,
            invitations=inv_data,
            sent_invitations=sent_invitations or [],
            customerEmail=customer_emails,
            supplierEmail=supplier_emails,
            architectEmail=architect_emails,
            files=[{
                "id": f.id,
                "filename": f.filename,
                "original_name": f.original_name,
                "url": f.url,
                "file_type": f.file_type
            } for f in project_orm.files]
        )
