"use strict";

class Menu {
    constructor() {
        this.boton = document.querySelector('header > button');
        this.menu = document.querySelector('header > nav');

        if (this.boton && this.menu) {
            this.boton.addEventListener('click', this.desplegar.bind(this));
        }
    }

    desplegar() {
        const nav = document.querySelector('nav');
        nav.classList.toggle('abierto');

        if (nav.classList.contains('abierto')) {
            this.boton.textContent = 'x';
            this.boton.setAttribute('aria-expanded', 'true');
        } else {
            this.boton.textContent = '☰';
            this.boton.setAttribute('aria-expanded', 'false');
        }
    }
}

const menu = new Menu();