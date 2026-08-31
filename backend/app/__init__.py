from flask import Flask
from flask_cors import CORS

from .routes.api import api

def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object('app.config.Settings')
    CORS(app, resources={r'/api/*': {'origins': '*'}})
    app.register_blueprint(api, url_prefix='/api')
    return app
