from api import app
import flask

@app.route("/")
def display():
    context = {
        'jsfile': 'main_bundle.js',
    }
    return flask.render_template("base.html", **context)


