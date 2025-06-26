from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from app.db.db_connection import get_db_connection
from datetime import timedelta

reportes_bp = Blueprint('reportes_bp', __name__)

@reportes_bp.route('/guardar_reporte', methods=['POST'])
@cross_origin() 
def guardar_reporte():
    data = request.get_json()  # Obtener los datos del reporte en formato JSON
    reporte = data.get('reporte')
    
    # Extraer los datos del reporte
    fecha = reporte.get('fecha')
    hora = reporte.get('hora')
    canal = reporte.get('canal')
    estacion = reporte.get('estacion')
    tipo = reporte.get('tipo')
    id_reporte = reporte.get('idreporte')
    urgencia = reporte.get('urgencia')
    solucion = reporte.get('idsolucion')
    usuario = reporte.get('usuario')
    status = reporte.get('Status')

    # Conexión a la base de datos
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        
        # Insertar los datos del reporte en la base de datos
        cursor.execute("""
            INSERT INTO Reportes (fecha, hora, canal, estacion, tipo, id_reporte, urgencia, solucion, usuario, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (fecha, hora, canal, estacion, tipo, id_reporte, urgencia, solucion, usuario, status))
        
        connection.commit()
        return jsonify({"message": "ok"})  # Respuesta de éxito
    else:
        return jsonify({"message": "Database connection failed"}), 500
    
@reportes_bp.route('/obtener_reportes_de_hoy', methods=['POST'])
@cross_origin() 
def obtener_reportes_de_hoy():
    data = request.get_json()
    usuario = data.get('usuario')

    # Conexión a la base de datos
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        
        # Seleccionar reportes de hoy para el usuario
        cursor.execute("""
            SELECT fecha, hora, canal, estacion, tipo, id_reporte, urgencia, solucion, usuario, status 
            FROM Reportes 
            WHERE usuario = %s AND fecha = CURDATE()
        """, (usuario,))
        
        reportes = cursor.fetchall()

        # Convertir los resultados a un formato adecuado
        reportes_list = []
        for rep in reportes:
            hora = rep[1]
            if isinstance(hora, timedelta):
                # Convierte timedelta (HH:MM:SS) a string
                hora_str = str(hora)
            else:
                hora_str = hora  # ya es string o datetime
        
            reportes_list.append({
                "fecha": rep[0],
                "hora": hora_str,
                "canal": rep[2],
                "estacion": rep[3],
                "tipo": rep[4],
                "id_reporte": rep[5],
                "urgencia": rep[6],
                "solucion": rep[7],
                "usuario": rep[8],
                "status": rep[9]
            })

        return jsonify({"reportes": reportes_list})
    else:
        return jsonify({"message": "Database connection failed"}), 500
    
@reportes_bp.route('/obtener_historial', methods=['POST'])
@cross_origin()
def obtener_historial():
    data = request.get_json()
    usuario_actual = data.get('usuarioActual')
    filtro_fecha = data.get('filtroFecha')
    filtro_fecha2 = data.get('filtroFecha2')
    filtro_usuario = data.get('filtroUsuario')
    filtro_hora_inicio = data.get('filtroHoraInicio')
    filtro_hora_fin = data.get('filtroHoraFin')

    query = """
        SELECT fecha, hora, canal, estacion, tipo, id_reporte, urgencia, solucion, usuario, status
        FROM Reportes
        WHERE 1=1
    """
    params = []

    # Filtros dinámicos
    if filtro_usuario and filtro_usuario != "all":
        query += " AND usuario = %s"
        params.append(filtro_usuario)

    if filtro_fecha:
        query += " AND fecha >= %s"
        params.append(filtro_fecha)

    if filtro_fecha2:
        query += " AND fecha <= %s"
        params.append(filtro_fecha2)

    if filtro_hora_inicio:
        query += " AND hora >= %s"
        params.append(filtro_hora_inicio)

    if filtro_hora_fin:
        query += " AND hora <= %s"
        params.append(filtro_hora_fin)

    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        cursor.execute(query, tuple(params))
        resultados = cursor.fetchall()

        reportes_list = []
        for rep in resultados:
            hora = rep[1]
            hora_str = str(hora) if isinstance(hora, timedelta) else hora
            reportes_list.append({
                "fecha": rep[0],
                "hora": hora_str,
                "canal": rep[2],
                "estacion": rep[3],
                "tipo": rep[4],
                "idreporte": rep[5],
                "urgencia": rep[6],
                "idsolucion": rep[7],
                "usuario": rep[8],
                "Status": rep[9]
            })

        return jsonify({"reportes": reportes_list})
    else:
        return jsonify({"message": "Database connection failed"}), 500