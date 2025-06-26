// Obtener fecha real
function getFechaLocalISO() {
  const hoy = new Date();
  return hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0');
}

// ====== HISTORIAL: FILTRO Y TABLA ======
function mostrarHistorial() {
  const tbody = document.querySelector('#tablaR tbody');
  const usuarioActual = localStorage.getItem('usuario') || 'Invitado';

  if (!tbody) {
    console.warn('No se encontró el tbody de la tablaR');
    return;
  }

  const filtroFecha = document.getElementById('filtroFecha')?.value || '';
  const filtroFecha2 = document.getElementById('filtroFecha2')?.value || '';
  const filtroUsuario = document.getElementById('filtroUsuario')?.value || '';
  const filtroHoraInicio = document.getElementById('filtroHoraInicio')?.value || '';
  const filtroHoraFin = document.getElementById('filtroHoraFin')?.value || '';

  fetch("http://localhost:5000/reportes/obtener_historial", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuarioActual,
      filtroFecha,
      filtroFecha2,
      filtroUsuario,
      filtroHoraInicio,
      filtroHoraFin
    })
  })
  .then(async res => {
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Error del servidor:", errorText);
      throw new Error(`Error HTTP ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    tbody.innerHTML = '';

    const reportes = data?.reportes;
    if (!Array.isArray(reportes)) {
      tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Respuesta no válida del servidor.</td></tr>`;
      console.warn("Respuesta inesperada:", data);
      return;
    }

    if (reportes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="text-center">No hay reportes disponibles</td></tr>`;
      return;
    }

    reportes.forEach(rep => {
      const fila = `
        <tr>
          <td>${rep.fecha}</td>
          <td>${rep.hora}</td>
          <td>${rep.canal}</td>
          <td>${rep.estacion}</td>
          <td>${rep.tipo}</td>
          <td>${rep.idreporte}</td>
          <td>${rep.comentario || ''}</td>
          <td>${rep.urgencia}</td>
          <td>${rep.idsolucion}</td>
          <td>${rep.usuario}</td>
          <td>${rep.Status}</td>
        </tr>`;
      tbody.innerHTML += fila;
    });
  })
  .catch(err => {
    console.error('Error al cargar el historial:', err);
    tbody.innerHTML = `<tr><td colspan="11" class="text-center text-danger">Error al obtener los reportes.</td></tr>`;
  });
}



// ====== LLENAR SELECT DE USUARIOS PARA FILTRO ======
function cargarUsuarios() {
  const selectUsuario = document.getElementById('filtroUsuario');

  if (!selectUsuario) {
    console.error('No se encontró el select de filtro de usuario');
    return;
  }

  fetch("http://localhost:5000/usuarios/obtener")
  .then(res => res.json())
  .then(data => {
    const usuarios = data.usuarios;
    const select = document.getElementById('filtroUsuario');
    select.innerHTML = '';

    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = '-- Todos --';
    select.appendChild(allOption);

    usuarios.forEach(usuario => {
      const option = document.createElement('option');
      option.value = usuario;
      option.textContent = usuario;
      select.appendChild(option);
    });
  })
  .catch(err => {
    console.error("Error al obtener usuarios:", err);
  });
}

// ====== INICIALIZACIÓN GENERAL ======
document.addEventListener('DOMContentLoaded', () => {
  const filtroFecha = document.getElementById('filtroFecha');
  const filtroFecha2 = document.getElementById('filtroFecha2');
  const filtroUsuario = document.getElementById('filtroUsuario');
  const filtroHoraInicio = document.getElementById('filtroHoraInicio');
  const filtroHoraFin = document.getElementById('filtroHoraFin');

  // Obtener la fecha actual en formato YYYY-MM-DD
  const hoy = getFechaLocalISO();

  if (document.getElementById('tablaR') && filtroFecha && filtroFecha2 && filtroUsuario) {
    // 👉 Establecer la fecha del día actual por defecto si los campos están vacíos
    if (!filtroFecha.value) {
      filtroFecha.value = hoy;
    }

    if (!filtroFecha2.value) {
      filtroFecha2.value = hoy;
    }

    cargarUsuarios();
    mostrarHistorial();

    filtroFecha.addEventListener('change', () => {
      if (!filtroFecha.value) {
        filtroFecha2.value = '';
        filtroFecha2.disabled = true;
      } else {
        filtroFecha2.disabled = false;
        filtroFecha2.min = filtroFecha.value;
      }
      mostrarHistorial();
    });

    filtroFecha2.addEventListener('change', () => {
      if (filtroFecha2.value && filtroFecha.value && filtroFecha2.value < filtroFecha.value) {
        alert('La segunda fecha debe ser igual o mayor que la primera.');
        filtroFecha2.value = filtroFecha.value;
      }
      mostrarHistorial();
    });

    filtroUsuario.addEventListener('change', mostrarHistorial);

    if (!filtroFecha.value) {
      filtroFecha2.disabled = true;
      filtroFecha2.value = '';
    } else {
      filtroFecha2.disabled = false;
      filtroFecha2.min = filtroFecha.value;
    }

    if (filtroHoraInicio) filtroHoraInicio.addEventListener('change', mostrarHistorial);
    if (filtroHoraFin) filtroHoraFin.addEventListener('change', mostrarHistorial);
  }
});

document.getElementById('btnReiniciarFiltros')?.addEventListener('click', () => {
  const hoy = getFechaLocalISO();

  console.log(hoy)

  document.getElementById('filtroFecha').value = hoy;
  document.getElementById('filtroFecha2').value = hoy;
  document.getElementById('filtroFecha2').disabled = false;

  document.getElementById('filtroHoraInicio').value = '';
  document.getElementById('filtroHoraFin').value = '';

  document.getElementById('filtroUsuario').value = 'all';

  mostrarHistorial(); // 👈 Vuelve a cargar la tabla con los filtros reseteados
});

const inicio = document.getElementById('filtroHoraInicio');
const fin = document.getElementById('filtroHoraFin');

[inicio, fin].forEach(input => {
  input.addEventListener('change', () => {
    if (inicio.value && fin.value && inicio.value > fin.value) {
      alert('La hora de inicio no puede ser mayor que la hora de fin.');
      fin.value = '';
    }
  });
});

