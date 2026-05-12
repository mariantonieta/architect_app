from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import AsyncGenerator
from app.core.config import settings  
from sqlalchemy import create_engine  

DATABASE_URL = f"postgresql+asyncpg://{settings.USER_DB}:{settings.USER_PASSWORD}@{settings.HOST_DB}:{settings.PORT_DB}/{settings.NAME_DB}"
SYNC_DATABASE_URL = f"postgresql://{settings.USER_DB}:{settings.USER_PASSWORD}@{settings.HOST_DB}:{settings.PORT_DB}/{settings.NAME_DB}"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()  # <-- Aquí defines Base una sola vez

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)
SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

def get_sync_db():
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()
