document.getElementById("descargarPDFA").addEventListener("click", () => {
    const usuario = localStorage.getItem("usuario") || "Invitado"
    const reportes = JSON.parse(localStorage.getItem("reportes") || "[]")
  
    // Obtener las filas visibles de la tabla
    const rows = document.querySelectorAll("#tablaR tbody tr")
    const reportesTabla = []
  
    // Extraer los datos de la tabla y almacenarlos en el array reportesTabla
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td")
      const reporte = {
        fecha: cells[0].textContent,
        hora: cells[1].textContent,
        canal: cells[2].textContent,
        estacion: cells[3].textContent,
        tipo: cells[4].textContent,
        idreporte: cells[5].textContent,
        comentario: cells[6].textContent,
        urgencia: cells[7].textContent,
        solucion: cells[8].textContent,
        usuario: cells[9].textContent,
        status: cells[10].textContent,
      }
      reportesTabla.push(reporte)
    })
  
    if (reportesTabla.length === 0) {
      alert("No hay reportes para descargar")
      return
    }
  
    const fechas = reportesTabla.map(rep => new Date(rep.fecha))

    const fechaMinima = new Date(Math.min(...fechas))
    const fechaMaxima = new Date(Math.max(...fechas))
  
    // Formatear las fechas en el formato dd-mm-yy
    const formatFecha = (fecha) => {
      const dia = String(fecha.getDate()).padStart(2, "0")
      const mes = String(fecha.getMonth() + 1).padStart(2, "0")
      const año = String(fecha.getFullYear()).slice(-2)
      return `${dia}-${mes}-${año}`
    }
  
    
    function getTurno(hora) {
      const [h, m, s] = hora.split(':').map(Number);
      const tiempoEnMinutos = h * 60 + m; // Convertir a minutos desde la medianoche para facilitar la comparación

      // Matutino: 06:00 (360 min) a 13:59 (839 min)
      if (tiempoEnMinutos >= 360 && tiempoEnMinutos <= 839) {
        return "Matutino";
      }
      // Vespertino: 14:00 (840 min) a 21:59 (1319 min)
      if (tiempoEnMinutos >= 840 && tiempoEnMinutos <= 1319) {
        return "Vespertino";
      }
      // Nocturno: 00:00 (0 min) a 05:59 (359 min) O 22:00 (1320 min) a 23:59 (1439 min)
      if ((tiempoEnMinutos >= 0 && tiempoEnMinutos <= 359) || (tiempoEnMinutos >= 1320 && tiempoEnMinutos <= 1439)) {
        return "Nocturno";
      }
      return "Fuera de Turno"; // Por si acaso
    }

    function generarTopEstacionesParaTurno(dataTurno) {
      if (!dataTurno || Object.keys(dataTurno).length === 0) {
        return []; // Retorna un array vacío si no hay datos para el turno
      }
      const estacionesArray = Object.entries(dataTurno).map(([estacion, count]) => ({
        estacion,
        count
      }));

      estacionesArray.sort((a, b) => b.count - a.count); // Ordenar descendente

      return estacionesArray.slice(0, 10).map((item, index) => [
        index + 1, // Rank
        item.estacion,
        item.count
      ]);
    }
    

    const rangoFechas = `${formatFecha(fechaMinima)} a ${formatFecha(fechaMaxima)}`
  
    // Agregar estadísticas para las cards
    const totalReportes = reportesTabla.length
    const reportesSolucionados = reportesTabla.filter(
      (rep) => rep.status === "Solucionados" || rep.status === "undefined",
    ).length
    const reportesEnProceso = totalReportes - reportesSolucionados
    const efectividad = (reportesSolucionados / totalReportes) * 100
  
    const colores = [
      "#1abc9c", "#3498db", "#e74c3c", "#f39c12", "#007bff", "#23f54a", "#239ef5", "#f5232a",
      "#2bd52b3f", "#dca85ae1", "#5adc92e1", "#765adce1", "#a2f4b1e1", "#d5e431e1", "#192ae6",
      "#4e8a77", "#ee0394",
    ]
  
    // Agrupar los datos por estación y tipo
    const agrupar = (campo) => {
      return reportesTabla.reduce((acc, rep) => {
        acc[rep[campo]] = (acc[rep[campo]] || 0) + 1
        return acc
      }, {})
    }
  
    const estacionesData = agrupar("estacion")
    const tiposData = agrupar("tipo")

    
    const conteoEstacionesPorTurno = {
      Matutino: {},
      Vespertino: {},
      Nocturno: {},
    };

    reportesTabla.forEach(reporte => {
      const turno = getTurno(reporte.hora);
      if (turno !== "Fuera de Turno" && conteoEstacionesPorTurno[turno]) {
        if (!conteoEstacionesPorTurno[turno][reporte.estacion]) {
          conteoEstacionesPorTurno[turno][reporte.estacion] = 0;
        }
        conteoEstacionesPorTurno[turno][reporte.estacion]++;
      }
    });
    
  
    // Configuración para los gráficos de Plotly
    const estacionesDataPlotly = {
      x: Object.keys(estacionesData),
      y: Object.values(estacionesData),
      type: "bar",
      marker: { color: colores },
    }
  
    const layoutBarras = {
      title: "Reportes por Estación",
      xaxis: { title: "Estaciones", tickfont: { size: 14 } },
      yaxis: { title: "Cantidad de Reportes", tickfont: { size: 14 } },
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
  
              // Título - ajustado para formato horizontal
              const titulo = "Reporte Diario de Incidencias"
              const fecha = rangoFechas
              const pageWidth = doc.internal.pageSize.getWidth()
              const tituloX = (pageWidth - doc.getTextWidth(titulo)) / 2
              const fechaX = (pageWidth - doc.getTextWidth(fecha)) / 2
              doc.setFontSize(18)
              doc.setFont("helvetica", "bold")
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
  
              const totalCardsWidth = (cardWidth * 4) + (cardSpacing * 3);
              const startX = (pageWidth - totalCardsWidth) / 2;
  
              stats.forEach((stat, index) => {
                const x = startX + (cardWidth + cardSpacing) * index
                const y = cardY
                doc.setFillColor(stat.color)
                doc.rect(x, y, cardWidth, cardHeight, "F")
                doc.setFontSize(16)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(255, 255, 255)
                doc.text(stat.label, x + cardWidth / 2, y + 20, { align: "center" })
                doc.setFontSize(22)
                doc.text(stat.value.toString(), x + cardWidth / 2, y + 40, { align: "center" })
              })
  
              // Gráficas
              doc.text("Reportes por Estación", 20, 110)
              doc.addImage(imgEstaciones, "PNG", 20, 115, 130, 65)
              doc.text("Distribución por Tipo de Reporte", 160, 110)
              doc.addImage(imgTipos, "PNG", 160, 115, 120, 65)

              // Nueva página para las tablas comparativas
              doc.addPage('landscape')
              
              const tableWidth = 120
              const spacingX = 20
              const tableY = 35
              const titleY = 25
              
              const table1X = (pageWidth - (2 * tableWidth + spacingX)) / 2
              const table2X = table1X + tableWidth + spacingX
              
              doc.setFontSize(14)
              doc.setFont("helvetica", "bold")
              doc.setTextColor(0, 0, 0)
              
              doc.text("Top 10 Estaciones con Más Reportes", table1X + tableWidth / 2, titleY, { align: "center" })
              doc.text("Top 5 Incidencias Más Recurrentes", table2X + tableWidth / 2, titleY, { align: "center" })
              
              const top10Estaciones = Object.entries(estacionesData).sort((a, b) => b[1] - a[1]).slice(0, 10)
              
              const idRepetidos = {}
              reportesTabla.forEach(rep => {
                idRepetidos[rep.idreporte] = (idRepetidos[rep.idreporte] || 0) + 1
              })
              const top5IDs = Object.entries(idRepetidos).sort((a, b) => b[1] - a[1]).slice(0, 5)
              
              doc.autoTable({
                startY: tableY,
                head: [["Estación", "Incidencias"]],
                body: top10Estaciones.map(([estacion, cantidad]) => [estacion, cantidad]),
                theme: "striped",
                headStyles: { fillColor: [0, 123, 255], halign: "center" },
                styles: { fontSize: 10, halign: "center" },
                margin: { left: table1X },
                tableWidth,
              })
              
              doc.autoTable({
                startY: tableY,
                head: [["ID de Reporte", "Cantidad"]],
                body: top5IDs.map(([id, count]) => [id, count]),
                theme: "striped",
                headStyles: { fillColor: [231, 76, 60], halign: "center" },
                styles: { fontSize: 10, halign: "center" },
                margin: { left: table2X },
                tableWidth,
              })

              
              // Nueva página para las tablas de turnos
              doc.addPage('landscape');

              let currentYTurnos = 20; // Posición Y inicial para las tablas de turnos

              doc.setFontSize(14);
              doc.setFont("helvetica", "bold");
              doc.text("Top 10 Estaciones con Más Reportes por Turno", pageWidth / 2, currentYTurnos, { align: 'center' });
              currentYTurnos += 10;

              const turnos = ["Matutino", "Vespertino", "Nocturno"];
              const tableWidthTurno = (pageWidth - 40) / 3 - 10; // Ancho para cada tabla de turno

              turnos.forEach((nombreTurno, index) => {
                const topEstacionesTurnoBody = generarTopEstacionesParaTurno(conteoEstacionesPorTurno[nombreTurno]);
                
                let tableX = 20 + index * (tableWidthTurno + 10); // Posición X para cada tabla

                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(nombreTurno, tableX + tableWidthTurno / 2, currentYTurnos, { align: 'center' });
                
                if (topEstacionesTurnoBody.length > 0) {
                  doc.autoTable({
                    startY: currentYTurnos + 5,
                    head: [['#', 'Estación', 'Reportes']],
                    body: topEstacionesTurnoBody,
                    theme: 'striped',
                    headStyles: { fillColor: [52, 73, 94], textColor: 255, halign: 'center', fontSize: 9 },
                    bodyStyles: { fontSize: 8, cellPadding: 1.5 },
                    columnStyles: {
                      0: { cellWidth: 15, halign: 'center' },
                      1: { cellWidth: 'auto' },
                      2: { cellWidth: 25, halign: 'center' },
                    },
                    tableWidth: tableWidthTurno,
                    margin: { left: tableX },
                  });
                } else {
                  doc.setFontSize(9);
                  doc.setFont("helvetica", "normal");
                  doc.text("No hay datos para este turno.", tableX + tableWidthTurno / 2, currentYTurnos + 15, { align: 'center' });
                }
              });
              
  
              // Nueva página para la tabla detallada
              doc.addPage('landscape')
  
              // Tabla de Reportes
              doc.autoTable({
                startY: 15,
                headStyles: { fillColor: [22, 160, 133], halign: "center" },
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: {
                  0: {cellWidth: 20}, 1: {cellWidth: 18}, 2: {cellWidth: 20},
                  3: {cellWidth: 20}, 4: {cellWidth: 25}, 5: {cellWidth: 35},
                  6: {cellWidth: 35}, 7: {cellWidth: 18}, 8: {cellWidth: 35},
                  9: {cellWidth: 20}, 10: {cellWidth: 30, halign: 'center', noWrap: true},
                },
                head: [
                  [
                    "Fecha", "Hora", "Canal", "Estación", "Tipo", "Reporte",
                    "Comentario", "Urgencia", "Solución", "Usuario", "Status",
                  ],
                ],
                body: reportesTabla.map((rep) => [
                  rep.fecha, rep.hora, rep.canal, rep.estacion, rep.tipo,
                  rep.idreporte, rep.comentario, rep.urgencia, rep.solucion,
                  rep.usuario, rep.status,
                ]),
                theme: "striped",
                margin: { left: 10, right: 10 },
              })
  
              // Guardar el PDF
              doc.save(`reporte_diario_${rangoFechas}.pdf`)
            })
          })
        }, 1000)
      })
    })
  })