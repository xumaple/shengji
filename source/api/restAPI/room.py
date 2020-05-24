import flask
from api import app
from api.model import db
from api.restAPI.game import initialize_game
import time

NUM_HEARTS = 10

def getHeartbeatNum(num_players):
    if num_players == 1:
        return NUM_HEARTS
    return (num_players - 1) * NUM_HEARTS

@app.route('/api/v1/room/<room>/heartbeat/', methods= ['GET'])
def heart(room):
    user = flask.session.get('user')
    if user is None:
        user = secrets.token_hex(8)
        print('user was none')
        flask.session['user'] = user
    curr = int(time.time())
    print('heart', user, curr)

    if db.child('games').child(room).child('players').child(user).get().val() is None:
        context = {'disconnected': True}
        return flask.jsonify(**context)

    players = list(db.child('games').child(room).child('players').shallow().get().val())
    heartbeats = db.child('heartbeats')
    heartbeats.child(user).set(curr)
    for key in players: 
        if key != user:
            t = db.child('heartbeats').child(key).get().val()
            if t is not None and curr - t > NUM_HEARTS:
                print(key, 'disconnected', curr, t)
                game_state = db.child('games').child(room).child('state').get().val()
                if game_state == 'waiting':
                    db.child('heartbeats').child(key).remove()
                    db.child('games').child(room).child('players').child(key).remove()

    context = {}
    return flask.jsonify(**context)

@app.route('/api/v1/room/<room>/ready/', methods= ['GET'])
def ready(room):
    print('hi')
    user = flask.session.get('user')
    if user is None:
        user = secrets.token_hex(8)
        print('user was none')
        flask.session['user'] = user

    db.child('games').child(room).child('players').child(user).child('ready').set(True)

    players = db.child('games').child(room).child('players').shallow().get().val()
    if len(players) >= 4:
        all_ready = True
        for key in players:
            if not db.child('games').child(room).child('players').child(key).child('ready').get().val():
                all_ready = False
                break
        if all_ready:
            initialize_game()

    context = {}
    return flask.jsonify(**context)

@app.route('/api/v1/room/<room>/notready/', methods= ['GET'])
def not_ready(room):
    print('bye')
    user = flask.session.get('user')
    if user is None:
        user = secrets.token_hex(8)
        print('user was none')
        flask.session['user'] = user

    db.child('games').child(room).child('players').child(user).child('ready').set(False)
    

    context = {}
    return flask.jsonify(**context)

def leave(room):
    print('tears')
    user = flask.session.get('user')
    if user is None:
        user = secrets.token_hex(8)
        print('user was none')
        flask.session['user'] = user

    db.child('games').child(room).child('players').child(user).remove()
    

    context = {}
    return flask.jsonify(**context)