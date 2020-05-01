from api import app
import flask

@app.route("/")
def display():
    context = {
        'jsfile': 'room_bundle.js',
    }
    return flask.render_template("base.html", **context)


