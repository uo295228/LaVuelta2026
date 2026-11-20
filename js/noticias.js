"use strict";

class Noticias {
    constructor() {
        // Tarea 3: Inicializar los atributos busqueda y url
        this.busqueda = "La Vuelta | NSN Cycling | ciclismo";
        this.url = "https://api.thenewsapi.com/v1/news/all";
        
      
        this.apiKey = "AcWf8N2aBqEIURmmPlEI1Tz6rvfeapNh5pSkqTlI";
    }

    // Tarea 4: Llamada al servicio web de noticias utilizando fetch() y Promise
    buscar() {
        const urlCompleta = `${this.url}?api_token=${this.apiKey}&search=${encodeURIComponent(this.busqueda)}&language=es`;

        fetch(urlCompleta)
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error("Error en la respuesta de TheNewsApi");
                }
                return respuesta.json();
            })
            .then(datos => {
                this.procesarInformacion(datos);
            })
            .catch(error => {
                console.error("Error al obtener las noticias:", error);
            });
    }

    // Tareas 5 y 6: Extraer las noticias del JSON y añadirlas a index.html debajo del carrusel
    procesarInformacion(datos) {
        // Creamos la sección de Noticias con jQuery
        const $seccionNoticias = $("<section></section>");
        const $tituloSeccion = $("<h3></h3>").text("Noticias");
        $seccionNoticias.append($tituloSeccion);

        if (datos && datos.data && datos.data.length > 0) {
            datos.data.forEach(item => {
                const $articulo = $("<article></article>");
                
                // Titular de la noticia
                const $titular = $("<h4></h4>").text(item.title);
                
                // Entradilla (usamos description o snippet si description viene vacío)
                const textoEntradilla = item.description || item.snippet || "Sin descripción disponible.";
                const $entradilla = $("<p></p>").text(textoEntradilla);
                
                // Enlace a la fuente de la noticia
                const $parrafoEnlace = $("<p></p>");
                const $enlace = $("<a></a>")
                    .attr({
                        href: item.url,
                        target: "_blank",
                        rel: "noopener noreferrer"
                    })
                    .text(`Leer más en ${item.source || "la fuente original"}`);
                
                $parrafoEnlace.append($enlace);

                // Añadimos los elementos al artículo y el artículo a la sección
                $articulo.append($titular);
                $articulo.append($entradilla);
                $articulo.append($parrafoEnlace);
                $seccionNoticias.append($articulo);
            });
        } else {
            $seccionNoticias.append($("<p></p>").text("No se han encontrado noticias recientes."));
        }

        // Insertamos la sección en el main (quedará debajo del carrusel de imágenes)
        $("main").append($seccionNoticias);
    }
}

// Instanciación e invocación
const noticias = new Noticias();
noticias.buscar();
