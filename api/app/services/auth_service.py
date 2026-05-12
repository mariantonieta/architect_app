from fastapi import HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import EmailStr

from app.services.user_services import get_user_by_email
from app.utils.utils import (
    generate_password_reset_token,
    generate_reset_password_email,
    send_email,
    verify_password_reset_token,
)
from app.core.security import get_password_hash


async def send_password_reset(email: EmailStr, db: AsyncSession, background_tasks: BackgroundTasks):
    user = await get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = generate_password_reset_token(email=user.email)
    email_data = generate_reset_password_email(email_to=user.email, token=token)

    background_tasks.add_task(
        send_email,
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return {"msg": "Recovery email sent"}


async def reset_user_password(token: str, new_password: str, db: AsyncSession):
    email = verify_password_reset_token(token=token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    user = await get_user_by_email(db, email=email)
    if not user or user.disabled:
        raise HTTPException(status_code=400, detail="User not found or inactive")

    user.hashed_password = get_password_hash(new_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {"message": "Password updated successfully"}
