document.addEventListener("DOMContentLoaded", () => {
  const formEncuesta = document.getElementById("formEncuesta")

  if (formEncuesta) {
    formEncuesta.addEventListener("submit", (e) => {
      e.preventDefault()

      const usuario = localStorage.getItem("usuario") || "Invitado"

      const encuesta = {
        resolucion: document.getElementById("resolucion").value,
        tiempo: document.getElementById("tiempo").value,
        comunicacion: document.getElementById("comunicacion").value,
        amabilidad: document.getElementById("amabilidad").value,
        satisfaccion: document.getElementById("satisfaccion").value,
        recomendacion: document.getElementById("recomendacion").value,
        comentario: document.getElementById("comentario").value || "Sin comentarios",
        usuario: usuario,
      }

      // Validar que todos los campos requeridos estén completos
      for (const key in encuesta) {
        if (key !== "comentario" && !encuesta[key]) {
          alert("Por favor complete todos los campos requeridos")
          return
        }
      }

      fetch("Encuesta.aspx/GuardarEncuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encuesta }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.d === "ok") {
            alert("¡Gracias por completar la encuesta!")
            formEncuesta.reset()
          } else {
            alert("Error al guardar: " + data.d)
          }
        })
        .catch((err) => {
          console.error("Error al enviar la encuesta:", err)
          alert("Error al enviar la encuesta. Consulta la consola para más detalles.")
        })
    })
  }
})