from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr

from app.schemas.user import Token
from app.schemas import Message, NewPassword, UserResponse

from app.services.user_services import authenticate_user
from app.services.auth_service import send_password_reset, reset_user_password  

from app.core.security import create_access_token
from app.core.config import settings
from app.core.database import get_db

router = APIRouter(tags=["auth"])

# --- LOGIN ---
@router.post("/login", response_model=Token)
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), 
        expires_delta=access_token_expires
    )

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role_name,
        entity_type=user.entity_type,
        phone=user.phone,
        company=user.company,
        address=user.address,
        is_completed=user.is_completed,
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


# --- PASSWORD RECOVERY ---
@router.post("/password-recovery/{email}")
async def recover_password(
    email: EmailStr,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    return await send_password_reset(email, db, background_tasks)


# --- RESET PASSWORD ---
@router.post("/reset-password/", response_model=Message)
async def reset_password_api(
    body: NewPassword,
    db: AsyncSession = Depends(get_db)
):
    return await reset_user_password(token=body.token, new_password=body.new_password, db=db)
