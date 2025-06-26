from flask import Blueprint, request, jsonify
from flasgger import swag_from
from flask_cors import cross_origin
from app.db.db_connection import get_db_connection

session_bp = Blueprint('session_bp', __name__)

@session_bp.route('/cerrar_sesion', methods=['POST'])
@cross_origin()  # Si necesitas permitir solicitudes de otros orígenes
@swag_from({
    'tags': ['Session'],
    'description': 'Cierra la sesión activa del usuario',
    'parameters': [
        {
            'name': 'usuario',
            'in': 'body',
            'type': 'string',
            'required': True,
            'description': 'El nombre de usuario de la sesión a cerrar'
        },
        {
            'name': 'fecha',
            'in': 'body',
            'type': 'string',
            'required': True,
            'description': 'La fecha en que se cierra la sesión en formato: YYYY-MM-DD'
        },
        {
            'name': 'hora',
            'in': 'body',
            'type': 'string',
            'required': True,
            'description': 'La hora en que se cierra la sesión en formato: HH:MM:SS'
        }
    ],
    'responses': {
        '200': {
            'description': 'Sesión cerrada exitosamente',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {
                        'type': 'string',
                        'example': 'ok'
                    }
                }
            }
        },
        '400': {
            'description': 'Error en la solicitud o en la conexión a la base de datos',
            'schema': {
                'type': 'object',
                'properties': {
                    'message': {
                        'type': 'string',
                        'example': 'Database connection failed'
                    }
                }
            }
        }
    }
})
def cerrar_sesion():
    # Obtener los datos como JSON
    data = request.get_json()  # Recibir los datos en formato JSON
    usuario = data.get('usuario')
    fecha = data.get('fecha')
    hora = data.get('hora')

    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        cursor.execute("""
            UPDATE Sesiones
            SET fecha_cierre = %s, hora_cierre = %s, sesion_activa = 0
            WHERE usuario = %s AND sesion_activa = 1
        """, (fecha, hora, usuario))
        connection.commit()
        return jsonify({"message": "ok"})
    else:
        return jsonify({"message": "Database connection failed"})

@session_bp.route('/cambiar_contrasena', methods=['POST'])
def cambiar_contrasena():
    usuario = request.form.get('usuario')
    nueva_contrasena = request.form.get('nuevaContrasena')

    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(1) FROM Usuarios WHERE usuario = %s", (usuario,))
        user_exists = cursor.fetchone()

        if user_exists[0] == 0:
            return jsonify({"message": "Usuario no encontrado"})

        cursor.execute("UPDATE Usuarios SET contrasena = %s WHERE usuario = %s", (nueva_contrasena, usuario))
        connection.commit()
        return jsonify({"message": "ok"})
    else:
        return jsonify({"message": "Database connection failed"})
