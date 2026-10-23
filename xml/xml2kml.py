# -*- coding: utf-8 -*-
"""
Generador KML orientado a objetos mediante XPath y ElementTree.
Cumple estrictamente con la teoría de la asignatura.
"""

import xml.etree.ElementTree as ET

class GeneradorKML(object):
    """
    Clase orientada a objetos para procesar el XML de la etapa
    y generar un archivo KML de planimetría con colores diferenciados.
    """

    def __init__(self, archivo_xml, archivo_kml):
        self.archivo_xml = archivo_xml
        self.archivo_kml = archivo_kml
        # Espacio de nombres oficial de la asignatura
        self.ns = {'uo': 'http://www.uniovi.es'}

        self.raiz_kml = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc_kml = ET.SubElement(self.raiz_kml, 'Document')
        self.elementos_etapa = []

    def cargar_y_procesar_xml(self):
        """Carga el documento XML y extrae la información usando expresiones XPath."""
        try:
            arbol = ET.parse(self.archivo_xml)
            raiz = arbol.getroot()
        except IOError:
            print(f"Error: No se encuentra el archivo {self.archivo_xml}")
            return False
        except ET.ParseError:
            print(f"Error al analizar el archivo XML {self.archivo_xml}")
            return False

        # 1. Salida de la etapa (Color Rojo)
        salida = raiz.find('.//uo:coordenadas_salida', self.ns)
        ciudad_salida = raiz.find('.//uo:ciudad_salida', self.ns).text.strip()
        self._agregar_elemento(
            distancia=0.0,
            lon=salida.find('uo:longitud_geo', self.ns).text.strip(),
            lat=salida.find('uo:latitud_geo', self.ns).text.strip(),
            alt=salida.find('uo:altitud', self.ns).text.strip(),
            nombre=f"Salida: {ciudad_salida}",
            desc="Punto de salida oficial de la etapa",
            icono="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        )

        # 2. Puntos Anónimos (Color Amarillo)
        puntos = raiz.findall('.//uo:puntos_anonimos/uo:punto', self.ns)
        for p in puntos:
            dist = float(p.find('uo:distancia_salida', self.ns).text.strip())
            lon = p.find('uo:longitud_geo', self.ns).text.strip()
            lat = p.find('uo:latitud_geo', self.ns).text.strip()
            alt = p.find('uo:altitud', self.ns).text.strip()
            self._agregar_elemento(
                distancia=dist, lon=lon, lat=lat, alt=alt,
                nombre=f"Km {dist}", desc="Punto anónimo de ruta",
                icono="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            )

        # 3. Hitos: Sprints Intermedios (Azul) y Puertos de Montaña (Verde)
        hitos = raiz.findall('.//uo:hitos/uo:hito', self.ns)
        for h in hitos:
            dist = float(h.find('uo:distancia_salida', self.ns).text.strip())
            nombre = h.find('uo:nombre_hito', self.ns).text.strip()
            tipo = h.find('uo:tipo_hito', self.ns).text.strip()
            lon = h.find('uo:longitud_geo', self.ns).text.strip()
            lat = h.find('uo:latitud_geo', self.ns).text.strip()
            alt = h.find('uo:altitud', self.ns).text.strip()

            # Asignación de icono según el tipo de hito
            if "puerto" in tipo.lower() or "alto" in tipo.lower():
                icono = "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            else:
                icono = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"

            self._agregar_elemento(
                distancia=dist, lon=lon, lat=lat, alt=alt,
                nombre=nombre, desc=tipo, icono=icono
            )

        # 4. Meta / Llegada (Color Rojo)
        llegada = raiz.find('.//uo:coordenadas_llegada', self.ns)
        dist_total = float(raiz.find('.//uo:longitud', self.ns).text.strip())
        ciudad_llegada = raiz.find('.//uo:ciudad_llegada', self.ns).text.strip()
        self._agregar_elemento(
            distancia=dist_total,
            lon=llegada.find('uo:longitud_geo', self.ns).text.strip(),
            lat=llegada.find('uo:latitud_geo', self.ns).text.strip(),
            alt=llegada.find('uo:altitud', self.ns).text.strip(),
            nombre=f"Meta: {ciudad_llegada}",
            desc="Llegada oficial de la etapa",
            icono="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
        )

        return True

    def _agregar_elemento(self, distancia, lon, lat, alt, nombre, desc, icono):
        """Almacena internamente los datos geográficos de forma estructurada."""
        self.elementos_etapa.append({
            'dist': distancia, 'lon': lon, 'lat': lat, 'alt': alt,
            'nombre': nombre, 'desc': desc, 'icono': icono
        })

    def construir_kml(self):
        """Genera la estructura de nodos KML y escribe el archivo de salida."""
        if not self.cargar_y_procesar_xml():
            return

        # Ordenar estrictamente por kilómetro para un trazado limpio de la línea
        self.elementos_etapa.sort(key=lambda x: x['dist'])

        coordenadas_linea = []

        for elem in self.elementos_etapa:
            # Crear el marcador (Placemark con Point)
            pm = ET.SubElement(self.doc_kml, 'Placemark')
            ET.SubElement(pm, 'name').text = elem['nombre']
            ET.SubElement(pm, 'description').text = elem['desc']

            estilo = ET.SubElement(pm, 'Style')
            icon_style = ET.SubElement(estilo, 'IconStyle')
            icon = ET.SubElement(icon_style, 'Icon')
            ET.SubElement(icon, 'href').text = elem['icono']

            punto = ET.SubElement(pm, 'Point')
            ET.SubElement(punto, 'coordinates').text = f"{elem['lon']},{elem['lat']},{elem['alt']}"
            ET.SubElement(punto, 'altitudeMode').text = "relativeToGround"

            # Recopilar coordenadas para la línea de ruta
            coordenadas_linea.append(f"{elem['lon']},{elem['lat']},{elem['alt']}")

        # Crear la línea de planimetría que une toda la etapa (LineString rojo)
        pm_linea = ET.SubElement(self.doc_kml, 'Placemark')
        ET.SubElement(pm_linea, 'name').text = "Planimetría Etapa 11"

        style_linea = ET.SubElement(pm_linea, 'Style')
        line_style = ET.SubElement(style_linea, 'LineStyle')
        ET.SubElement(line_style, 'color').text = "ff0000ff" # Rojo KML (AABBGGRR)
        ET.SubElement(line_style, 'width').text = "4"

        ls = ET.SubElement(pm_linea, 'LineString')
        ET.SubElement(ls, 'extrude').text = "1"
        ET.SubElement(ls, 'tessellation').text = "1"
        ET.SubElement(ls, 'coordinates').text = "\n".join(coordenadas_linea)
        ET.SubElement(ls, 'altitudeMode').text = "relativeToGround"

        # Escribir el archivo final formateado
        arbol_kml = ET.ElementTree(self.raiz_kml)
        try:
            ET.indent(arbol_kml)
        except AttributeError:
            pass # Compatibilidad por si la versión de Python es inferior a 3.9

        arbol_kml.write(self.archivo_kml, encoding='utf-8', xml_declaration=True)
        print(f"¡Éxito! Archivo KML generado correctamente en '{self.archivo_kml}'.")

if __name__ == "__main__":
    generador = GeneradorKML("etapaEsquema.xml", "etapa.kml")
    generador.construir_kml()