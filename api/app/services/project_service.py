import logging
from typing import List, Optional
from uuid import UUID
from sqlalchemy import or_, select, delete
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models import Project, ProjectFile, User, ArchitectRole, SupplierRole, CustomerRole
from app.models.invitation import Invitation, InvitationStatus
from app.models.user import RoleType
from app.schemas.project import FileType, ProjectInDB
from app.schemas.invitation import InvitationOutWithUser
from app.services.minio_client import upload_file_to_minio_async
from app.services.invitations_service import create_invitation
from app.services.permissions import check_permission
from sqlalchemy import not_, or_

logger = logging.getLogger(__name__)

async def _assign_accepted_users_to_project(db: AsyncSession, project: Project):
    accepted_invitations = (await db.execute(
        select(Invitation)
        .where(
            Invitation.project_id == project.id,
            Invitation.status == InvitationStatus.accepted
        )
        .options(selectinload(Invitation.user))
    )).scalars().all()

    for invitation in accepted_invitations:
        user = invitation.user
        if not user:
            continue

        if invitation.role == RoleType.customer:
            exists = await db.execute(
                select(CustomerRole).where(
                    CustomerRole.user_id == user.id,
                    CustomerRole.projects.any(Project.id == project.id)
                )
            )
            if not exists.scalars().first():
                role = CustomerRole(user_id=user.id)
                role.projects.append(project)
                db.add(role)

        elif invitation.role == RoleType.supplier:
            exists = await db.execute(
                select(SupplierRole).where(
                    SupplierRole.user_id == user.id,
                    SupplierRole.projects.any(Project.id == project.id)
                )
            )
            if not exists.scalars().first():
                role = SupplierRole(user_id=user.id)
                role.projects.append(project)
                db.add(role)

        elif invitation.role == RoleType.architect:
            exists = await db.execute(
                select(ArchitectRole).where(
                    ArchitectRole.user_id == user.id,
                    ArchitectRole.projects.any(Project.id == project.id)
                )
            )
            if not exists.scalars().first():
                role = ArchitectRole(user_id=user.id)
                role.projects.append(project)
                db.add(role)

async def create_project_service(
    db: AsyncSession,
    current_user: User,
    name: str,
    project_type,
    currency,
    estimated_budget,
    location,
    status,
    description,
    customer_email: Optional[List[str]],
    supplier_email: Optional[List[str]],
    architect_email: Optional[List[str]],
    files_bim: Optional[List[UploadFile]],
    files_renders: Optional[List[UploadFile]],
    files_reports: Optional[List[UploadFile]],
) -> ProjectInDB:
    await check_permission(db, current_user, "create_project")

    db_project = Project(
        name=name,
        project_type=project_type,
        currency=currency,
        estimated_budget=estimated_budget,
        location=location,
        status=status,
        description=description,
        created_by_id=current_user.id,
    )

    db.add(db_project)
    await db.flush()
    await db.refresh(db_project)

    role_email_map = {
        RoleType.customer: customer_email or [],
        RoleType.supplier: supplier_email or [],
        RoleType.architect: [e for e in (architect_email or []) if e != current_user.email],
    }

    all_invitations = await _send_invitations(db, db_project, current_user, role_email_map)

    await _attach_files(db, db_project.id, files_bim, FileType.bim_model)
    await _attach_files(db, db_project.id, files_renders, FileType.renders)
    await _attach_files(db, db_project.id, files_reports, FileType.reports)
    await _assign_accepted_users_to_project(db, db_project)

    await db.commit()

    project_result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.invitations).joinedload(Invitation.user),
            selectinload(Project.customers),
            selectinload(Project.architects),
            selectinload(Project.suppliers),
            selectinload(Project.files),
        )
        .where(Project.id == db_project.id)
    )
    project_loaded = project_result.scalars().first()

    if not project_loaded:
        raise HTTPException(status_code=404, detail="Project not found")
    sent_inv_query = await db.execute(
        select(Invitation)
        .options(selectinload(Invitation.user))
        .where(
            Invitation.project_id == project_loaded.id,
            Invitation.invited_by_id == current_user.id,
        )
    )
    sent_invitations = sent_inv_query.scalars().all()
    sent_inv_out = [
    await InvitationOutWithUser.from_orm_async(db, inv)
    for inv in sent_invitations
]

    return ProjectInDB.from_orm_with_emails(
        project_orm=project_loaded,
        invitations=all_invitations,
        sent_invitations=sent_inv_out,
    )
async def _update_project_roles(db: AsyncSession, project: Project, role_email_map: dict):
    async def get_user_by_email(email: str):
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def create_role_instance(role_type: RoleType, user: User):
        if role_type == RoleType.customer:
            return CustomerRole(user=user)
        elif role_type == RoleType.architect:
            return ArchitectRole(user=user)
        elif role_type == RoleType.supplier:
            return SupplierRole(user=user)
        return None

    for role_type, emails in role_email_map.items():
        current_roles = []
        relation_list = None

        if role_type == RoleType.customer:
            current_roles = project.customers
            relation_list = project.customers
        elif role_type == RoleType.architect:
            current_roles = project.architects
            relation_list = project.architects
        elif role_type == RoleType.supplier:
            current_roles = project.suppliers
            relation_list = project.suppliers

        current_email_to_role = {r.user.email: r for r in current_roles if r.user and r.user.email}
        new_emails = set(emails)
        current_emails = set(current_email_to_role.keys())

        to_remove = current_emails - new_emails
        to_add = new_emails - current_emails

        for email in to_remove:
            role_instance = current_email_to_role[email]
            relation_list.remove(role_instance)
            await db.delete(role_instance)

        for email in to_add:
            user = await get_user_by_email(email)
            if user:
                new_role = await create_role_instance(role_type, user)
                if new_role:
                    relation_list.append(new_role)
                    db.add(new_role)

    await db.flush()
async def update_project_service(
    db: AsyncSession,
    current_user: User,
    project_id: UUID,
    update_data: dict,
    role_email_map: dict,
    keep_bim_ids: List[UUID],
    keep_render_ids: List[UUID],
    keep_report_ids: List[UUID],
    files_bim: Optional[List[UploadFile]],
    files_renders: Optional[List[UploadFile]],
    files_reports: Optional[List[UploadFile]],
) -> ProjectInDB:
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.customers).selectinload(CustomerRole.user),
            selectinload(Project.architects).selectinload(ArchitectRole.user),
            selectinload(Project.suppliers).selectinload(SupplierRole.user),
            selectinload(Project.files),
            selectinload(Project.invitations).joinedload(Invitation.user),
            selectinload(Project.invitations).joinedload(Invitation.invited_by),
        )
        .where(Project.id == project_id)
    )
    db_project = result.scalars().first()

    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    await check_permission(db, current_user, "edit_project", resource=db_project)

    for field, value in update_data.items():
        if value is not None and hasattr(db_project, field):
            setattr(db_project, field, value)

    await _update_project_roles(db, db_project, role_email_map)

    await _send_invitations(db, db_project, current_user, role_email_map)
   
    

    conditions_to_keep = []
    if keep_bim_ids:
        conditions_to_keep.append((ProjectFile.file_type == FileType.bim_model) & ProjectFile.id.in_(keep_bim_ids))
    if keep_render_ids:
        conditions_to_keep.append((ProjectFile.file_type == FileType.renders) & ProjectFile.id.in_(keep_render_ids))
    if keep_report_ids:
        conditions_to_keep.append((ProjectFile.file_type == FileType.reports) & ProjectFile.id.in_(keep_report_ids))

    if conditions_to_keep:
        delete_condition = not_(or_(*conditions_to_keep))
        await db.execute(
            delete(ProjectFile)
            .where(ProjectFile.project_id == db_project.id)
            .where(delete_condition)
        )

    await _attach_files(db, db_project.id, files_bim, FileType.bim_model)
    await _attach_files(db, db_project.id, files_renders, FileType.renders)
    await _attach_files(db, db_project.id, files_reports, FileType.reports)

    await _assign_accepted_users_to_project(db, db_project)

    await db.commit()

    updated_result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.customers).selectinload(CustomerRole.user),
            selectinload(Project.architects).selectinload(ArchitectRole.user),
            selectinload(Project.suppliers).selectinload(SupplierRole.user),
            selectinload(Project.files),
            selectinload(Project.invitations).joinedload(Invitation.user),
            selectinload(Project.invitations).joinedload(Invitation.invited_by),
        )
        .where(Project.id == project_id)
    )
    updated_project = updated_result.scalars().first()

    if not updated_project:
      raise HTTPException(status_code=404, detail="Project not found after update")

    return await build_project_in_db(updated_project, current_user)
    

async def get_projects_service(db: AsyncSession, current_user: User) -> List[ProjectInDB]:
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.customers).selectinload(CustomerRole.user),
            selectinload(Project.architects).selectinload(ArchitectRole.user),
            selectinload(Project.suppliers).selectinload(SupplierRole.user),
            selectinload(Project.files),
            selectinload(Project.invitations).joinedload(Invitation.user),
            selectinload(Project.invitations).joinedload(Invitation.invited_by),
        )
        .where(
            or_(
                Project.created_by_id == current_user.id,
                Project.customers.any(CustomerRole.user.has(User.id == current_user.id)),
                Project.suppliers.any(SupplierRole.user.has(User.id == current_user.id)),
                Project.architects.any(ArchitectRole.user.has(User.id == current_user.id)),
                Project.invitations.any(Invitation.email == current_user.email),
            )
        )
    )
    projects = result.scalars().all()
    for project in projects:
        invs = project.invitations
        logger.info(f"Proyecto {project.name} tiene invitaciones: {[inv.email for inv in invs]}")


    visible_projects = []
    for project in projects:
        try:
            await check_permission(db, current_user, "view_project", resource=project)
            visible_projects.append(project)
        except HTTPException:
            continue

    result_projects = []
    for project in visible_projects:
        project_in_db = await build_project_in_db(project, current_user)
        result_projects.append(project_in_db)
    return result_projects
async def get_project_by_id_service(
    db: AsyncSession,
    current_user: User,
    project_id: UUID,
) -> ProjectInDB:
    result = await db.execute(
        select(Project)
        .options(
            selectinload(Project.customers).selectinload(CustomerRole.user),
            selectinload(Project.architects).selectinload(ArchitectRole.user),
            selectinload(Project.suppliers).selectinload(SupplierRole.user),
            selectinload(Project.files),
            selectinload(Project.invitations).joinedload(Invitation.user),
            selectinload(Project.invitations).joinedload(Invitation.invited_by),
        )
        .where(Project.id == project_id)
    )
    project = result.scalars().first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await check_permission(db, current_user, "view_project", resource=project)
    return await build_project_in_db(project, current_user)
    

async def delete_project_service(
    db: AsyncSession,
    current_user: User,
    project_id: UUID,
):
    try:

        result = await db.execute(
            select(Project)
            .options(
                selectinload(Project.customers).selectinload(CustomerRole.user),
                selectinload(Project.architects).selectinload(ArchitectRole.user),
                selectinload(Project.suppliers).selectinload(SupplierRole.user),
                selectinload(Project.files),
            )
            .where(Project.id == project_id)
        )
        db_project = result.scalars().first()

        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")

        await check_permission(db, current_user, "delete_project", resource=db_project)

        await db.execute(
            delete(Invitation).where(Invitation.project_id == project_id)
        )

        await db.execute(
            delete(CustomerRole).where(CustomerRole.projects.any(Project.id == project_id))
        )
        await db.execute(
            delete(SupplierRole).where(SupplierRole.projects.any(Project.id == project_id))
        )
        await db.execute(
            delete(ArchitectRole).where(ArchitectRole.projects.any(Project.id == project_id))
        )

        await db.execute(
            delete(ProjectFile).where(ProjectFile.project_id == project_id)
        )

        await db.execute(
            delete(Project).where(Project.id == project_id)
        )

        await db.commit()
        logger.info(f"Project {project_id} deleted successfully (invitations also deleted)")

    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting project: {str(e)}"
        )


async def _send_invitations(
    db: AsyncSession,
    project: Project,
    current_user: User,
    role_email_map: dict,
) -> List[Invitation]:
    project_result = await db.execute(
        select(Project)
        .options(selectinload(Project.architects).selectinload(ArchitectRole.user))
        .where(Project.id == project.id)
    )
    project = project_result.scalars().first()

    existing_invitations = (await db.execute(
        select(Invitation)
        .where(Invitation.project_id == project.id)
        .options(selectinload(Invitation.user))
    )).scalars().all()

    existing_emails = {inv.email for inv in existing_invitations}

    for role, emails in role_email_map.items():
        for email in emails:
            if email not in existing_emails:
                await create_invitation(
                    email=email,
                    role=role,
                    db=db,
                    current_user=current_user,
                    project=project,
                )
                existing_emails.add(email) 

    all_invitations = (await db.execute(
        select(Invitation)
        .where(Invitation.project_id == project.id)
        .options(selectinload(Invitation.user))
    )).scalars().all()

    return all_invitations

async def _attach_files(
    db: AsyncSession,
    project_id: UUID,
    files: Optional[List[UploadFile]],
    file_type: FileType,
):
    if not files:
        return
    for file in files:
        content = await file.read()
        file_url = await upload_file_to_minio_async(content, file.filename, file.content_type)
        db_file = ProjectFile(
            project_id=project_id,
            filename=file.filename,
            original_name=file.filename,
            url=file_url,
            file_type=file_type,
        )
        db.add(db_file)
async def _send_invitations_async(db, project, invited_by, role_email_map):
    for role, emails in role_email_map.items():
        for email in emails:
            user = await db.execute(select(User).where(User.email == email))
            existing_user = user.scalars().first()

            existing_invitation = await db.execute(
                select(Invitation).where(
                    Invitation.project_id == project.id,
                    Invitation.email == email,
                )
            )
            if existing_invitation.scalars().first():
                continue  # Ya invitado

            if not existing_user:
                invitation = Invitation(
                    email=email,
                    project=project,
                    invited_by=invited_by,
                    role=role,
                    status=InvitationStatus.pending
                )
                db.add(invitation)
                await db.flush()

                await _send_invitations(db, project, invited_by, role_email_map)


async def build_project_in_db(
    project: Project,
    current_user: User,
) -> ProjectInDB:
    invitations_out = []
    sent_invitations_out = []

    for inv in project.invitations:
        try:
            inv_data = {
                "id": inv.id,
                "email": inv.email,
                "role": inv.role.value if hasattr(inv.role, 'value') else str(inv.role),
                "status": inv.status.value,
                "create_date": inv.create_date,
                "invited_by_id": inv.invited_by_id,
                "user": {
                    "id": inv.user.id,
                    "email": inv.user.email,
                    "first_name": inv.user.first_name,
                    "last_name": inv.user.last_name
                } if inv.user else None
            }
            invitations_out.append(inv_data)
            if inv.invited_by_id == current_user.id and inv.email:
                sent_invitations_out.append(inv_data)
        except Exception as e:
            logger.error(f"Error processing invitation {inv.id}: {str(e)}")
            continue

    def convert_role(role):
        return {
            "id": role.user.id,
            "email": role.user.email,
            "first_name": role.user.first_name,
            "last_name": role.user.last_name
        }

    invited_architect_emails = {
        inv["email"] for inv in invitations_out
        if inv["role"] == "architect" and inv["status"] in ["pending", "accepted"]
    }
    invited_customer_emails = {
        inv["email"] for inv in invitations_out
        if inv["role"] == "customer" and inv["status"] in ["pending", "accepted"]
    }
    invited_supplier_emails = {
        inv["email"] for inv in invitations_out
        if inv["role"] == "supplier" and inv["status"] in ["pending", "accepted"]
    }

    real_architect_emails = {
        r.user.email for r in project.architects if r.user and r.user.email
    }
    real_customer_emails = {
        r.user.email for r in project.customers if r.user and r.user.email
    }
    real_supplier_emails = {
        r.user.email for r in project.suppliers if r.user and r.user.email
    }

    architect_emails_combined = list(invited_architect_emails | real_architect_emails)
    customer_emails_combined = list(invited_customer_emails | real_customer_emails)
    supplier_emails_combined = list(invited_supplier_emails | real_supplier_emails)

    return ProjectInDB(
        id=project.id,
        name=project.name,
        project_type=project.project_type,
        currency=project.currency,
        estimated_budget=project.estimated_budget,
        location=project.location,
        status=project.status,
        description=project.description,
        created_at=project.create_date,
        updated_at=project.update_date,
        architects=[convert_role(r) for r in project.architects],
        customers=[convert_role(r) for r in project.customers],
        suppliers=[convert_role(r) for r in project.suppliers],
        invitations=invitations_out or [],
        sent_invitations=sent_invitations_out or [],
        architectEmail=architect_emails_combined or [],
        customerEmail=customer_emails_combined or [],
        supplierEmail=supplier_emails_combined or [],
        files=[
            {
                "id": f.id,
                "filename": f.filename,
                "url": f.url,
                "file_type": f.file_type,
                "original_name": f.original_name,
            } for f in project.files
        ] or [],
    )
