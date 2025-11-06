```markdown
# sitio-web-papime
Estructura y scaffolding para un sitio estático (HTML + CSS) escalable

Propuesta de estructura (carpeta `project`):

```
/project
	/src
		/html
			/pages
				index.html
				proyecto.html
				aulas-virtuales.html
				material-multimedia.html
				modelos-3d.html
				catalogos/
					animales-marinos.html
					animales-terrestres.html
					mobiliario.html
					formas-relieve.html
					transporte.html
					rocas-igneas.html
					rocas-sedimentarias.html
					minerales.html
					equipo-campo.html
				practica-virtual.html
				manuales-recursos.html
			/partials
				head.html
				header.html
				footer.html
				breadcrumb.html
				card.html
			/data
				modelos.json
		/css
			tokens.css
			base.css
			layout.css
			components.css
			pages/
				modelos-3d.css
				catalogos.css
			theme-dark.css
			print.css
		/assets
			/img
			/icons
			/pdf
	/dist
```

Cómo usar
- Edita páginas en `project/src/html/pages`.
- Reutiliza parciales en `project/src/html/partials`.
- Mantén variables en `project/src/css/tokens.css` y divide reglas en base/layout/components.
- Copia o empaqueta en `project/dist` para publicar.

Siguientes pasos sugeridos
- Añadir un script de build (PowerShell/Node) para ensamblar parciales a HTML finales en `/dist`.
- Migrar contenido del `index.html` raíz a las páginas individuales bajo `/project/src/html/pages`.

