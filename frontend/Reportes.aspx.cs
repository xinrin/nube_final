using System;
using System.Web.Services;
using System.Web.Script.Services;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Generic;
using System.IO;

// Define el modelo del reporte
public class Reporte
{
    public string fecha { get; set; }
    public string hora { get; set; }
    public string canal { get; set; }
    public string estacion { get; set; }
    public string tipo { get; set; }
    public string idreporte { get; set; }
    public string urgencia { get; set; }
    public string idsolucion { get; set; }
    public string comentario { get; set; }
    public string usuario { get; set; }
    public string Status { get; set; }
}

[ScriptService]
public partial class Reportes : System.Web.UI.Page
{
    [WebMethod]
    public static string GuardarReporte(Reporte reporte)
    {
        try
        {
            string connectionString = @"Server=localhost\SQLEXPRESS; Database=App; Trusted_Connection=True;";
            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                string query = @"
                    INSERT INTO Reportes
                    (fecha, hora, canal, estacion, tipo, id_reporte, urgencia, solucion, comentario, usuario, status)
                    VALUES
                    (@fecha, @hora, @canal, @estacion, @tipo, @idreporte, @urgencia, @solucion, @comentario, @usuario, @status)";

                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@fecha", reporte.fecha);
                    TimeSpan horaParseada = DateTime.Parse(reporte.hora).TimeOfDay;
                    cmd.Parameters.AddWithValue("@hora", horaParseada);
                    cmd.Parameters.AddWithValue("@canal", reporte.canal);
                    cmd.Parameters.AddWithValue("@estacion", reporte.estacion);
                    cmd.Parameters.AddWithValue("@tipo", reporte.tipo);
                    cmd.Parameters.AddWithValue("@idreporte", reporte.idreporte);
                    cmd.Parameters.AddWithValue("@urgencia", reporte.urgencia);
                    cmd.Parameters.AddWithValue("@solucion", reporte.idsolucion);
                    cmd.Parameters.AddWithValue("@comentario", reporte.comentario);
                    cmd.Parameters.AddWithValue("@usuario", reporte.usuario);
                    cmd.Parameters.AddWithValue("@status", reporte.Status);

                    cmd.ExecuteNonQuery();
                }

                return "ok";
            }
        }
        catch (Exception ex)
        {
            return "ERROR: " + ex.Message;
        }
    }

    [WebMethod]
    public static List<Reporte> ObtenerReportesDeHoy(string usuario)
    {
        List<Reporte> lista = new List<Reporte>();

        string connectionString = @"Server=localhost\SQLEXPRESS; Database=App; Trusted_Connection=True;";
        string fechaHoy = DateTime.Now.ToString("yyyy-MM-dd");

        using (SqlConnection conn = new SqlConnection(connectionString))
        {
            conn.Open();

            string query = @"
                SELECT fecha, hora, canal, estacion, tipo, id_reporte, comentario, urgencia, solucion, usuario, status
                FROM Reportes
                WHERE fecha = @fecha AND (usuario = @usuario OR @usuario = 'admin')";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@fecha", fechaHoy);
                cmd.Parameters.AddWithValue("@usuario", usuario);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        lista.Add(new Reporte
                        {
                            fecha = Convert.ToDateTime(reader["fecha"]).ToString("yyyy-MM-dd"),
                            hora = reader["hora"].ToString(),
                            canal = reader["canal"].ToString(),
                            estacion = reader["estacion"].ToString(),
                            tipo = reader["tipo"].ToString(),
                            idreporte = reader["id_reporte"].ToString(),
                            comentario = reader["comentario"].ToString(),
                            urgencia = reader["urgencia"].ToString(),
                            idsolucion = reader["solucion"].ToString(),
                            usuario = reader["usuario"].ToString(),
                            Status = reader["status"].ToString()
                        });
                    }
                }
            }

        }

        return lista;
  
    }
[WebMethod]
public static List<Reporte> ObtenerHistorial(string usuarioActual, string filtroFecha, string filtroFecha2, string filtroUsuario, string filtroHoraInicio, string filtroHoraFin)
{
    List<Reporte> lista = new List<Reporte>();

    try
    {
        string connectionString = @"Server=localhost\SQLEXPRESS; Database=App; Trusted_Connection=True;";

        using (SqlConnection conn = new SqlConnection(connectionString))
        {
            conn.Open();

            string query = @"
                SELECT 
                    fecha, hora, canal, estacion, tipo, id_reporte, 
                    LEFT(comentario, 1000) AS comentario, 
                    urgencia, solucion, usuario, status
                FROM Reportes
                WHERE 1=1";

            List<SqlParameter> parametros = new List<SqlParameter>();

            // Filtro por fecha
            if (!string.IsNullOrEmpty(filtroFecha) && !string.IsNullOrEmpty(filtroFecha2))
            {
                query += " AND fecha BETWEEN @filtroFecha AND @filtroFecha2";
                parametros.Add(new SqlParameter("@filtroFecha", filtroFecha));
                parametros.Add(new SqlParameter("@filtroFecha2", filtroFecha2));
            }
            else if (!string.IsNullOrEmpty(filtroFecha))
            {
                query += " AND fecha = @filtroFecha";
                parametros.Add(new SqlParameter("@filtroFecha", filtroFecha));
            }

            // Filtro por usuario
            if (!string.IsNullOrEmpty(filtroUsuario) && filtroUsuario != "all")
            {
                query += " AND usuario = @filtroUsuario";
                parametros.Add(new SqlParameter("@filtroUsuario", filtroUsuario));
            }

            // Filtro por hora (exacta o rango)
            if (!string.IsNullOrEmpty(filtroHoraInicio) && !string.IsNullOrEmpty(filtroHoraFin))
            {
                query += " AND CONVERT(time, hora) BETWEEN @horaInicio AND @horaFin";
                parametros.Add(new SqlParameter("@horaInicio", TimeSpan.Parse(filtroHoraInicio)));
                parametros.Add(new SqlParameter("@horaFin", TimeSpan.Parse(filtroHoraFin)));
            }
            else if (!string.IsNullOrEmpty(filtroHoraInicio))
            {
                query += " AND CONVERT(time, hora) = @horaExacta";
                parametros.Add(new SqlParameter("@horaExacta", TimeSpan.Parse(filtroHoraInicio)));
            }

            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.CommandTimeout = 120;
                cmd.Parameters.AddRange(parametros.ToArray());

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        lista.Add(new Reporte
                        {
                            fecha = Convert.ToDateTime(reader["fecha"]).ToString("yyyy-MM-dd"),
                            hora = reader["hora"].ToString(),
                            canal = reader["canal"].ToString(),
                            estacion = reader["estacion"].ToString(),
                            tipo = reader["tipo"].ToString(),
                            idreporte = reader["id_reporte"].ToString(),
                            comentario = reader["comentario"].ToString(),
                            urgencia = reader["urgencia"].ToString(),
                            idsolucion = reader["solucion"].ToString(),
                            usuario = reader["usuario"].ToString(),
                            Status = reader["status"].ToString()
                        });
                    }
                }
            }
        }
    }
    catch (Exception ex)
    {
        throw new Exception("Error al obtener historial: " + ex.Message);
    }

    return lista;
}



}
