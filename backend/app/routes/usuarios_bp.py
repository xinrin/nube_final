from flask import Blueprint, jsonify
from flask_cors import cross_origin
from app.db.db_connection import get_db_connection

usuarios_bp = Blueprint('usuarios_bp', __name__)

@usuarios_bp.route('/obtener', methods=['GET'])
@cross_origin()
def obtener_usuarios():
    """
    Retorna una lista de todos los nombres de usuario distintos registrados en la base de datos.
    """
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        cursor.execute("SELECT DISTINCT usuario FROM Usuarios")
        resultados = cursor.fetchall()
        usuarios = [fila[0] for fila in resultados]
        return jsonify({"usuarios": usuarios})
    else:
        return jsonify({"message": "Database connection failed"}), 500
