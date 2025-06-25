document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('descargarExcel').addEventListener('click', function () {
      const table = document.getElementById('tablaReportes');
      
      // Validar si se encontró la tabla
      if (!table) {
        console.error('No se encontró la tabla con id "tablaReportes".');
        return;
      }
  
      const rows = table.querySelectorAll('tr');
      let data = [];
  
      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td, th');
        let rowData = [];
        cells.forEach(cell => {
          rowData.push(cell.innerText.trim());
        });
        data.push(rowData);
      });
  
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reportes');
  
      // Asegúrate de que estas variables existen, o usa valores por defecto
      let filename = 'Reporte ';
      if (typeof formattedAntigua !== 'undefined' && typeof formattedReciente !== 'undefined') {
        filename += formattedAntigua === formattedReciente
          ? formattedAntigua
          : `${formattedAntigua} a ${formattedReciente}`;
      } else {
        filename += 'SinFecha';
      }
      filename += '.xlsx';
  
      XLSX.writeFile(wb, filename);
    });
  });
  