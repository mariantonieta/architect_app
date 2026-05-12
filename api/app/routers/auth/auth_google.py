from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.auth_google_service import get_or_create_google_user
from app.services.user_services import complete_user_registration
from app.models import User
from uuid import UUID
from app.core.oauth import oauth
from app.core.security import create_access_token
from sqlalchemy.future import select

router = APIRouter(prefix="/auth/google", tags=["auth-google"])

@router.get("/login")
async def login_via_google(request: Request):
    redirect_uri = request.url_for('auth_google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def auth_google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = await oauth.google.userinfo(token=token)

    user = await get_or_create_google_user(user_info, db)

    if not user.is_completed:
        return RedirectResponse(f"http://localhost:3000/auth/google/complete-registration?user_id={user.id}")

    access_token = create_access_token(subject=str(user.id))
    return RedirectResponse(f"http://localhost:3000/auth/google/callback?access_token={access_token}")

@router.post("/complete-registration")
async def complete_registration(
    user_id: UUID = Form(...),
    role: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    architect_info: str = Form(None),
    customer_phone: str = Form(None),
    customer_address: str = Form(None),
    supplier_phone: str = Form(None),
    supplier_address: str = Form(None),
    company: str = Form(None),
    db: AsyncSession = Depends(get_db)
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    data = {
        "role": role,
        "password": password,
        "architect_info": architect_info,
        "customer_phone": customer_phone,
        "customer_address": customer_address,
        "supplier_phone": supplier_phone,
        "supplier_address": supplier_address,
        "company": company
    }

    try:
        token = await complete_user_registration(user, data, db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return JSONResponse({"access_token": token})
