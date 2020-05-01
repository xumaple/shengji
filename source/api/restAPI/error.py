"""Error Handling."""
from flask import jsonify
import api


class InvalidUsage(Exception):
    """Invalid Usage Class."""

    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        """Initialize class."""
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        """Convert to dictionary."""
        r_v = dict(self.payload or ())
        r_v['message'] = self.message
        r_v['status_code'] = self.status_code
        return r_v


@api.app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    """Error handler."""
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response
