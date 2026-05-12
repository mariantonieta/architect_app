from fastapi import FastAPI
from app.routers import material_list, project, user, permission, invitations
from app.routers.auth import auth, auth_google
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from app.routers import material_list_item_quoted


app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(user.router, prefix="/users")
app.include_router(auth.router, prefix="/auth")
app.include_router(auth_google.router)
app.include_router(project.router)
app.include_router(permission.router)
app.include_router(invitations.router)

app.include_router(material_list.router)
app.include_router(material_list_item_quoted.router)