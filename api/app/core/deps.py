from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.config import settings
from app.models.user import User  
from app.core.database import get_db  
from uuid import UUID
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

from sqlalchemy.orm import selectinload
from app.models.role import Role  
from sqlalchemy.orm import selectinload, load_only

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = UUID(user_id_str)
    except (JWTError, ValueError):
        raise credentials_exception

    result = await db.execute(
        select(User)
        .options(
            load_only(User.id, User.email, User.type, User.role_id, User.first_name, User.last_name),
            selectinload(User.role).selectinload(Role.permissions)
        )
        .where(User.id == user_id)
    )
    user = result.scalars().first()

    if user is None:
        raise credentials_exception

    return user
async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

