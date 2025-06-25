// ====== VERIFICAR SESIÓN AL CARGAR ======
document.addEventListener("DOMContentLoaded", function () {
  const usuario = localStorage.getItem('usuario');
  const jerarquia = localStorage.getItem('jerarquia');
  const pagina = window.location.pathname;

  // Proteger páginas que no sean login
  if (!usuario && !pagina.includes("login.html")) {
    window.location.href = "login.html";
  }

  // Mostrar nombre en dashboard
  const nombreElemento = document.getElementById('nombre-usuario');
  if (nombreElemento && usuario) {
    nombreElemento.textContent = usuario;
  }

  // Aplicar restricciones por jerarquía
  aplicarRestriccionesPorJerarquia(jerarquia);
});

// ====== FUNCIÓN: Iniciar sesión ======
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const usuario = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    fetch("LoginHandler.aspx/ValidarUsuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, contrasena: pass })
    })
      .then(res => res.json())
      .then(data => {
        const respuesta = data.d;
        console.log("Respuesta del login:", respuesta);

        if (respuesta.startsWith("ok|")) {
          const partes = respuesta.split("|");
          const jerarquia = partes[1];

          localStorage.setItem("usuario", usuario);
          localStorage.setItem("jerarquia", jerarquia);

          window.location.href = "dashboard.html";
        } else if (respuesta === "sesion_activa") {
          alert("Ya tienes una sesión activa. Por favor, cierra la otra sesión antes de continuar.");
        } else {
          alert("Credenciales incorrectas o sesión activa.");
        }
      })
      .catch(err => {
        console.error("Error en el login:", err);
      });
  });
}

// ====== CERRAR SESIÓN ======
function cerrarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("jerarquia");
  window.location.href = "login.html";
}

// Botón o enlace de cerrar sesión
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById('logoutBtn') || document.getElementById('cerrar-sesion-tab');
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      cerrarSesion();
    });
  }
});

// ====== FUNCIONES DE RESTRICCIÓN POR ROL ======
function aplicarRestriccionesPorJerarquia(jerarquia) {
  if (!jerarquia) return;

  if (jerarquia.startsWith("1") || jerarquia === "2") {
    ocultarElementoPorId("card-historial");
    ocultarElementoPorId("card-inventario");
    ocultarElementoPorId("archivos-tab");
    ocultarElementoPorId("inventario-tab");
     ocultarElementoPorId("tablaReportes");
     ocultarElementoPorId("card-contraseña");
    
  }
}

function ocultarElementoPorId(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}


// ====== Cerrar sesión ======
function CerrarSesion() {
  const usuario = localStorage.getItem('usuario');
  const fecha = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
  const hora = new Date().toTimeString().split(' ')[0]; // HH:mm:ss

  if (!usuario) {
    // Si no hay usuario en localStorage, solo redirige
    window.location.href = 'login.html';
    return;
  }

  fetch('LoginHandler.aspx/CerrarSesion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ usuario, fecha, hora })
  })
  .then(response => response.json())
  .then(data => {
    if (data.d === "ok") {
      console.log("Sesión cerrada en servidor.");
    } else {
      console.warn("Servidor respondió:", data.d);
    }

    // Limpiar sesión local y redirigir
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
  })
  .catch(error => {
    console.error("Error al cerrar sesión en el servidor:", error);
    // Redirigir de todos modos
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
  });
}

// Opción 1: Cerrar sesión desde el Card (Botón de "Salir")
if (document.getElementById('logoutBtn')) {
  document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    CerrarSesion();
  });
}

// Opción 2: Cerrar sesión desde el Enlace en el Navbar
if (document.getElementById('cerrar-sesion-tab')) {
  document.getElementById('cerrar-sesion-tab').addEventListener('click', function(e) {
    e.preventDefault();
    CerrarSesion();
  });
}


// ====== CAMBIAR CONTRASEÑA ======
if (document.getElementById('changePasswordForm')) {
  document.getElementById('changePasswordForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const usuario = document.getElementById('usernameReset').value.trim();
    const nuevaContrasena = document.getElementById('newPassword').value.trim();
    const confirmarContrasena = document.getElementById('confirmPassword').value.trim();

    // Validar que el campo de usuario no esté vacío
    if (usuario === "") {
      alert("Por favor, ingresa tu nombre de usuario.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Validar que la contraseña no esté vacía
    if (nuevaContrasena === "") {
      alert("Por favor, ingresa una nueva contraseña.");
      return;
    }

    // Enviar solicitud al servidor para cambiar la contraseña
    fetch("LoginHandler.aspx/CambiarContrasena", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, nuevaContrasena })
    })
      .then(res => res.json())  // Obtener respuesta como JSON
      .then(data => {
        const respuesta = data.d; // Extraemos la respuesta del servidor
        console.log("Respuesta del cambio de contraseña:", respuesta);

        if (respuesta === "ok") {
          // Mostrar mensaje de éxito
          alert("Contraseña cambiada exitosamente.");

          // Cerrar el modal después de cambiar la contraseña
          const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
          modal.hide();

          // Limpiar el formulario de cambio de contraseña
          document.getElementById('changePasswordForm').reset();
        } else {
          // En caso de error, mostrar un mensaje
          alert(respuesta || "Hubo un error al cambiar la contraseña. Inténtalo de nuevo.");
        }
      })
      .catch(err => {
        console.error("Error al cambiar la contraseña:", err);
        alert("Error al cambiar la contraseña.");
      });
  });
}

