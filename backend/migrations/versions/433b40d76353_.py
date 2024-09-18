"""empty message

Revision ID: 433b40d76353
Revises: aae3142b3529
Create Date: 2024-09-07 19:04:37.596651

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '433b40d76353'
down_revision = 'aae3142b3529'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('subscribed',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_email', sa.String(length=120), nullable=True),
    sa.Column('meeting_link', sa.String(), nullable=True),
    sa.Column('passcode', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['user_email'], ['user.email'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('subscribed')
    # ### end Alembic commands ###
