"use strict";
class CargadorKML {
    constructor(ruta) {
        this.ruta_kml = ruta;
        this.xml = null;
        this.puntos_kml = [];
        this.salida = null;
    }

    // Tarea 4: Lectura del archivo etapa.kml usando fetch()
    leerArchivoKML() {
        fetch(this.ruta_kml)
            .then(respuesta => {
                if (!respuesta.ok) {
                    throw new Error("No se pudo cargar el archivo KML");
                }
                return respuesta.text();
            })
            .then(textoKML => {
                const parser = new DOMParser();
                this.xml = parser.parseFromString(textoKML, "application/xml");
                this.procesarArchivoKML();
                this.insertarCapaKML();
            })
            .catch(error => {
                console.error("Error al leer el archivo KML:", error);
            });
    }

    // Tarea 5: Extraer el punto de salida y todos los puntos del recorrido
    procesarArchivoKML() {
        if (!this.xml) return;

        const $kml = $(this.xml);
        this.puntos_kml = [];

        // 1. Punto de salida (primer Placemark con Point)
        const coordSalidaTexto = $kml.find("Placemark Point coordinates").first().text().trim();
        if (coordSalidaTexto) {
            const partes = coordSalidaTexto.split(",");
            // Invertimos lon,lat (KML) a [lat, lon] (Leaflet)
            this.salida = [parseFloat(partes[1]), parseFloat(partes[0])];
        }

        // 2. Todos los puntos de la línea de ruta (LineString)
        const coordLineaTexto = $kml.find("LineString coordinates").first().text().trim();
        if (coordLineaTexto) {
            const lineas = coordLineaTexto.split(/\s+/);
            lineas.forEach(linea => {
                const partes = linea.split(",");
                if (partes.length >= 2) {
                    const lon = parseFloat(partes[0]);
                    const lat = parseFloat(partes[1]);
                    if (!isNaN(lat) && !isNaN(lon)) {
                        this.puntos_kml.push([lat, lon]);
                    }
                }
            });
        }
    }

    // Tarea 6: Crear h3, div y representar el mapa dinámico con Leaflet
    insertarCapaKML() {
        if (!this.salida || this.puntos_kml.length === 0) return;

        const $h3Mapa = $("<h3></h3>").text("Mapa dinámico");
        const $divMapa = $("<div></div>");

        $("main").append($h3Mapa);
        $("main").append($divMapa);

        // Inicializar mapa centrado en la salida
        const mapa = L.map($divMapa[0]).setView(this.salida, 10);

        // Capa base de OpenStreetMap
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapa);

        // Marcador en el punto de salida
        L.marker(this.salida)
            .addTo(mapa)
            .bindPopup("Salida: Cartagena")
            .openPopup();

        // Línea visible conectando todos los puntos del KML
        const recorrido = L.polyline(this.puntos_kml, {
            color: "#7A0000",
            weight: 4
        }).addTo(mapa);

        // Ajustar el zoom para abarcar todo el recorrido
        mapa.fitBounds(recorrido.getBounds());
    }
}

class Etapa {
    constructor() {
        this.xml = null;

        // Tarea 5: Escuchar el evento "change" del input file
        const inputArchivo = document.querySelector("#archivoXML");
        if (inputArchivo) {
            inputArchivo.addEventListener("change", this.cargarArchivo.bind(this));
        }
    }

    // Tarea 5: Leer el archivo local usando el API File (FileReader)
    cargarArchivo(evento) {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = (e) => {
            const parser = new DOMParser();
            this.xml = parser.parseFromString(e.target.result, "application/xml");
            this.procesarXML();
        };
        lector.readAsText(archivo);
    }

    // Invocaciones en el orden exacto que pide el guion (Tareas 6 a 11)
    procesarXML() {
        if (!this.xml) return;

        this.actualizarTitulo();
        this.generarInformacionGeneral();
        this.generarClasificaciones();
        this.generarMultimedia();
        this.generarAltimetria();
     
        // Ej 5 - Tarea 6: Cargar y mostrar el mapa dinámico debajo de la altimetría
        const cargadorKML = new CargadorKML("xml/etapa.kml");
        cargadorKML.leerArchivoKML();

        this.limpiarSelector();
    }

    // Tarea 6: Modificar el h2
    actualizarTitulo() {
        const $xml = $(this.xml);
        const numEtapa = $xml.find("numero").text().trim();
        const salidaEtapa = $xml.find("ciudad_salida").text().trim();
        const metaEtapa = $xml.find("ciudad_llegada").text().trim();
        const fechaEtapa = $xml.find("fecha").text().trim();

        $("main h2").text(`Etapa ${numEtapa}: ${salidaEtapa} a ${metaEtapa} (${fechaEtapa})`);
    }

    // Tarea 7: Sección "Datos" y subapartado "Referencias"
    generarInformacionGeneral() {
        const $xml = $(this.xml);

        const $longitud = $xml.find("longitud");
        const $desnivel = $xml.find("desnivel");
        const tiempoGanador = $xml.find("tiempo_ganador").text().trim();

        const $sal = $xml.find("coordenadas_salida");
        const coordSalida = `Latitud: ${$sal.find("latitud_geo").text().trim()}°, Longitud: ${$sal.find("longitud_geo").text().trim()}°, Altitud: ${$sal.find("altitud").text().trim()} m`;

        const $lleg = $xml.find("coordenadas_llegada");
        const coordMeta = `Latitud: ${$lleg.find("latitud_geo").text().trim()}°, Longitud: ${$lleg.find("longitud_geo").text().trim()}°, Altitud: ${$lleg.find("altitud").text().trim()} m`;

        const $seccion = $("<section></section>");
        $seccion.append($("<h3></h3>").text("Datos"));

        const $ulDatos = $("<ul></ul>");
        $ulDatos.append($("<li></li>").text(`Longitud: ${$longitud.text().trim()} ${$longitud.attr("unidad")}`));
        $ulDatos.append($("<li></li>").text(`Desnivel: ${$desnivel.text().trim()} ${$desnivel.attr("unidad")}`));
        $ulDatos.append($("<li></li>").text(`Tiempo del ganador: ${tiempoGanador}`));
        $ulDatos.append($("<li></li>").text(`Coordenadas de la salida: ${coordSalida}`));
        $ulDatos.append($("<li></li>").text(`Coordenadas de la meta: ${coordMeta}`));
        $seccion.append($ulDatos);

        // Referencias
        $seccion.append($("<h4></h4>").text("Referencias"));
        const $ulRef = $("<ul></ul>");
        $xml.find("referencias > referencia").each((i, ref) => {
            const url = $(ref).text().trim();
            const $li = $("<li></li>");
            const $a = $("<a></a>").attr({
                href: url,
                target: "_blank",
                rel: "noopener noreferrer"
            }).text(url);
            $li.append($a);
            $ulRef.append($li);
        });
        $seccion.append($ulRef);

        $("main").append($seccion);
    }

    // Tarea 8: Sección "Clasificaciones"
    generarClasificaciones() {
        const $xml = $(this.xml);
        const $seccion = $("<section></section>");
        $seccion.append($("<h3></h3>").text("Clasificaciones"));

        // 1. Etapa
        $seccion.append($("<h4></h4>").text("Clasificación de la etapa"));
        const $olEtapa = $("<ol></ol>");
        $xml.find("clasificacion_etapa > clasificado").each((i, item) => {
            const nombre = $(item).find("nombre_ciclista").text().trim();
            const tiempo = $(item).find("tiempo_diferencia").text().trim();
            $olEtapa.append($("<li></li>").text(`${nombre} (${tiempo})`));
        });
        $seccion.append($olEtapa);

        // 2. General
        $seccion.append($("<h4></h4>").text("Clasificación general"));
        const $olGeneral = $("<ol></ol>");
        $xml.find("clasificacion_general > clasificado").each((i, item) => {
            const nombre = $(item).find("nombre_ciclista").text().trim();
            const tiempo = $(item).find("tiempo_diferencia").text().trim();
            $olGeneral.append($("<li></li>").text(`${nombre} (${tiempo})`));
        });
        $seccion.append($olGeneral);

        // 3. Equipos
        $seccion.append($("<h4></h4>").text("Clasificación general por equipos"));
        const $olEquipos = $("<ol></ol>");
        $xml.find("clasificacion_equipos > clasificado_equipo").each((i, item) => {
            const nombre = $(item).find("nombre_equipo").text().trim();
            const tiempo = $(item).find("tiempo_diferencia").text().trim();
            $olEquipos.append($("<li></li>").text(`${nombre} (${tiempo})`));
        });
        $seccion.append($olEquipos);

        $("main").append($seccion);
    }

    // Tarea 9: Sección "Multimedia"
    generarMultimedia() {
        const $xml = $(this.xml);
        const $seccion = $("<section></section>");
        $seccion.append($("<h3></h3>").text("Multimedia"));

        // Fotos
        $xml.find("galeria_fotografias > fotografia").each((i, foto) => {
            const ruta = $(foto).text().trim();
            $seccion.append($("<img>").attr({
                src: ruta,
                alt: `Fotografía ${i + 1} de la etapa`
            }));
        });

        // Vídeos
        $xml.find("galeria_videos > video").each((i, vid) => {
            const ruta = $(vid).text().trim();
            const $video = $("<video></video>").attr("controls", "controls");
            $video.append($("<source>").attr({
                src: ruta,
                type: "video/mp4"
            }));
            $seccion.append($video);
        });

        // Audios
        $xml.find("galeria_sonidos > audio").each((i, aud) => {
            const ruta = $(aud).text().trim();
            const $audio = $("<audio></audio>").attr("controls", "controls");
            $audio.append($("<source>").attr({
                src: ruta,
                type: "audio/mpeg"
            }));
            $seccion.append($audio);
        });

        $("main").append($seccion);
    }

    // Tarea 10: Sección "Altimetría"
    generarAltimetria() {
        const $seccion = $("<section></section>");
        $seccion.append($("<h3></h3>").text("Altimetría"));
        $seccion.append($("<img>").attr({
            src: "xml/altimetria.svg",
            alt: "Perfil altimétrico de la etapa 11: Cartagena - Lorca"
        }));
        $("main").append($seccion);
    }

    // Tarea 11: Eliminar el selector de archivo
    limpiarSelector() {
        $("label[for='archivoXML']").remove();
        $("#archivoXML").remove();
    }
}

const etapa = new Etapa();