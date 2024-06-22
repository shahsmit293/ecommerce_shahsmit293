"""empty message

Revision ID: 38dcb4452978
Revises: 863594b16839
Create Date: 2024-06-21 23:57:18.737198

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '38dcb4452978'
down_revision = '863594b16839'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('phones', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phonetype', sa.String(length=50), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('phones', schema=None) as batch_op:
        batch_op.drop_column('phonetype')

    # ### end Alembic commands ###
