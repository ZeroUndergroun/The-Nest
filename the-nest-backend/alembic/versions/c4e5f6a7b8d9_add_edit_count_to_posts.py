"""add edit_count to posts

Revision ID: c4e5f6a7b8d9
Revises: a1b2c3d4e5f6
Create Date: 2026-05-12 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c4e5f6a7b8d9'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('edit_count', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    op.drop_column('posts', 'edit_count')
