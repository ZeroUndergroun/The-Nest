"""add description and petition fields to announcements

Revision ID: g2h3i4j5k6l7
Revises: f1a2b3c4d5e6
Create Date: 2026-05-27 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'g2h3i4j5k6l7'
down_revision: Union[str, None] = 'f1a2b3c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('announcements', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('announcements', sa.Column('is_approved', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('announcements', sa.Column('submitted_by', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('announcements', 'submitted_by')
    op.drop_column('announcements', 'is_approved')
    op.drop_column('announcements', 'description')
