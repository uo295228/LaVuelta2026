"use strict";

class Ciudad {
    constructor(nombre, pais, gentilicio) {
        this.nombre = nombre;
        this.pais = pais;
        this.gentilicio = gentilicio;
        this.poblacion = "";
        this.coordenadas = "";
    }

    rellenarAtributos(poblacion, coordenadas) {
        this.poblacion = poblacion;
        this.coordenadas = coordenadas;
    }

    getCiudad() {
        return this.nombre;
    }

    getPais() {
        return this.pais;
    }

    getInformacionSecundaria() {
        return `<ul>
                    <li>Gentilicio: ${this.gentilicio}</li>
                    <li>Población: ${this.poblacion} habitantes</li>
                </ul>`;
    }

    escribeCoordenadas(nodo) {
        const p = document.createElement("p");
        p.textContent = `Coordenadas: ${this.coordenadas}`;
        nodo.appendChild(p);
    }

    // --- P10 Ejercicio 2 - Tarea 3: Llamada AJAX para obtener datos meteorológicos en XML ---
    getMeteorologia() {
        // ¡IMPORTANTE!: Sustituye el texto entre comillas por tu API Key de OpenWeatherMap
        const apikey = "a51290865887ebc4a79b0d6cf213e6ca";
        const tipo = "&mode=xml";
        const unidades = "&units=metric";
        const idioma = "&lang=es";
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${this.nombre}${tipo}${unidades}${idioma}&APPID=${apikey}`;

        $.ajax({
            dataType: "xml",
            url: url,
            method: "GET",
            success: (datos) => {
                this.procesarXML(datos);
            },
            error: (error) => {
                console.error("Error al obtener el XML de OpenWeatherMap:", error);
            }
        });
    }

    // --- P10 Ejercicio 2 - Tareas 4 y 5: Procesar el XML e inyectar la sección en meteorologia.html ---
    procesarXML(datos) {
        // 1. Extraer los parámetros del árbol XML usando jQuery
        const icono = $("weather", datos).attr("icon");
        const estadoCielo = $("weather", datos).attr("value");

        const temperatura = $("temperature", datos).attr("value");
        const tempUnidad = $("temperature", datos).attr("unit");

        const sensacion = $("feels_like", datos).attr("value");
        const sensacionUnidad = $("feels_like", datos).attr("unit");

        const humedad = $("humidity", datos).attr("value");
        const humedadUnidad = $("humidity", datos).attr("unit");

        const presion = $("pressure", datos).attr("value");
        const presionUnidad = $("pressure", datos).attr("unit");

        const velViento = $("speed", datos).attr("value");
        const dirVientoGrados = $("direction", datos).attr("value") || "0";
        const dirVientoNombre = $("direction", datos).attr("name") || "Variable";

        // Las horas de salida y puesta del sol vienen en formato UTC (ISO) en el XML
        const amanecerUTC = $("sun", datos).attr("rise");
        const atardecerUTC = $("sun", datos).attr("set");
        const horaAmanecer = new Date(amanecerUTC + "Z").toLocaleTimeString("es-ES");
        const horaAtardecer = new Date(atardecerUTC + "Z").toLocaleTimeString("es-ES");

        // 2. Formatear la fecha actual como dd/MM/YYYY para el encabezado h3
        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, "0");
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const anio = hoy.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${anio}`;

        // 3. Crear los elementos HTML con jQuery (Tarea 5)
        const $seccionMeteo = $("<section></section>");
        const $h3 = $("<h3></h3>").text(`El tiempo meteorológico hoy (${fechaFormateada})`);
        
        const $imgIcono = $("<img>").attr({
            src: `https://openweathermap.org/img/wn/${icono}@2x.png`,
            alt: `Icono del tiempo: ${estadoCielo}`,
            width: "100",
            height: "100"
        });

        const $lista = $("<ul></ul>");
        $lista.append($("<li></li>").text(`Temperatura actual: ${temperatura} °C (${ tempUnidad })`));
        $lista.append($("<li></li>").text(`Sensación térmica: ${sensacion} °C (${ sensacionUnidad })`));
        $lista.append($("<li></li>").text(`Humedad: ${humedad} ${humedadUnidad}`));
        $lista.append($("<li></li>").text(`Presión atmosférica: ${presion} ${presionUnidad}`));
        $lista.append($("<li></li>").text(`Velocidad del viento: ${velViento} m/s`));
        $lista.append($("<li></li>").text(`Dirección del viento: ${dirVientoGrados}° (${dirVientoNombre})`));
        $lista.append($("<li></li>").text(`Hora de salida del sol: ${horaAmanecer}`));
        $lista.append($("<li></li>").text(`Hora de puesta del sol: ${horaAtardecer}`));

        // 4. Montar la sección en orden: h3 -> img -> ul y añadirla al main
        $seccionMeteo.append($h3);
        $seccionMeteo.append($imgIcono);
        $seccionMeteo.append($lista);

        $("main").append($seccionMeteo);
    }
}

// 1. Instanciación y llenado de atributos
const ciudadSalida = new Ciudad("Cartagena", "España", "Cartagenero/a");
ciudadSalida.rellenarAtributos("216.961", "37°36′07″N 0°59′03″O");

// 2. Creación dinámica del DOM (section y h3)
const sectionCiudad = document.createElement("section");
const h3Ciudad = document.createElement("h3");
h3Ciudad.textContent = `${ciudadSalida.getCiudad()} - ${ciudadSalida.getPais()}`;
sectionCiudad.appendChild(h3Ciudad);

// 3. Inserción de la lista y las coordenadas
sectionCiudad.insertAdjacentHTML("beforeend", ciudadSalida.getInformacionSecundaria());
ciudadSalida.escribeCoordenadas(sectionCiudad);

// 4. Inserción en el documento meteorologia.html tras el h2
const h2Meteo = document.querySelector("main h2");
if (h2Meteo) {
    h2Meteo.insertAdjacentElement("afterend", sectionCiudad);
}

// 5. Invocar la consulta meteorológica (Ejercicio 2 de P10)
ciudadSalida.getMeteorologia();