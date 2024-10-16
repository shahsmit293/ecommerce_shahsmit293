"""empty message

Revision ID: 2cf84f1dc2e0
Revises: da967d6aa098
Create Date: 2024-10-12 17:59:56.923813

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2cf84f1dc2e0'
down_revision = 'da967d6aa098'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('phones', schema=None) as batch_op:
        batch_op.alter_column('IMEI',
               existing_type=sa.INTEGER(),
               type_=sa.String(length=20),
               existing_nullable=True)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('phones', schema=None) as batch_op:
        batch_op.alter_column('IMEI',
               existing_type=sa.String(length=20),
               type_=sa.INTEGER(),
               existing_nullable=True)

    # ### end Alembic commands ###
