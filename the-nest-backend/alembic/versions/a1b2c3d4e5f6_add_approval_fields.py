"""add is_approved and is_admin to users

Revision ID: a1b2c3d4e5f6
Revises: 2275d7ad82a3
Create Date: 2026-05-11 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '2275d7ad82a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Existing staff accounts grandfathered in as approved
    op.add_column('users', sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('users', 'is_admin')
    op.drop_column('users', 'is_approved')
