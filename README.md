# PAPIME PE101825 - Sitio Web Educativo

Sitio web del proyecto **PAPIME PE101825** de la Facultad de Ingeniería, UNAM. Plataforma educativa para la enseñanza de Geología y Ciencias de la Tierra con recursos interactivos.

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Construir el proyecto
npm run build

# 3. Iniciar servidor local
npm run serve

# 4. O hacer ambos en un solo comando
npm run dev
```

El sitio estará disponible en **http://localhost:3000**

## 📁 Estructura del Proyecto

```
sitio-web-papime/
├── build.js              # Script de construcción
├── serve.js              # Servidor de desarrollo
├── package.json          # Dependencias y scripts
├── legacy/               # Versión anterior (referencia)
└── project/
    ├── src/              # ⚡ ARCHIVOS FUENTE (editar aquí)
    │   ├── html/
    │   │   ├── pages/        # Páginas principales
    │   │   ├── partials/     # Componentes reutilizables
    │   │   └── data/         # Datos JSON (estaciones, modelos)
    │   ├── css/
    │   │   ├── tokens.css    # Variables CSS
    │   │   ├── base.css      # Estilos base
    │   │   ├── layout.css    # Layout general
    │   │   ├── components.css # Componentes
    │   │   └── pages/        # Estilos por página
    │   └── assets/
    │       ├── img/          # Imágenes y logos
    │       ├── fichas/       # PDFs de infografías
    │       ├── icons/        # Iconos
    │       └── FOTOS PARA CARRUSEL/  # Fotos de estaciones
    └── dist/             # 📦 ARCHIVOS COMPILADOS (no editar)
```

## 📄 Páginas del Sitio

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Inicio | `index.html` | Página principal con navegación |
| Proyecto | `proyecto.html` | Información del proyecto PAPIME |
| Práctica Virtual | `practica-virtual.html` | 8 estaciones geológicas con carruseles, modelos 3D, fotos 360° |
| Modelos 3D | `modelos-3d.html` | Galería de modelos Sketchfab |
| Aulas Virtuales | `aulas-virtuales.html` | Enlaces a espacios en Spatial.io |
| Catálogos | `catalogos.html` | Colecciones de muestras |
| Material Multimedia | `material-multimedia.html` | Videos y recursos |
| Manuales y Recursos | `manuales-recursos.html` | Documentación descargable |

## 🔧 Sistema de Build

El proyecto usa un sistema de templates con `<!-- include -->`:

```html
<!-- En cualquier página -->
<!-- include partials/head.html -->
<!-- include partials/header.html -->
<!-- contenido de la página -->
<!-- include partials/footer.html -->
```

Al ejecutar `npm run build`:
1. Lee archivos de `src/html/pages/`
2. Reemplaza los `<!-- include -->` con el contenido de los partials
3. Copia CSS, assets y data a `dist/`
4. El resultado final queda en `project/dist/`

## 🎨 Estilos CSS

Los estilos usan **CSS custom properties** (variables):

```css
/* tokens.css - Variables globales */
:root {
  --brand: #667eea;        /* Color principal */
  --brand-hover: #5a67d8;  /* Hover del brand */
  --bg: #ffffff;           /* Fondo */
  --fg: #1a202c;           /* Texto */
  /* ... más variables */
}
```

Cada página tiene su propio archivo CSS en `css/pages/`.

## 🗺️ Datos de Estaciones (practica-virtual)

Las estaciones se definen en `src/html/data/estaciones.json`:

```json
{
  "id": 2,
  "nombre": "Laguna de Atexcac",
  "ubicacion": "Puebla",
  "descripcion": "Lago de cráter maar...",
  "foto360": "https://kuula.co/post/...",
  "modelo3d": "https://sketchfab.com/...",
  "sketchfabId": "3e255f3be2734836bc48b63a9374d70d",
  "ficha": "assets/fichas/Laguna de Atexcac.pdf"
}
```

## 🔗 Servicios Externos Utilizados

- **Sketchfab** - Modelos 3D embebidos
- **Kuula** - Fotos 360°
- **Spatial.io** - Aulas virtuales/metaverso

## ✏️ Cómo Hacer Cambios

### Modificar una página existente
1. Edita el archivo en `project/src/html/pages/`
2. Ejecuta `npm run build`
3. Revisa en `http://localhost:3000`

### Agregar una nueva estación
1. Agrega datos en `estaciones.json`
2. Agrega fotos en `assets/FOTOS PARA CARRUSEL/`
3. Agrega el HTML de la estación en `practica-virtual.html`
4. Ejecuta `npm run build`

### Cambiar estilos globales
1. Modifica variables en `tokens.css`
2. O agrega reglas en `components.css`
3. Ejecuta `npm run build`

## 📝 Notas Importantes

- **Siempre edita en `src/`**, nunca directamente en `dist/`
- Los cambios en `dist/` se sobrescriben al hacer build
- El modal de modelos 3D incluye logos de UNAM y DGAPA automáticamente
- Las infografías PDF están en `assets/fichas/`

## 👥 Créditos

**Proyecto PAPIME PE101825**
- Facultad de Ingeniería, UNAM
- DGAPA - Dirección General de Asuntos del Personal Académico

---

*Última actualización: Enero 2026*

