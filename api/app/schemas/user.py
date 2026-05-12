from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional
from app.models.user import RoleType
import re
from typing import Annotated
from uuid import UUID

def validate_password(pw: str):
    if len(pw) < 8:
        raise ValueError("Password must be at least 8 characters long")
    if not re.search(r"[A-Z]", pw):
        raise ValueError("Password must include at least one uppercase letter")
    if not re.search(r"[a-z]", pw):
        raise ValueError("Password must include at least one lowercase letter")
    if not re.search(r"\d", pw):
        raise ValueError("Password must include at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", pw):
        raise ValueError("Password must include at least one special character")

 

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirm_password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: RoleType 
    entity_type: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None

    @model_validator(mode='before')
    def check_passwords_match(cls, values):
        pw = values.get('password')
        cpw = values.get('confirm_password')
        if pw != cpw:
            raise ValueError("Passwords do not match")
        validate_password(pw)
        return values

class UserPublic(BaseModel):
    id: UUID  
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role_name: str  
    disabled: Optional[bool] = False
    

    class Config:
        from_attributes = True
from pydantic import BaseModel

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    entity_type: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    is_completed: Optional[bool] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserInDB(BaseModel):
    id: UUID  
    email: EmailStr
    hashed_password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role_name: str  
    disabled: Optional[bool] = False
    entity_type: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    is_completed: Optional[bool] = False

    class Config:
        from_attributes = True

class NewPassword(BaseModel):
    token: str
    new_password: Annotated[str, Field(min_length=6)]
    confirm_password: Annotated[str, Field(min_length=6)]

    @model_validator(mode='before')
    def passwords_match(cls, values):
        new_password = values.get('new_password')
        confirm_password = values.get('confirm_password')
        if new_password != confirm_password:
            raise ValueError('Las contraseñas no coinciden')
        return values

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_completed: Optional[bool] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    entity_type: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8) 
    @model_validator(mode='before')
    def validate_password_if_present(cls, values):
        pw = values.get('password')
        if pw:
            validate_password(pw)
        return values

class UserRead(BaseModel):
    id: UUID
    email: str
    first_name: str
    last_name: str
    is_completed: bool
    role_id: Optional[UUID]
    role_name: Optional[str] = None
    entity_type: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        base = super().from_orm(obj).dict()
        base["role_name"] = obj.type.value if obj.type else None
        
        if obj.supplier_role:
            base["phone"] = obj.supplier_role.phone
            base["address"] = obj.supplier_role.address
            base["company"] = obj.supplier_role.company
        elif obj.architect_role:
            base["entity_type"] = obj.architect_role.entity_type
        elif obj.customer_role:
            base["phone"] = obj.customer_role.phone
            base["address"] = obj.customer_role.address

        
        return cls(**base)
class UserUpdateFull(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    password: Optional[str] = Field(None, min_length=8)
    is_completed: bool
    role: RoleType

    @model_validator(mode='before')
    def validate_password_if_present(cls, values):
        pw = values.get('password')
        if pw:
            validate_password(pw)
        return values
class InvitationRequest(BaseModel):
    email: EmailStr
    role: str 