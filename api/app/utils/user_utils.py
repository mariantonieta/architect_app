from app.models import User
from app.schemas.user import UserRead

async def build_user_read(user: User, db) -> UserRead:
    return UserRead(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_completed=user.is_completed,
        disabled=user.disabled,
        created_at=user.create_date,
        updated_at=user.update_date,
        role_id=user.role_id,
        role_name=user.role.type if user.role else None,
        entity_type=user.architect_role.entity_type if user.architect_role else None,
        phone=(
            user.supplier_role.phone
            if user.supplier_role
            else user.customer_role.phone
            if user.customer_role
            else None
        ),
        address=(
            user.supplier_role.address
            if user.supplier_role
            else user.customer_role.address
            if user.customer_role
            else None
        ),
        company=user.supplier_role.company if user.supplier_role else None,
    )
