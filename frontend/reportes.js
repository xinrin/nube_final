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

});



// ====== REPORTE: GUARDAR Y MOSTRAR ======
if (document.getElementById('formReporte')) {
  const form = document.getElementById('formReporte');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const usuario = localStorage.getItem('usuario') || 'Invitado';
    const fechaInput = document.getElementById('fecha').value;
    const horaInput = document.getElementById('hora').value;

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

  fetch("Reportes.aspx/GuardarReporte", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reporte })
  })
    .then(res => res.json())
    .then(data => {
      // data.d contiene la respuesta del método WebMethod en ASP.NET
      if (data.d === "ok") {
        alert("Reporte guardado correctamente.");
        form.reset();
        mostrarTabla();
      } else if (data.d.startsWith("ERROR:")) {
        console.error("Error desde el servidor:", data.d);
        alert("Error al guardar el reporte:\n" + data.d); // opcional
      } else {
        console.warn("Respuesta inesperada:", data.d);
      }
    })
    .catch(err => {
      console.error("Error de red o inesperado:", err);
    });
  });

  function obtenerFechaHoyCDMX() {
    return new Intl.DateTimeFormat('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date()).split('/').reverse().join('-');
  }

  function mostrarTabla() {
    const usuario = localStorage.getItem('usuario') || 'Invitado';
    const tbody = document.querySelector('#tablaReportes tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

fetch("Reportes.aspx/ObtenerReportesDeHoy", {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuario })
})
  .then(res => res.json())
  .then(data => {
    const reportesHoy = data.d; // .d contiene la lista de reportes
    console.log(reportesHoy)
    if (reportesHoy.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="text-center">No hay reportes para hoy</td></tr>`;
    }

    reportesHoy.forEach(rep => {
      const fila = `
        <tr>
          <td>${rep.fecha}</td>
          <td>${rep.hora}</td>
          <td>${rep.canal}</td>
          <td>${rep.estacion}</td>
          <td>${rep.tipo}</td>
          <td>${rep.idreporte}</td>
          <td>${rep.comentario}</td>
          <td>${rep.urgencia}</td>
          <td>${rep.idsolucion}</td>
          <td>${rep.usuario}</td>
          <td>${rep.Status}</td>
        </tr>
      `;
      tbody.innerHTML += fila;
    });
  })
  .catch(err => {
    console.error('Error al cargar reportes:', err);
  });
  }

  // Mostrar tabla del día al cargar
  document.addEventListener('DOMContentLoaded', mostrarTabla);
  mostrarTabla();
}
