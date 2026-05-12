import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from pydantic import EmailStr, ValidationError, parse_obj_as
import emails
from jose import jwt, JWTError
from jinja2 import Environment, FileSystemLoader
import os
from uuid import UUID

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Jinja2
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))

@dataclass
class EmailData:
    html_content: str
    subject: str

def render_template(template_name: str, context: dict) -> str:
    template = env.get_template(template_name)
    return template.render(context)
def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    assert settings.emails_enabled, "No configuration for email variables"
    logger.info(f"Preparing to send email to {email_to} with subject '{subject}'")
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )
    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    elif settings.SMTP_SSL:
        smtp_options["ssl"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD

    try:
        response = message.send(to=email_to, smtp=smtp_options)
        logger.info(f"Email sent to {email_to}, response status: {response.status_code}")
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}", exc_info=True)

def generate_reset_password_email(email_to: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    reset_link = f"http://localhost:3000/reset-password/form?token={token}"
    subject = f"{project_name} - Recover your password"
    html_content = render_template(
        "reset_password.html",
        {"project_name": project_name, "reset_link": reset_link}
    )
    return EmailData(html_content=html_content, subject=subject)

def generate_password_reset_token(email: str) -> str:
    try:
        parse_obj_as(EmailStr, email)
    except ValidationError:
        raise ValueError("Invalid email for token generation")
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode = {"sub": email, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_password_reset_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=settings.ALGORITHM)
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None
    
def generate_invitation_token(email: str, role: str) -> str:
    try:
        parse_obj_as(EmailStr, email)
    except ValidationError:
        raise ValueError("Invalid email for invitation token generation")
    expire = datetime.utcnow() + timedelta(hours=48)
    to_encode = {"sub": email, "role": role, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_invitation_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=settings.ALGORITHM)
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if not email or not role:
            return None
        return {"email": email, "role": role}
    except JWTError:
        return None
def generate_invitation_email(
    email_to: str, 
    token: str, 
    role: str, 
    inviter_name: str | None = None, 
    project_name: str | None = None
) -> EmailData:
    app_name = settings.PROJECT_NAME
    invite_link = f"http://localhost:3000/register?token={token}"  # Mejor usar variable de entorno

    if project_name:
        subject = f"You have been invited to the project {project_name} as {role}"
    elif inviter_name:
        subject = f"You have been invited to the agenda of architect {inviter_name} as {role}"
    else:
        subject = f"{app_name} - You've been invited as a {role}"

    html_content = render_template(
        "invite_user.html",
        {
            "project_name": project_name,
            "invite_link": invite_link,
            "role": role,
            "inviter_name": inviter_name,
        }
    )
    return EmailData(html_content=html_content, subject=subject)
async def invite_user_by_email(
    email: str, 
    role: str, 
    inviter_name: str | None = None, 
    project_name: str | None = None
) -> None:
    logger.info(f"Generating invitation for {email} with role {role}")
    token = generate_invitation_token(email, role)
    logger.info(f"Generated token: {token}")
    email_data = generate_invitation_email(
        email, token, role, inviter_name=inviter_name, project_name=project_name
    )
    logger.info(f"Generated email data. Subject: {email_data.subject}")
    send_email(email_to=email, subject=email_data.subject, html_content=email_data.html_content)
def generate_material_list_notification_email(
    email_to: str,
    project_name: str | None,
    project_id: UUID,
) -> EmailData:
    app_name = settings.PROJECT_NAME
    list_link = f"http://localhost:3000/material-list/project/{project_id}"
    subject = f"You have a new bill of materials to budget for {project_name or app_name}"

    html_content = render_template(
        "material_list_notification.html",
        {
            "project_name": project_name,
            "list_link": list_link,
        }
    )
    return EmailData(html_content=html_content, subject=subject)
