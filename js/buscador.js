"use strict";

class Buscador {
    constructor() {
        // Tarea 6: Buscar el elemento <img> (lupa) y el <input>
        const lupa = document.querySelector('search label img');
        const input = document.querySelector('search input[type="search"]');

        if (lupa && input) {
            // Manejador del evento click sobre la lupa usando bind(this)
            lupa.addEventListener('click', this.buscar.bind(this));

            // Manejador del evento keypress para buscar también al pulsar la tecla Intro (Enter)
            input.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Evitamos que intente enviar un formulario fantasma
                    this.buscar.bind(this)();
                }
            });
        }
    }

    // Tarea 8: Método para limpiar los resaltados amarillos de búsquedas anteriores
    limpiar_busqueda() {
        // Buscar todos los elementos <mark> en el documento
        const marcas = document.querySelectorAll('mark');
        
        marcas.forEach(marca => {
            // Crear un nodo de texto plano con el mismo texto que había dentro del <mark>
            const nodoTexto = document.createTextNode(marca.textContent);
            // Reemplazar la etiqueta <mark> completa por el nodo de texto
            marca.replaceWith(nodoTexto);
        });
        
        // Normalizar el body para fusionar nodos de texto adyacentes
        document.body.normalize();
    }

    // Tarea 7: Método encargado de realizar la búsqueda
    buscar() {
        // 1. Limpiar búsquedas anteriores lo primero
        this.limpiar_busqueda();

        // Obtener el texto que ha escrito el usuario
        const input = document.querySelector('search input[type="search"]');
        const textoBusqueda = input.value.trim();

        // Si el usuario no ha escrito nada, cancelamos el proceso
        if (textoBusqueda === "") return;

        // 1) Creación del objeto RegExp ('g' para todas las apariciones, 'i' para ignorar mayúsculas)
        const regexp = new RegExp(textoBusqueda, 'gi');

        // 2) Obtener nodos de tipo texto con TreeWalker sobre el body
        const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);

        // Variable para almacenar los resultados
        const resultados = [];

        // 3) Sacar el primer nodo a analizar
        let node = treeWalker.nextNode();

        // 4) Iterar con bucle while para buscar coincidencias
        while (node) {
            // Comprobamos si el texto buscado está dentro de este nodo usando test()
            if (regexp.test(node.textContent)) {
                // Si está, lo guardamos con push()
                resultados.push(node);
            }
            // Pasamos al siguiente nodo
            node = treeWalker.nextNode();
        }

      // 5) Recorrer la variable de resultados y resaltar el texto (Actualizado a v1.2)
        resultados.forEach(nodo => {
            const partes = nodo.textContent.split(new RegExp(`(${textoBusqueda})`, 'gi'));
            nodo.replaceWith(...partes.map((parte, indice) => {
                if (indice % 2 === 0) return document.createTextNode(parte);
                const marca = document.createElement('mark');
                marca.textContent = parte;
                return marca;
            }));
        });
    }
}

// Inicializar la clase
const buscadorWeb = new Buscador();