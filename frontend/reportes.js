// ====== AGREGAR/ACTUALIZAR REPORTES ======
// Simular el almacenamiento de reportes en localStorage
function agregarReporte(reporte) {
  let reportes = JSON.parse(localStorage.getItem('reportes')) || [];
  reportes.push(reporte);
  localStorage.setItem('reportes', JSON.stringify(reportes));
}

// Ejemplo de cómo agregar un reporte
const nuevoReporte = {
  id: 'reporte1',
  descripcion: 'Este es un nuevo reporte',
  fecha: new Date().toISOString()
};

agregarReporte(nuevoReporte);

document.addEventListener("DOMContentLoaded", function () {
  const page = window.location.pathname;
  const nombreUsuario = localStorage.getItem('usuario');

  if (!nombreUsuario) {
    // Si no hay usuario en localStorage, redirigir al login
    window.location.href = 'Login.html';
  }

  // Mostrar el nombre del usuario en el dashboard
  const nombreElemento = document.getElementById('nombre-usuario');
  if (nombreElemento) {
    nombreElemento.textContent = nombreUsuario;
  }

  //ocultar opciones por jerarquia
  const jerarquia = localStorage.getItem('jerarquia');

  // Ocultar elementos si jerarquía es 1 o 2
  if (jerarquia.startsWith("1") || jerarquia === "2") {
    const ocultarIds = [
      'grupo-fecha-hora',
      'grupo-tipo-reporte',
      'grupo-status',
      'grupo-solucion'
    ];

    ocultarIds.forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) {
        // Oculta visualmente
        elemento.style.display = 'none';

        // Busca cualquier input, select o textarea dentro del grupo
        const inputs = elemento.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
          // Quitar el required si lo tiene
          input.removeAttribute('required');

          // Si es input visible, cambiar a hidden si aplica
          if (input.tagName === 'INPUT' && input.type !== 'hidden') {
            input.type = 'hidden';
          }
        });
      }
    });
  }

  // Mostrar la tabla del día al cargar
  mostrarTabla(); // Muestra los reportes cuando el documento está completamente cargado
});

// ====== REPORTE: GUARDAR ======
if (document.getElementById('formReporte')) {
  const form = document.getElementById('formReporte');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Obtener usuario desde localStorage
    const usuario = localStorage.getItem('usuario') || 'Invitado';
    const fechaInput = document.getElementById('fecha').value;
    const horaInput = document.getElementById('hora').value;

    // Crear objeto reporte
    const reporte = {
      fecha: fechaInput || obtenerFechaHoyCDMX(),
      hora: horaInput ? `${horaInput}:00` : new Date().toLocaleTimeString('es-MX', { hour12: false, timeZone: 'America/Mexico_City' }),
      canal: document.getElementById('canal').value,
      estacion: document.getElementById('estacion').value,
      tipo: document.getElementById('tipo').value,
      idreporte: document.getElementById('idreporte').value,
      comentario: document.getElementById('comentario').value,
      urgencia: document.getElementById('urgencia').value,
      idsolucion: document.getElementById('idsolucion').value,
      Status: document.getElementById('Status').value,
      usuario: usuario
    };

    console.log(JSON.stringify({ reporte }));

    // Llamada al backend Flask para guardar el reporte
    fetch("https://api.xinrin.uk/reportes/guardar_reporte", {  // Cambiar URL según tu configuración de Flask
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reporte })  // Enviando el reporte como JSON
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "ok") {
        alert("Reporte guardado correctamente.");
        form.reset();
        mostrarTabla();  // Mostrar la tabla actualizada
      } else if (data.message.startsWith("ERROR:")) {
        console.error("Error desde el servidor:", data.message);
        alert("Error al guardar el reporte:\n" + data.message);  // Mostrar mensaje de error
      } else {
        console.warn("Respuesta inesperada:", data.message);
      }
    })
    .catch(err => {
      console.error("Error de red o inesperado:", err);
    });
  });
}

// Función para obtener la fecha actual en formato `YYYY-MM-DD` (CDMX)
function obtenerFechaHoyCDMX() {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()).split('/').reverse().join('-');
}

// ====== REPORTE: OBTENER Y MOSTRAR ======
function mostrarTabla() {
  const usuario = localStorage.getItem('usuario') || 'Invitado';
  const tbody = document.querySelector('#tablaReportes tbody');
  if (!tbody) return;
  tbody.innerHTML = ''; // Limpiar la tabla

  // Llamada al backend Flask para obtener los reportes de hoy
  fetch("https://api.xinrin.uk/reportes/obtener_reportes_de_hoy", {  // Cambiar URL según tu configuración de Flask
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario })  // Enviamos el usuario como JSON
  })
  .then(res => res.json())
  .then(data => {
    const reportesHoy = data.reportes;  // Suponiendo que `reportes` es el campo con los reportes
    console.log(reportesHoy);

    if (reportesHoy.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="text-center">No hay reportes para hoy</td></tr>`;
    }

    // Recorrer los reportes y agregarlos a la tabla
    reportesHoy.forEach(rep => {
      const fila = `
        <tr>
          <td>${rep.fecha}</td>
          <td>${rep.hora}</td>
          <td>${rep.canal}</td>
          <td>${rep.estacion}</td>
          <td>${rep.tipo}</td>
          <td>${rep.id_reporte}</td>
          <td>${rep.comentario}</td>
          <td>${rep.urgencia}</td>
          <td>${rep.idsolucion}</td>
          <td>${rep.usuario}</td>
          <td>${rep.status}</td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  })
  .catch(err => {
    console.error('Error al cargar reportes:', err);
  });
}


