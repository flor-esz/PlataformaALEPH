# Guidelines de ALEPH — reglas persistentes para Figma Make

Estas son reglas de diseño y producto que debes respetar en **toda** generación de este proyecto, sin excepción, aunque un prompt puntual no las repita. Si un prompt contradice una regla marcada como no negociable, prioriza esta guía.

## Producto
ALEPH es una plataforma de inteligencia regulatoria con identidad propia (no es un sub-brand). Audita el stock regulatorio de un país e identifica barreras regulatorias y trámites con fricciones, cada uno anclado a su fuente legal. Esencia: **"Evidencia desde el origen"**. Principio: **"Nada escapa, nada se inventa"**. La vista actual es la del usuario del BID (analista regional multi-país). El usuario ve resultados de análisis ya procesados, nunca estado de agentes en tiempo real.

## Dos sistemas de estilo conviven (oct 2026) — LEER ANTES DE GENERAR
Hay un rediseño visual aprobado ("Editorial luminosa"). Se aplica por etapas:

1. **Sistema vigente, ya homologado** — `src/app/theme.ts` (objeto `C`) + `src/styles/theme.css`. Mismos nombres de siempre, valores del rediseño. Lo usan TODAS las pantallas existentes, incluido el panel de **Administración** (Usuarios, Catálogos, Fuentes, Bitácora). No se renombra ninguna llave de `C`.
2. **Sistema nuevo** — `src/app/themeEditorial.ts` (objeto `E`). Lo usan SOLO las pantallas rediseñadas que entregue el diseñador. No mezclar `C` y `E` dentro de una misma pantalla.

Cuando ya no quede ninguna pantalla que lea `C`, se elimina `C`.

## Color (no negociable)
- Fondo de contenido: `#F5F4F1` (`C.canvas`). Tarjetas y paneles: `#FFFFFF` (`C.card`).
- Menú lateral: degradado azul `C.sidebarGradient` (`#0A5A80 → #004E70 → #003A55`), con texto claro. Se aplica con `background`, no con `backgroundColor`.
- Azul de marca BID: primario `#004E70`; cian `#009ADE` solo como acento (indicador activo, foco). Rampa azul de estructura/gráficas: `#94B4C4 → #5E90A8 → #196E8C → #004E70`.
- Bordes: `#E7E4DE`. Texto principal `#1E1E1E`; secundario `#6F6C66`.
- Verde (`#266736`, fondo `#E8F1D7`) = éxito / mejora / oportunidad. No se usa en severidad.
- Errores y acciones destructivas que NO son severidad (Inactivo, Deshabilitar, formularios): `C.error` / `C.errorBg`.

## Severidad (no negociable)
Escala visual de 3 niveles: **Alta** vino `#9C1F45`, **Media** ámbar `#E0892A`, **Baja** gris `#A9B6BF`. Nunca solo color: siempre con marcador de barras o etiqueta.
- En `theme.ts` se conservan las llaves `critico`, `alto`, `mediano`, `bajo` para no tocar código: `critico` y `alto` → vino; `mediano` → ámbar; `bajo` → gris.
- Los datos y las etiquetas ("Crítico", "Alto"…) NO se modifican en el trabajo de estilos. Si el backend o el BID cambian la escala a 3 niveles, eso es un cambio aparte.
- El vino de severidad no se usa como color decorativo ni categórico.

## Rampa categórica (rankings y series)
Para pantallas viejas se conserva la rampa `C.steel1…steel4`. En las rediseñadas: color fijo por país (`E.paises`) y rampas tonales (`E.rampas`) solo cuando el dato tiene orden. El color sigue a la entidad, no a la posición en el ranking.

## Tipografía (no negociable)
- **Inter** en toda la plataforma (pesos 300–800). Títulos de página con mezcla de pesos (300 + 750). Cifras con numeración tabular y formato es-CO (`1.250`, `0,42`).
- Los nombres "Space Grotesk" e "IBM Plex Sans" siguen apareciendo en el código heredado, pero son **alias que cargan Inter** (`src/styles/fonts.css`). En código nuevo escribir `Inter`.
- No usar fuentes monoespaciadas.

## Marca
Logotipo del rediseño: iniciales "RL" (peso 800) sobre cuadrado redondeado azul; nombre "Reg" (800) + "LAC" (300) en Inter. Menú contraído: solo las iniciales. Propuesta sujeta a decisión del equipo del BID.

## Estilo general
Minimalista, sobrio, institucional pero moderno. Mucho espacio en blanco. NO es dark mode completo: contenido claro, menú lateral azul de marca. Densidad de datos alta pero ordenada, tipo herramienta analítica profesional. Tarjetas con esquinas redondeadas (16 px), sombra suave, controles tipo píldora, charts planos sin 3D.

## Navegación (estructura fija)
- Menú lateral azul persistente en todas las pantallas. De arriba a abajo: logo ALEPH; **switcher de país** (Todos · Honduras · Paraguay · Ecuador · El Salvador · Guatemala); menú con **Regulaciones** como ítem padre y submenú **Dashboard · Barreras · Trámites**; luego **Comparativa** y **Repositorio**; un **selector de idioma ES/EN**; y **Salir**. El ítem activo se resalta con un indicador sutil.
- **El switcher gobierna el contexto de datos, no la estructura**: las mismas pantallas sirven para "Todos" (Panel Regional agregado) y para un país (solo ese país). Cambian título, números y alcance; no la estructura, gráficas ni tablas.
- En este alcance se desarrollan a fondo el Dashboard, Barreras y Trámites. Comparativa y Repositorio quedan enunciados (placeholder "En construcción").
- El selector de sector NO es ítem del sidebar: es un dropdown junto al título en Barreras y Trámites.
- Chrome del header: breadcrumb pequeño, título grande (Panel Regional o país) + subtítulo; a la derecha campana + avatar de usuaria; botón "Exportar informe" cuando aplique.

## Costo (dimensión transversal)
Los trámites tienen costo vía el modelo SCM (`costeo_scm`): costo monetario, tiempo promedio, frecuencia anual e indicador de carga total (lo que cuesta mantener el trámite). Aparece en KPIs, ranking regional por costo (dona), costo por sector y costo por tipo (ciudadano/empresarial). Todos los costos son **datos simulados** hasta integrar la fórmula real; márcalos como tales.

## Patrón "Evidencia desde el origen" (no negociable)
Toda barrera, en su detalle, debe mostrar el texto normativo de origen en un panel tipo documento, con el pasaje exacto de la barrera **resaltado** (highlight suave + marca lateral en azul acero) y su metadata (instrumento, número, año, jerarquía). La propuesta de reforma se presenta como bloque **"Dice / Debe Decir"**. El texto legal literal es contenido de muestra hasta incorporar la cita oficial: señálalo discretamente como "texto de muestra".

## Puentes entre módulos
Barreras y Trámites son módulos separados conectados por puentes contextuales: en una barrera, "Afecta a N trámites"; en un trámite, "N barreras afectan este trámite". Una barrera puede afectar varios trámites.

## Idioma
Toda la interfaz en español.
