

 // PARA LA TABLA DE ARCHIVOS

 document.addEventListener('DOMContentLoaded', function() {
  const btnDescargarExcel = document.getElementById('descargarExcel'); // Aquí debe coincidir con el id de tu botón
  if (btnDescargarExcel) {
    btnDescargarExcel.addEventListener('click', function() {
      // Obtener la tabla por su id
      const table = document.getElementById('tablaR');
      
      // Obtener las filas de la tabla, incluyendo el encabezado
      const rows = table.querySelectorAll('tr');

      // Crear un arreglo para almacenar los datos de la tabla
      let data = [];
      let fechas = [];

      // Iterar sobre las filas de la tabla
      rows.forEach((row, rowIndex) => {
        // Tomar las celdas de cada fila (ya sean <td> o <th>)
        const cells = row.querySelectorAll('td, th');
        let rowData = [];

        // Si es una fila de datos (no de encabezado), procesamos las fechas
        if (rowIndex > 0) {
          const fechaCell = cells[0]; // Suponiendo que la fecha está en la primera columna (<th>Fecha</th>)
          const fecha = fechaCell.innerText.trim();
          fechas.push(fecha); // Guardamos la fecha para usarla después
        }

        // Iterar sobre las celdas y almacenar los valores
        cells.forEach(cell => {
          rowData.push(cell.innerText.trim());
        });

        // Si es la primera fila (encabezados), agregarla al principio del arreglo
        if (rowIndex === 0) {
          data.push(rowData); // Agregar los encabezados
        } else {
          data.push(rowData); // Agregar los datos
        }
      });

      // Convertir las fechas a objetos Date para compararlas
      const fechasOrdenadas = fechas.map(date => new Date(date)).sort((a, b) => a - b);

      // Obtener la fecha más antigua y la más reciente
      const fechaMasAntigua = fechasOrdenadas[0];
      const fechaMasReciente = fechasOrdenadas[fechasOrdenadas.length - 1];

      // Formatear las fechas a YYYY-MM-DD
      const yearAntigua = fechaMasAntigua.getFullYear();
      const monthAntigua = (fechaMasAntigua.getMonth() + 1).toString().padStart(2, '0');
      const dayAntigua = fechaMasAntigua.getDate().toString().padStart(2, '0');
      const formattedAntigua = `${yearAntigua}-${monthAntigua}-${dayAntigua}`;

      const yearReciente = fechaMasReciente.getFullYear();
      const monthReciente = (fechaMasReciente.getMonth() + 1).toString().padStart(2, '0');
      const dayReciente = fechaMasReciente.getDate().toString().padStart(2, '0');
      const formattedReciente = `${yearReciente}-${monthReciente}-${dayReciente}`;

      // Crear una hoja de trabajo (worksheet) con los datos
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Crear un libro de trabajo (workbook)
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reportes');

      // Determinar el nombre del archivo
      let filename = 'Reporte ';
      if (formattedAntigua === formattedReciente) {
        filename += formattedAntigua; // Si la fecha más antigua es igual a la más reciente, usar solo una fecha
      } else {
        filename += `${formattedAntigua} a ${formattedReciente}`; // De lo contrario, mostrar el rango de fechas
      }
      filename += '.xlsx';

      // Generar y descargar el archivo Excel
      XLSX.writeFile(wb, filename);
    });
  }
});

