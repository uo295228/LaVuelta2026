"use strict";

class Carrusel {
    constructor(terminoBusqueda = "La Vuelta ciclismo") {
        
        this.busqueda = terminoBusqueda;
        this.actual = 0;
        this.maximo = 4; 
        this.fotos = [];
    }

   
    getFotografias() {
        const flickrAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
        
        $.getJSON(flickrAPI, {
            tags: this.busqueda,
            tagmode: "any",
            format: "json"
        })
        .done((datos) => {
            this.procesarJSONFotografias(datos);
        })
        .fail((error) => {
            console.error("Error al obtener las fotografías de Flickr:", error);
        });
    }

    procesarJSONFotografias(datos) {
        this.fotos = [];

        if (datos && datos.items) {
          
            $.each(datos.items, (i, item) => {
                if (i <= this.maximo) {
                   
                    const url640 = item.media.m.replace("_m.jpg", "_z.jpg");
                    const titulo = item.title && item.title.trim() !== "" 
                        ? item.title 
                        : `Fotografía ${i + 1} de La Vuelta`;

                    this.fotos.push({
                        url: url640,
                        alt: titulo
                    });
                }
            });
        }

     
        if (this.fotos.length > 0) {
            this.mostrarFotografias();
        }
    }

    mostrarFotografias() {
        const primeraFoto = this.fotos[this.actual];

      
        const $articulo = $("<article></article>");
        const $encabezado = $("<h2></h2>").text("Instantáneas de LaVuelta");
        const $imagen = $("<img>").attr({
            src: primeraFoto.url,
            alt: primeraFoto.alt
        });

    
        $articulo.append($encabezado);
        $articulo.append($imagen);
        $("main").append($articulo);

       
        setInterval(this.cambiarFotografia.bind(this), 3000);
    }

    cambiarFotografia() {
        this.actual++;
        if (this.actual > this.maximo || this.actual >= this.fotos.length) {
            this.actual = 0;
        }

        const fotoActual = this.fotos[this.actual];
        $("article h2 + img").attr({
            src: fotoActual.url,
            alt: fotoActual.alt
        });
    }
}


const carrusel = new Carrusel("vuelta ciclista espana,cycling");
carrusel.getFotografias();