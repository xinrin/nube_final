import datetime
from flasgger import swag_from
from flask_cors import cross_origin
from flask import Blueprint, request, jsonify
from app.db.db_connection import get_db_connection
import sys

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/validar_usuario', methods=['POST'])
@cross_origin() 
@swag_from({
    'tags': ['Usuario'],
    'description': 'Valida las credenciales del usuario',
    'parameters': [
        {
            'name': 'usuario',
            'in': 'formData',
            'type': 'string',
            'required': True,
            'description': 'Nombre del usuario'
        },
        {
            'name': 'contrasena',
            'in': 'formData',
            'type': 'string',
            'required': True,
            'description': 'Contraseña del usuario'
        }
    ],
    'responses': {
        '200': {
            'description': 'Resultado de la validación',
            'schema': {
                'type': 'string',
                'example': 'ok'
            }
        }
    }
})
def validar_usuario():
    data = request.get_json()  # Obtener datos en formato JSON
    usuario = data.get('usuario')
    contrasena = data.get('contrasena')

    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()

        # Step 1: Validar credenciales
        cursor.execute("SELECT COUNT(1) FROM Usuarios WHERE usuario = %s AND contrasena = %s", (usuario, contrasena))
        result = cursor.fetchone()
        if result[0] == 0:
            return jsonify({"message": "fail"})

        # Step 2: Verificar si ya hay una sesión activa
        cursor.execute("SELECT COUNT(1) FROM Sesiones WHERE usuario = %s AND sesion_activa = 1", (usuario,))
        active_sessions = cursor.fetchone()
        if active_sessions[0] > 0:
            return jsonify({"message": "sesion_activa"})

        # Step 3: Agregar una nueva sesión
        fecha = datetime.datetime.now().strftime("%Y-%m-%d")
        hora = datetime.datetime.now().strftime("%H:%M:%S")
        session_result, jerarquia = agregar_sesion(usuario, fecha, hora, cursor, connection)

        # Retornar la respuesta con el mensaje y jerarquía
        return jsonify({
            "message": session_result,
            "jerarquia": jerarquia  # Se incluye la jerarquía en la respuesta
        })
    else:
        return jsonify({"message": "Database connection failed"})


def agregar_sesion(usuario, fecha, hora, cursor, connection):
    # Obtener la jerarquía del usuario
    cursor.execute("SELECT jerarquia FROM Usuarios WHERE usuario = %s", (usuario,))
    jerarquia = cursor.fetchone()

    if not jerarquia:
        return "fail: usuario no encontrado", None  # Retornar None si no se encuentra la jerarquía

    # Insertar nueva sesión en la base de datos
    cursor.execute("""
        INSERT INTO Sesiones (usuario, fecha_inicio, hora_inicio, sesion_activa)
        VALUES (%s, %s, %s, 1)
    """, (usuario, fecha, hora))
    connection.commit()

    return "ok", jerarquia[0]  # Retornar el estado de la sesión y la jerarquía
