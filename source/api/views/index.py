from api import app
from api.model import db, auth
import flask
import secrets
import time

room = 'da71e1ee'

@app.route("/")
def display():
    # user = firebase.auth().currentUser;
    user = flask.session.get('user')
    if user is None:
        user = secrets.token_hex(8)
        print('user was none')
        flask.session['user'] = user


    if db.child('games').child(room).child('players').child(user).get().val() is None:
        db.child('games').child(room).child('players').child(user).set({'entry': time.time(), 'ready': False})
    context = {
        'jsfile': 'room_bundle.js',
        'user': user,
    }
    return flask.render_template("base.html", **context)


