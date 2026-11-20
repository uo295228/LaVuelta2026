"use strict";
class Ciclista {
    constructor(datos) {
        this.nombre = datos.nombre;
        this.apellidos = datos.apellidos;
        this.dorsal = datos.dorsal;
        this.fechaNacimiento = datos.fecha_nacimiento; // Ajustado a la clave real del JSON[cite: 429]
        this.nacionalidad = datos.nacionalidad; // Ajustado a la clave real del JSON[cite: 429]
    }

    getNombreCompleto() {
        return `${this.nombre} - ${this.apellidos}`;
    }

    getDorsal() {
        return this.dorsal;
    }

    getInformacionAdicional() {
        return `${this.fechaNacimiento}, ${this.nacionalidad}`;
    }
}
class Equipo {
    constructor(nombre, codigoUCI, pais) {
        this.nombre = nombre;
        this.codigoUCI = codigoUCI;
        this.pais = pais;
        this.director = "";
        this.categoria = "";
        this.paginaWeb = "";
        this.alineacion = [];
    }

    rellenarAtributos(director, categoria, paginaWeb) {
        this.director = director;
        this.categoria = categoria;
        this.paginaWeb = paginaWeb;
    }

    datosBasicos() {
        return `${this.nombre} (${this.codigoUCI})`;
    }

    getPais() {
        return this.pais;
    }

    getInformacionSecundaria() {
       
        return `<ul>
                    <li>Director: ${this.director}</li>
                    <li>Categoría: ${this.categoria}</li>
                </ul>`;
    }

    getPaginaWeb(nodo) {
        
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = this.paginaWeb;
        a.textContent = "Ficha oficial del equipo en La Vuelta";
        p.appendChild(a);
        nodo.appendChild(p);
    }

    async leerEquipo() {
        try {
            // Lee el fichero local 
            const respuesta = await fetch('js/lavuelta.json');
            const datos = await respuesta.json();

            // Filtrar usando find() para buscar el equipo por su código UCI en la raíz "equipos"
            const equipoJSON = datos.equipos.find(eq => eq.codigo_uci === this.codigoUCI);

            if (equipoJSON) {
                // Si lo encuentra pasamos array
                this.alinearCiclistas(equipoJSON.corredores); 
            }
        } catch (error) {
            console.error("Error al leer el archivo JSON: ", error);
        }
    }


    alinearCiclistas(corredoresJSON) {
   
        corredoresJSON.forEach(datosCiclista => {
            const nuevoCiclista = new Ciclista(datosCiclista);
            this.alineacion.push(nuevoCiclista);
        });

        // Llamamos al método que pintará el HTML
        this.mostrarAlineacion();
}
// --- Ejercicio 1: Tarea 6 - Inyectar ciclistas en el DOM ---
    mostrarAlineacion() {
       // Seleccionamos la última sección dentro del main (que es la de la alineación)
      const seccionAlineacion = document.querySelector("main section:last-of-type");
        if (!seccionAlineacion) return;

        // Limpiamos contenido previo (para borrar los estáticos) y mantenemos el título[cite: 411]
        seccionAlineacion.innerHTML = "<h3>Alineación de corredores</h3>";

        // Ordenamos la colección ascendentemente por dorsal[cite: 411]
        this.alineacion.sort((a, b) => a.getDorsal() - b.getDorsal());

      // Recorremos la colección para crear y añadir cada <article>
        this.alineacion.forEach(ciclista => {
            const article = document.createElement("article");
            
            // Generamos la estructura HTML para cada ficha de corredor
            article.innerHTML = `
                <h4>${ciclista.getNombreCompleto()}</h4>
                <img src="multimedia/icono.png" alt="Icono de ciclista genérico" width="128" height="128">
                <p>Dorsal: ${ciclista.getDorsal()}</p>
                <p>${ciclista.getInformacionAdicional()}</p>
            `;
            
            seccionAlineacion.appendChild(article);
        });
    }
}

// 1. Instanciación usando los datos
const equipo = new Equipo("NSN Cycling Team", "NSN", "Suiza");
equipo.rellenarAtributos(
    "Oscar Guerrero Celaya", 
    "UCI WorldTeam", 
    "https://www.lavuelta.es/es/equipo/NSN/nsn-cycling-team"
);

// 2. Creación de la sección y el encabezado
const sectionEquipo = document.createElement("section");
const h3Equipo = document.createElement("h3");
h3Equipo.textContent = `${equipo.datosBasicos()} - ${equipo.getPais()}`;
sectionEquipo.appendChild(h3Equipo);

// 3. Inserción de la lista y la página web
sectionEquipo.insertAdjacentHTML("beforeend", equipo.getInformacionSecundaria());
equipo.getPaginaWeb(sectionEquipo);

// 4. Inserción en el documento equipo.html tras el h2
const h2Equipo = document.querySelector("main h2");
if (h2Equipo) {
    h2Equipo.insertAdjacentElement("afterend", sectionEquipo);
}

//  Disparar la lectura del JSON y generación de cuadrícula
equipo.leerEquipo();