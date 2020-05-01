"""Database API."""

from api import app, db_uri
from flask_sqlalchemy import SQLAlchemy
from flask_sqlalchemy.model import BindMetaMixin, Model
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from enum import Enum

class NoNameMeta(BindMetaMixin, DeclarativeMeta):
    pass
# Configure MySQL connection to Flask app
db = SQLAlchemy(app, model_class=declarative_base(
    cls=Model, metaclass=NoNameMeta, name='Model'))
# engine = SQLAlchemy.create_engine(db_uri)

event_id = "0"
trait_id = "0"

tables = {}

# class Table(db.Model):
#     def __init__(self):
#         self.deleted = False

#     def drop_table(self):
#         if not self.deleted:
#             self.__table__.drop(db.get_engine())
#             self.deleted = True

class EventPhase(Enum):
    configure = 1
    review = 2

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(256), nullable=False)
    phase = db.Column(db.Enum(EventPhase), nullable=False)
    organizer_username = db.Column(db.String(256), db.ForeignKey('organizers.username'), nullable=False) # TODO: foreign key here

    def __repr__(self):
        return f"event('{self.id}', '{self.name}', '{self.organizer_username}')"
tables["events"] = Event

class Organizers(db.Model):
    __tablename__ = 'organizers'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(256), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    full_name = db.Column(db.String(256))
    events = db.relationship(Event, backref='organizers', lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"organizers('{self.id}', '{self.username}', '{self.password}', '{self.full_name}')"
tables["organizers"] = Organizers

def add_choices_table(event_id):
    attributes = {
        '__tablename__': 'choices_{}'.format(event_id),
        'id': db.Column(db.Integer, primary_key=True, nullable=False),
        'name': db.Column(db.String(256), nullable=False),
        'trait_id': db.Column(db.Integer, db.ForeignKey('traits_{}.id'.format(event_id)), nullable=False),
        '__repre__': lambda self: f"choices('{self.id}', '{self.name}', '{self.trait_id}')",
    }
    _add_table_helper(attributes)

# class Nonconstraints(db.Model):
#     __tablename__ = 'nonconstraints_' + event_id

#     id = db.Column(db.Integer, primary_key=True, nullable=False)
#     answer = db.Column(db.String(256), nullable=False)
#     trait_id = db.Column(db.Integer, db.ForeignKey('traits_{}.id'.format(event_id)), primary_key=True, nullable=False) # traits.id should be Traits_<Events.id>.id
#     member_id = db.Column(db.String(256), db.ForeignKey('members_{}.id'.format(event_id))) # members.id should be Members.id_<Events.id>.id
#     leader_id = db.Column(db.Integer, db.ForeignKey('leaders_{}.id'.format(event_id))) # leaders.id should be Leaders.id_<Events.id>.id

#     def __repr__(self):
#         return f"nonconstraints('{self.name}', '{self.trait_id}', '{self.member_id}', '{self.leader_id}')"
# tables["nonconstraints_0"] = Nonconstraints

def add_groups_table(event_id, list_of_groups):
    # Create dictionary for groups table
    attributes = {
        '__tablename__': 'groups_{}'.format(event_id),
        'id': db.Column(db.Integer, primary_key=True),
    }

    # Add columns for the number of groups
    for i in range(len(list_of_groups)):
        column = db.Column(db.String(256))
        attributes['group_{}'.format(str(i))] = column
    
    # Convert the dictionary to a table
    _add_table_helper(attributes)


def add_members_table(event_id):
        #create dictionary to input into table creator
    attributes = {
        '__tablename__': 'members_{}'.format(event_id), 
        'id': db.Column(db.String(256), primary_key=True, nullable=False), 
        'name': db.Column(db.String(256), nullable=False), 
        # "non_constraints": db.relationship(tables['nonconstraints_{}'.format(event_id)], backref='members', lazy=True, cascade="all, delete-orphan"), 
        '__repr__': lambda self: self.id + self.name,
    }
    #for every trait find the formType and add the trait as a column to the dictionary
    for trait in db.session.query(tables['traits_{}'.format(event_id)]).all():
        column = db.Column(db.Integer)
        if trait.form_type == 2:
            column = db.Column(db.Float)
        if trait.form_type == 3:
            column = db.Column(db.String(256))
        attributes["trait_{}".format(str(trait.id))] = column
    #input the dictionary to table creator
    _add_table_helper(attributes)

# #not actually gonna be here once restAPI is done
# class Leaders(db.Model):
#     __tablename__ = 'leaders_' + event_id

#     id = db.Column(db.Integer, primary_key=True, nullable=False)
#     name = db.Column(db.String(256), nullable=False)
#     non_constraints = db.relationship(Nonconstraints, backref='leaders', lazy=True, cascade="all, delete-orphan")

#     def __repr__(self):
#         return f"choices('{self.id}', '{self.name}', '{self.trait_}')"
# tables["leaders_" + event_id] = Leaders

#not actually gonna be here once restAPI is done

def add_traits_table(event_id):
    attributes = {
        '__tablename__': 'traits_{}'.format(event_id),
        'id': db.Column(db.Integer, primary_key=True, nullable=False),
        'name': db.Column(db.String(256)),
        'question': db.Column(db.String(256)),
        'is_constraint': db.Column(db.Boolean),
        'form_type': db.Column(db.Integer),
        'context': db.Column(db.Float),
        'choices': db.relationship(tables['choices_{}'.format(event_id)], backref='traits_{}.id'.format(event_id), lazy=True, cascade="all, delete-orphan"),
        '__repre__': lambda self: f"traits('{self.id}', '{self.name}', '{self.question}', '{self.is_constraint}', '{self.form_type}', '{self.context}')",
    }
    _add_table_helper(attributes)

def create_all():
    db.create_all()
    db.session.commit()

create_all()
db.metadata.bind = db.get_engine()

def drop_table_if_exists(tb_name):
    dropped = tables.pop(tb_name, None)
    if dropped is not None:
        dropped.__table__.drop(db.get_engine())
        data = db.metadata
        data.tables = data.tables.copy()
        data.tables.pop(tb_name)
        db.session.commit()

def _add_table_helper(attributes):
    tb_name = attributes['__tablename__']
    drop_table_if_exists(tb_name)
    table = type(tb_name, (db.Model,), attributes)
    tables[tb_name] = table