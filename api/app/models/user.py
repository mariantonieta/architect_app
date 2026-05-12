from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship, foreign
from sqlalchemy.dialects.postgresql import ENUM as PGEnum, UUID
from app.models.entity import EntityAbstract
from app.schemas.enum import RoleType
from app.models.architect_customer import architect_customer
from app.models.architect_supplier import architect_supplier
from app.models.architect_architect import architect_architect
from app.models.invitation import Invitation 

role_enum = PGEnum(RoleType, name='roletype', create_type=False)

class User(EntityAbstract):
    __tablename__ = "user"

    type = Column(role_enum, nullable=False, default=RoleType.pending)
    email = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    is_completed = Column(Boolean, default=False)

    role_id = Column(UUID, ForeignKey("role.id"), nullable=False)
    role = relationship("Role", back_populates="users")

    architect_role = relationship(
        "ArchitectRole", uselist=False, back_populates="user",
        cascade="all, delete-orphan", passive_deletes=True
    )
    customer_role = relationship(
        "CustomerRole", uselist=False, back_populates="user",
        cascade="all, delete-orphan", passive_deletes=True
    )
    supplier_role = relationship(
        "SupplierRole", uselist=False, back_populates="user",
        cascade="all, delete-orphan", passive_deletes=True
    )

    customers = relationship(
        "User",
        secondary=architect_customer,
        primaryjoin=lambda: foreign(User.id) == architect_customer.c.architect_id,
        secondaryjoin=lambda: foreign(User.id) == architect_customer.c.customer_id,
        backref="architects_customers",
        overlaps="supplier_role"
    )
    suppliers = relationship(
        "User",
        secondary=architect_supplier,
        primaryjoin=lambda: foreign(User.id) == architect_supplier.c.architect_id,
        secondaryjoin=lambda: foreign(User.id) == architect_supplier.c.supplier_id,
        backref="architects_suppliers",
        overlaps="customer_role"
    )
    associated_architects = relationship(
        "User",
        secondary=architect_architect,
        primaryjoin=lambda: foreign(User.id) == architect_architect.c.architect_id,
        secondaryjoin=lambda: foreign(User.id) == architect_architect.c.associated_architect_id,
        backref="architects_architects",
        overlaps="customers,suppliers"
    )

    invitations = relationship(
        "Invitation",
        back_populates="user",
        foreign_keys=[Invitation.user_id]
    )

    @property
    def role_name(self) -> str:
        return self.role.name if self.role else "Unknown"
