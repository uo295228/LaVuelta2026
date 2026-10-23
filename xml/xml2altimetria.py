# -*- coding: utf-8 -*-
"""
Generador de perfil altimétrico en formato SVG.
Basado estrictamente en el ejemplo polilinea-texto.svg del Tema 1.
"""

import xml.etree.ElementTree as ET

class GeneradorAltimetria(object):
    """
    Clase orientada a objetos para extraer datos altimétricos mediante XPath
    y generar un gráfico vectorial SVG con polilíneas y textos verticales.
    """

    def __init__(self, archivo_xml, archivo_svg):
        self.archivo_xml = archivo_xml
        self.archivo_svg = archivo_svg
        self.ns = {'uo': 'http://www.uniovi.es'}

        # Dimensiones ampliadas del lienzo SVG para dar espacio al texto vertical largo
        self.ancho_svg = 1200
        self.alto_svg = 750
        self.margen_izq = 80
        self.margen_der = 80
        self.margen_sup = 80
        self.margen_inf = 280  # Margen inferior generoso para que quepan los nombres de los hitos

        self.puntos_altimetria = []
        self.longitud_total = 0.0
        self.altitud_maxima = 800  # Escala vertical de referencia (en metros)

        # Creación del elemento raíz SVG según la teoría del Tema 1
        self.raiz_svg = ET.Element('svg', xmlns="http://www.w3.org/2000/svg", version="2.0",
                                   width=str(self.ancho_svg), height=str(self.alto_svg))

    def cargar_y_extraer_datos(self):
        """Extrae distancias y altitudes del XML empleando expresiones XPath."""
        try:
            arbol = ET.parse(self.archivo_xml)
            raiz = arbol.getroot()
        except IOError:
            print(f"Error: No se encuentra el archivo {self.archivo_xml}")
            return False
        except ET.ParseError:
            print(f"Error al analizar el archivo XML {self.archivo_xml}")
            return False

        # Longitud total de la etapa
        self.longitud_total = float(raiz.find('.//uo:longitud', self.ns).text.strip())

        # 1. Salida (Km 0.0)
        salida = raiz.find('.//uo:coordenadas_salida', self.ns)
        alt_salida = float(salida.find('uo:altitud', self.ns).text.strip())
        ciudad_salida = raiz.find('.//uo:ciudad_salida', self.ns).text.strip()
        self.puntos_altimetria.append({'dist': 0.0, 'alt': alt_salida, 'nombre': f"Salida: {ciudad_salida}"})

        # 2. Puntos Anónimos de ruta
        puntos = raiz.findall('.//uo:puntos_anonimos/uo:punto', self.ns)
        for p in puntos:
            dist = float(p.find('uo:distancia_salida', self.ns).text.strip())
            alt = float(p.find('uo:altitud', self.ns).text.strip())
            self.puntos_altimetria.append({'dist': dist, 'alt': alt, 'nombre': f"Km {dist}"})

        # 3. Hitos (Puertos y Sprints)
        hitos = raiz.findall('.//uo:hitos/uo:hito', self.ns)
        for h in hitos:
            dist = float(h.find('uo:distancia_salida', self.ns).text.strip())
            nombre = h.find('uo:nombre_hito', self.ns).text.strip()
            alt = float(h.find('uo:altitud', self.ns).text.strip())
            self.puntos_altimetria.append({'dist': dist, 'alt': alt, 'nombre': nombre})

        # 4. Llegada / Meta
        llegada = raiz.find('.//uo:coordenadas_llegada', self.ns)
        alt_llegada = float(llegada.find('uo:altitud', self.ns).text.strip())
        ciudad_llegada = raiz.find('.//uo:ciudad_llegada', self.ns).text.strip()
        self.puntos_altimetria.append({'dist': self.longitud_total, 'alt': alt_llegada, 'nombre': f"Meta: {ciudad_llegada}"})

        # Ordenar estrictamente por kilómetro de recorrido
        self.puntos_altimetria.sort(key=lambda x: x['dist'])
        return True

    def construir_svg(self):
        """Genera el gráfico vectorial completo basado en polilíneas y textos."""
        if not self.cargar_y_extraer_datos():
            return

        ancho_util = self.ancho_svg - (self.margen_izq + self.margen_der)
        alto_util = self.alto_svg - (self.margen_sup + self.margen_inf)
        base_y = self.alto_svg - self.margen_inf

        # Fondo del gráfico SVG
        ET.SubElement(self.raiz_svg, 'rect', x="0", y="0", width=str(self.ancho_svg), height=str(self.alto_svg), fill="white", stroke="#ccc", strokeWidth="1")

        # Título principal
        titulo = ET.SubElement(self.raiz_svg, 'text', x=str(self.ancho_svg / 2), y="45", fontFamily="Verdana", fontSize="20", style="text-anchor: middle; font-weight: bold; fill: #111;")
        titulo.text = "Perfil Altimétrico - Etapa 11: Cartagena - Lorca (La Vuelta)"

        # Línea de base horizontal (suelo)
        ET.SubElement(self.raiz_svg, 'line', x1=str(self.margen_izq), y1=str(base_y), x2=str(self.ancho_svg - self.margen_der), y2=str(base_y), stroke="black", strokeWidth="2")

        # Construcción de los puntos para la polilínea (siguiendo polilinea-texto.svg)
        puntos_polyline = []

        # Punto inicial inferior para cerrar la polilínea contra el suelo
        puntos_polyline.append(f"{self.margen_izq},{base_y}")

        # Mapeo de coordenadas geográficas/métricas a píxeles del SVG
        for p in self.puntos_altimetria:
            pos_x = self.margen_izq + (p['dist'] / self.longitud_total) * ancho_util
            pos_y = base_y - (p['alt'] / self.altitud_maxima) * alto_util
            puntos_polyline.append(f"{pos_x},{pos_y}")

        # Punto final inferior para cerrar la polilínea contra el suelo
        punto_final_x = self.margen_izq + ancho_util
        puntos_polyline.append(f"{punto_final_x},{base_y}")

        # Volver a repetir el primer punto para cerrar completamente la figura
        puntos_polyline.append(f"{self.margen_izq},{base_y}")

        # Creación del elemento <polyline> principal con los estilos oficiales de los apuntes
        puntos_str = " ".join(puntos_polyline)
        ET.SubElement(self.raiz_svg, 'polyline', points=puntos_str, style="fill: #ffcccc; stroke: red; stroke-width:4")

        # Representación de hitos, líneas de referencia verticales y textos verticales
        for p in self.puntos_altimetria:
            pos_x = self.margen_izq + (p['dist'] / self.longitud_total) * ancho_util
            pos_y = base_y - (p['alt'] / self.altitud_maxima) * alto_util

            # Filtramos para destacar visualmente Salida, Hitos importantes y Meta
            es_relevante = ("Salida" in p['nombre'] or "Meta" in p['nombre'] or "Aledo" in p['nombre'] or "Totana" in p['nombre'])

            if es_relevante:
                # Línea guía vertical discontinua hacia la cima del hito
                ET.SubElement(self.raiz_svg, 'line', x1=str(pos_x), y1=str(base_y), x2=str(pos_x), y2=str(pos_y), stroke="#666", strokeWidth="1", strokeDasharray="3,3")

                # Círculo negro indicador en la cumbre
                ET.SubElement(self.raiz_svg, 'circle', cx=str(pos_x), cy=str(pos_y), r="4", fill="black")

                # Texto vertical exacto según la sintaxis de polilinea-texto.svg
                texto_elem = ET.SubElement(self.raiz_svg, 'text', x=str(pos_x), y=str(base_y + 15), fontFamily="Verdana", fontSize="12", style="writing-mode: tb; glyph-orientation-vertical: 0;")
                texto_elem.text = f"{p['nombre']} ({int(p['alt'])}m)"

        # Escritura del archivo SVG resultante
        arbol_svg = ET.ElementTree(self.raiz_svg)
        try:
            ET.indent(arbol_svg)
        except AttributeError:
            pass

        arbol_svg.write(self.archivo_svg, encoding='utf-8', xml_declaration=True)
        print(f"¡Éxito! Archivo SVG de altimetría generado correctamente en '{self.archivo_svg}'.")


if __name__ == "__main__":
    generador = GeneradorAltimetria("etapaEsquema.xml", "altimetria.svg")
    generador.construir_svg()