# B&N Servicios — modo oscuro premium

Reconstrucción responsive de la referencia visual oscura de B&N Servicios.

## Ejecutar en local

Desde esta carpeta:

```powershell
node server.mjs
```

La dirección predeterminada es `http://127.0.0.1:4174/`. También puede abrirse `index.html` directamente, aunque el servidor local ofrece una previsualización más fiel.

## Estructura

- `index.html`: estructura semántica y contenido.
- `styles.css`: diseño visual y adaptación responsive.
- `script.js`: menú móvil accesible.
- `server.mjs`: servidor local sin dependencias.
- `qa.mjs`: capturas automatizadas de escritorio, tablet y móvil.
- `assets/`: fotografías, equipos, logos y recursos gráficos locales.
- `design/reference-dark.png`: referencia visual utilizada para la reconstrucción.
