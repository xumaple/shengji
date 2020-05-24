import flask
from api import app
from api.model import db
import time

def initialize_game(): 
    db.child('games').child(room).child('state').set('playing')

@app.route('/api/v1/room/<room>/game/call', methods= ['GET'])
def call_trump(room):
    curr = time.time()
    db.child('games').child(room).child('trump').child(curr).set({'player': 0, 'card': 1, 'quantity': 1})
    pass
