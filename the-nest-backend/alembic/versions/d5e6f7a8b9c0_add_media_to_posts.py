"""add media_url and media_type to posts

Revision ID: d5e6f7a8b9c0
Revises: c4e5f6a7b8d9
Create Date: 2026-05-13 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd5e6f7a8b9c0'
down_revision: Union[str, None] = 'c4e5f6a7b8d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('media_url', sa.String(), nullable=True))
    op.add_column('posts', sa.Column('media_type', sa.String(10), nullable=True))


def downgrade() -> None:
    op.drop_column('posts', 'media_type')
    op.drop_column('posts', 'media_url')
