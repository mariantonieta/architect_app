from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID


from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, RoleType
from app.schemas.project import ProjectInDB, ProjectStatus, ProjectType, Currency


from app.services.project_service import (
    create_project_service,
    get_projects_service,
    get_project_by_id_service,
    update_project_service,
    delete_project_service
)


router = APIRouter(prefix="/projects", tags=["projects"])

@router.post("/", response_model=ProjectInDB, status_code=status.HTTP_201_CREATED)
async def create_project(
    name: str = Form(...),
    customer_email: Optional[List[str]] = Form(None),
    supplier_email: Optional[List[str]] = Form(None),
    architect_email: Optional[List[str]] = Form(None),
    project_type: ProjectType = Form(...),
    currency: Optional[Currency] = Form(None),
    estimated_budget: Optional[float] = Form(None),
    location: Optional[str] = Form(None),
    status: Optional[ProjectStatus] = Form(ProjectStatus.in_progress),
    description: Optional[str] = Form(None),
    filesBimModels: Optional[List[UploadFile]] = File(None),
    filesRenders: Optional[List[UploadFile]] = File(None),
    filesReports: Optional[List[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await create_project_service(
        db=db,
        current_user=current_user,
        name=name,
        project_type=project_type,
        currency=currency,
        estimated_budget=estimated_budget,
        location=location,
        status=status,
        description=description,
        customer_email=customer_email,
        supplier_email=supplier_email,
        architect_email=architect_email,
        files_bim=filesBimModels,
        files_renders=filesRenders,
        files_reports=filesReports,
    )


@router.get("/", response_model=List[ProjectInDB], status_code=status.HTTP_200_OK)
async def get_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_projects_service(db, current_user)


@router.get("/{project_id}", response_model=ProjectInDB)
async def get_project_by_id(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_project_by_id_service(db, current_user, project_id)




@router.patch("/{project_id}", response_model=ProjectInDB)
async def update_project(
    project_id: UUID,
    name: Optional[str] = Form(None),
    customer_email: Optional[List[str]] = Form(None),
    supplier_email: Optional[List[str]] = Form(None),
    architect_email: Optional[List[str]] = Form(None),
    project_type: Optional[ProjectType] = Form(None),
    currency: Optional[Currency] = Form(None),
    estimated_budget: Optional[float] = Form(None),
    location: Optional[str] = Form(None),
    status: Optional[ProjectStatus] = Form(None),
    description: Optional[str] = Form(None),
    additional_users_emails: Optional[str] = Form(None),  
    keep_bim_ids: Optional[str] = Form(None),
    keep_render_ids: Optional[str] = Form(None),
    keep_report_ids: Optional[str] = Form(None),
    filesBimModels: Optional[List[UploadFile]] = File(None),
    filesRenders: Optional[List[UploadFile]] = File(None),
    filesReports: Optional[List[UploadFile]] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    def parse_ids(s: Optional[str]) -> List[UUID]:
        return [UUID(x) for x in s.split(",") if x] if s else []

    update_data = {
        "name": name,
        "project_type": project_type,
        "currency": currency,
        "estimated_budget": estimated_budget,
        "location": location,
        "status": status,
        "description": description,
    }

    if additional_users_emails:
        emails = [e.strip() for e in additional_users_emails.split(",") if e.strip()]
        update_data["additional_users_emails"] = emails

    role_email_map = {
        RoleType.customer: customer_email or [],
        RoleType.supplier: supplier_email or [],
        RoleType.architect: architect_email or [],
    }

    return await update_project_service(
        db=db,
        current_user=current_user,
        project_id=project_id,
        update_data=update_data,
        role_email_map=role_email_map,
        keep_bim_ids=parse_ids(keep_bim_ids),
        keep_render_ids=parse_ids(keep_render_ids),
        keep_report_ids=parse_ids(keep_report_ids),
        files_bim=filesBimModels,
        files_renders=filesRenders,
        files_reports=filesReports,
    )

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await delete_project_service(db, current_user, project_id)


