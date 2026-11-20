"use strict";

class Formulario {
    constructor() {
        this.puntuacion = 0;
        this.dureza = "";
        this.descripcion = "";
        this.usuario = "";

        // Seleccionamos el botón submit del formulario
        const botonSubmit = document.querySelector('form button[type="submit"]');
        if (botonSubmit) {
            // Usamos bind para no perder el contexto 'this' de la clase al hacer click
            botonSubmit.addEventListener("click", this.analizar.bind(this));
        }
    }

    analizar(event) {
        // Evita que el formulario recargue la página al enviarse
        event.preventDefault();
        
        this.puntuacion = 0; // Reiniciamos por si el usuario pulsa varias veces

        // Obtenemos el formulario más próximo al botón pulsado
        const form = event.target.closest("form");
        if (!form) return;

        // 1. Guardar las respuestas de los campos informativos (sin puntuar)
        const inputUsuario = form.querySelector('input[name="nombre-participante"]');
        this.usuario = inputUsuario ? inputUsuario.value : "Usuario";

        const inputDureza = form.querySelector('input[name="dureza-etapa"]');
        this.dureza = inputDureza ? inputDureza.value : "Desconocida";

        const inputDescripcion = form.querySelector('textarea[name="descripcion-etapa"]');
        this.descripcion = inputDescripcion ? inputDescripcion.value : "Sin descripción";

        // 2. Comprobar las preguntas evaluables
        // Pregunta 1: Número de etapa
        const respEtapa = form.querySelector('input[name="num-etapa"]');
        if (respEtapa && respEtapa.value === "11") { 
            this.puntuacion++;
        }
        
        // Pregunta 2: Fecha de celebración (YYYY-MM-DD format for input type="date")
        const respFecha = form.querySelector('input[name="fecha-etapa"]');
        if (respFecha && respFecha.value === "2026-09-02") { 
            this.puntuacion++;
        }

        // Pregunta 3: Ciudad de salida
        const respSalida = form.querySelector('select[name="salida-etapa"]');
        if (respSalida && respSalida.value === "cartagena") { 
            this.puntuacion++;
        }
        // Pregunta 3b: Ciudad de llegada
        const respLlegada = form.querySelector('select[name="llegada-etapa"]');
        if (respLlegada && respLlegada.value === "lorca") { 
            this.puntuacion++;
        }
        
        // Pregunta 4: Tipo de etapa
        const respTipo = form.querySelector('input[name="tipo-etapa"]:checked');
        if (respTipo && respTipo.value === "llana") {
            this.puntuacion++;
        }
        
        // Pregunta 5: Hitos presentes
        const respHitos = form.querySelector('input[name="hitos"]:checked');
        if (respHitos && respHitos.value === "puerto") {
            this.puntuacion++;
        }
        
        // Pregunta 6: Longitud de la etapa
        const respLongitud = form.querySelector('input[name="longitud-etapa"]');
        if (respLongitud && respLongitud.value === "153.8") {
            this.puntuacion++;
        }
        
        // Pregunta 7: Desnivel acumulado
        const respDesnivel = form.querySelector('input[name="desnivel-etapa"]');
        if (respDesnivel && respDesnivel.value === "1351") {
            this.puntuacion++;
        }

        // 3. Invocar al método de calificación
        this.calificar(form);
    }

    calificar(form) {
        // Borramos el resultado anterior si el usuario envía el formulario varias veces
        const resultadoPrevio = document.querySelector("#resultado-calificacion");
        if (resultadoPrevio) {
            resultadoPrevio.remove();
        }

        // Creamos el nuevo párrafo con el mensaje que pide el guion
        const p = document.createElement("p");
        p.id = "resultado-calificacion";
        p.textContent = `${this.usuario} has obtenido ${this.puntuacion} puntos, la dureza que has asignado a la etapa es ${this.dureza} y tu descripción ${this.descripcion}`;

        // Lo insertamos justo debajo del formulario
        form.insertAdjacentElement("afterend", p);
    }
}

// Inicializamos la clase
const formularioJuego = new Formulario();