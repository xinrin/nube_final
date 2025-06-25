

document.getElementById("descargarPDF").addEventListener("click", async () => {
  const reportesHoy = await obtenerReportesHoy(); // Esperamos los datos desde la API

  if (!reportesHoy || reportesHoy.length === 0) {
    alert("No hay reportes para hoy.");
    return;
  }
  
    const agrupar = (campo) => {
      return reportesHoy.reduce((acc, rep) => {
        acc[rep[campo]] = (acc[rep[campo]] || 0) + 1
        return acc
      }, {})
    }
  
    const estacionesData = agrupar("estacion")
    const tiposData = agrupar("tipo")
  
    // Calcular las estadísticas para las cards
    const totalReportes = reportesHoy.length
    const reportesSolucionados = reportesHoy.filter(
      (rep) => rep.Status === "Solucionados" || rep.Status === undefined,
    ).length
    const reportesEnProceso = totalReportes - reportesSolucionados
    const efectividad = (reportesSolucionados / totalReportes) * 100
  
    const colores = [
      "#1abc9c", "#3498db", "#e74c3c", "#f39c12", "#007bff", "#23f54a", "#239ef5", "#f5232a",
      "#2bd52b3f", "#dca85ae1", "#5adc92e1", "#765adce1", "#a2f4b1e1", "#d5e431e1", "#192ae6",
      "#4e8a77", "#ee0394",
    ]
  
    // Configuración para los gráficos de Plotly
    const estacionesDataPlotly = {
      x: Object.keys(estacionesData),
      y: Object.values(estacionesData),
      type: "bar",
      marker: { color: colores },
    }
  
    const layoutBarras = {
      title: "Reportes por Estación",
      xaxis: {
        title: "Estaciones",
        tickfont: { size: 14 },
      },
      yaxis: {
        title: "Cantidad de Reportes",
        tickfont: { size: 14 },
      },
      showlegend: false,
    }
  
    const tiposDataPlotly = [
      {
        values: Object.values(tiposData),
        labels: Object.keys(tiposData),
        type: "pie",
        textinfo: "percent+label",
        textfont: { size: 18 },
        marker: { colors: colores },
      },
    ]
  
    const layoutPastel = {
      title: "Distribución por Tipo de Reporte",
      font: { size: 18 },
      showlegend: false,
    }
  
    // Crear los gráficos de Plotly en memoria
    const graphDivEstaciones = document.createElement("div")
    const graphDivTipos = document.createElement("div")
  
    Plotly.newPlot(graphDivEstaciones, [estacionesDataPlotly], layoutBarras).then(() => {
      Plotly.newPlot(graphDivTipos, tiposDataPlotly, layoutPastel).then(() => {
        setTimeout(() => {
          // Convertir las gráficas a imágenes con dimensiones optimizadas para horizontal
          Plotly.toImage(graphDivEstaciones, { format: "png", width: 1000, height: 400 }).then((imgEstaciones) => {
            Plotly.toImage(graphDivTipos, { format: "png", width: 800, height: 400 }).then((imgTipos) => {
              // Crear el PDF con jsPDF en modo landscape
              const { jsPDF } = window.jspdf
              const doc = new jsPDF('landscape')
  
              // Obtener la fecha actual formateada correctamente
              const hoy = new Date()
              const fechaFormateada = `${String(hoy.getDate()).padStart(2, "0")}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getFullYear()).slice(-2)}`
  
              // Título - ajustado para formato horizontal
              doc.setFontSize(18)
              doc.setFont("helvetica", "bold")
              const titulo = "Reporte Diario de Incidencias"
              const fecha = fechaFormateada
              const pageWidth = doc.internal.pageSize.getWidth()
              const tituloX = (pageWidth - doc.getTextWidth(titulo)) / 2
              const fechaX = (pageWidth - doc.getTextWidth(fecha)) / 2
              doc.text(titulo, tituloX, 15)
              doc.setFontSize(12)
              doc.setFont("helvetica", "normal")
              doc.text(fecha, fechaX, 22)
              doc.setDrawColor(150)
              doc.setLineWidth(0.5)
              doc.line(14, 26, pageWidth - 14, 26)
  
              // Cards de Estadísticas - CENTRADAS horizontalmente
              const cardY = 35
              const cardWidth = 65
              const cardHeight = 60
              const cardSpacing = 10
              
              const stats = [
                { label: "Total de Reportes", value: totalReportes, color: "#3498db" },
                { label: "Solucionados", value: reportesSolucionados, color: "#1abc9c" },
                { label: "En Proceso", value: reportesEnProceso, color: "#f39c12" },
                { label: "Efectividad", value: `${efectividad.toFixed(2)}%`, color: "#e74c3c" },
              ];
  
              // Calcular el ancho total que ocupan las 4 cards
              const totalCardsWidth = (cardWidth * 4) + (cardSpacing * 3);
              
              // Calcular la posición inicial x para centrar las cards
              const startX = (pageWidth - totalCardsWidth) / 2;
  
              // Distribuir las cards horizontalmente desde la posición centrada
              stats.forEach((stat, index) => {
                const x = startX + (cardWidth + cardSpacing) * index
                const y = cardY
                doc.setFillColor(stat.color)
                doc.rect(x, y, cardWidth, cardHeight, "F")
  
                // Texto de la card: Alineado al centro
                doc.setFontSize(16)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(255, 255, 255) // Texto en blanco
  
                // Centramos las etiquetas
                doc.text(stat.label, x + cardWidth / 2, y + 20, { align: "center" })
  
                // Valores
                doc.setFontSize(22)
                doc.text(stat.value.toString(), x + cardWidth / 2, y + 40, { align: "center" })
              })
  
              // Gráficas - optimizadas para formato horizontal
              // Colocamos ambas gráficas en la misma página, una al lado de la otra
              doc.text("Reportes por Estación", 20, 110)
              doc.addImage(imgEstaciones, "PNG", 20, 115, 130, 65)
  
              doc.text("Distribución por Tipo de Reporte", 160, 110)
              doc.addImage(imgTipos, "PNG", 160, 115, 120, 65)
  
              // Nueva página para la tabla
              doc.addPage('landscape')
  
              // Tabla de Reportes - optimizada para formato horizontal
              doc.autoTable({
                startY: 15,
                headStyles: { fillColor: [22, 160, 133], halign: "center" },
                styles: { fontSize: 8, cellPadding: 2 },
                // Ajustar anchos de columnas para formato horizontal
                columnStyles: {
                  0: {cellWidth: 20}, // Fecha
                  1: {cellWidth: 18}, // Hora
                  2: {cellWidth: 20}, // Canal
                  3: {cellWidth: 20}, // Estación
                  4: {cellWidth: 25}, // Tipo
                  5: {cellWidth: 35}, // Reporte (reducido ligeramente)
                  6: {cellWidth: 35}, // Comentario (reducido ligeramente)
                  7: {cellWidth: 18}, // Urgencia
                  8: {cellWidth: 35}, // Solución (reducido ligeramente)
                  9: {cellWidth: 20}, // Usuario
                  10: {cellWidth: 30, halign: 'center', noWrap: true}, // Status - AUMENTADO, centrado y sin división
                },
                head: [
                  [
                    "Fecha",
                    "Hora",
                    "Canal",
                    "Estación",
                    "Tipo",
                    "Reporte",
                    "Comentario",
                    "Urgencia",
                    "Solución",
                    "Usuario",
                    "Status",
                  ],
                ],
                body: reportesHoy.map((rep) => [
                  rep.fecha,
                  rep.hora,
                  rep.canal,
                  rep.estacion,
                  rep.tipo,
                  rep.idreporte,
                  rep.comentario,
                  rep.urgencia,
                  rep.idsolucion,
                  rep.usuario,
                  rep.Status,
                ]),
                theme: "striped",
                margin: { left: 10, right: 10 },
              })
  
              // Guardar el PDF con nombre que incluye la fecha correcta
              doc.save(`reporte_diario_${fechaFormateada}.pdf`)
            })
          })
        }, 1000) // Ajustar este tiempo si es necesario
      })
    })
  })
  
  // Función corregida para obtener reportes del día actual
  function obtenerReportesHoy() {
    // Obtener la fecha de hoy en formato YYYY-MM-DD ajustada a la zona horaria local
    const hoy = new Date()
    const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`
  
    // Obtener los reportes almacenados en el localStorage
    const reportes = JSON.parse(localStorage.getItem("reportes") || "[]")
  
    // Filtrar los reportes de hoy comparando solo las fechas (sin considerar la hora)
    return reportes.filter((rep) => {
      // Si la fecha del reporte está en formato YYYY-MM-DD, podemos compararla directamente
      if (rep.fecha === fechaHoy) {
        return true
      }
      
      // Si la fecha tiene otro formato, intentamos convertirla
      try {
        // Dividir la fecha en sus componentes
        const [year, month, day] = rep.fecha.split('-').map(num => parseInt(num, 10))
        // Crear un objeto Date con estos componentes
        const fechaReporte = new Date(year, month - 1, day)
        // Comparar solo año, mes y día
        return fechaReporte.getFullYear() === hoy.getFullYear() &&
               fechaReporte.getMonth() === hoy.getMonth() &&
               fechaReporte.getDate() === hoy.getDate()
      } catch (e) {
        console.error("Error al procesar la fecha:", rep.fecha, e)
        return false
      }
    })
    
  }