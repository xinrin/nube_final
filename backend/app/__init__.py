from flask import Flask
from flasgger import Swagger
from flask_cors import CORS
from .db.db_connection import init_db
from .routes.user_routes import user_bp
from .routes.session_routes import session_bp
from .routes.reportes_routes import reportes_bp
from .routes.usuarios_bp import usuarios_bp

def create_app():
    app = Flask(__name__)
    # Habilitar CORS para todas las rutas
    CORS(app)
    app.config.from_object('app.config.Config')
    swagger = Swagger(app)

    # Initialize the database connection
    init_db(app)

    # Register blueprints for different routes
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(session_bp, url_prefix='/session')
    app.register_blueprint(reportes_bp, url_prefix='/reportes')
    app.register_blueprint(usuarios_bp, url_prefix='/usuarios')

    return app
