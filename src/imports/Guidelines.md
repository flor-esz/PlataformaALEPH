# Guidelines de ALEPH — reglas persistentes para Figma Make

Estas son reglas de diseño y producto que debes respetar en **toda** generación de este proyecto, sin excepción, aunque un prompt puntual no las repita. Si un prompt contradice una regla marcada como no negociable, prioriza esta guía.

## Producto
ALEPH es una plataforma de inteligencia regulatoria con identidad propia (no es un sub-brand). Audita el stock regulatorio de un país e identifica barreras regulatorias y trámites con fricciones, cada uno anclado a su fuente legal. Esencia: **"Evidencia desde el origen"**. Principio: **"Nada escapa, nada se inventa"**. La vista actual es la del usuario del BID (analista regional multi-país). El usuario ve resultados de análisis ya procesados, nunca estado de agentes en tiempo real.

## Color (no negociable)
- Canvas / fondo de contenido: `#EDF1F5` (off-white frío).
- Superficie de tarjetas y paneles: `#FAFBFC`.
- Sidebar de navegación: `#14161A` (grafito casi negro), con texto e íconos claros.
- Rango azul acero (estructura, interacción, enlaces, charts, jerarquía): `#7FA8D4` → `#5E8FC2` → `#3E6E9E` → `#26456B`.
- Bordes y divisores: gris sutil `#DCE3EB` aprox.
- Texto principal: `#14161A`; texto secundario en gris medio.

## Severidad (no negociable)
El rojo `#C75450` se usa **exclusivamente** para severidad CRÍTICA (badges, segmentos de chart, números críticos). Nunca decorativo ni categórico.
Escala completa, consistente en toda la app:
- Crítico → nivel 4 → `#C75450` (rojo)
- Alto → nivel 3 → `#26456B` (azul acero oscuro)
- Mediano → nivel 2 → `#3E6E9E` (azul acero medio)
- Bajo → nivel 1 → `#7FA8D4` (azul acero claro)

Dirección fija: mayor número = mayor severidad. El nivel numérico se
muestra como prefijo de la etiqueta (ej. "4 · Crítico"), nunca solo.

## Rampa categórica (rankings y series)
Para ordenar categorías sin significado de severidad: rankings por país,
series comparativas, segmentos de composición. Comparte valores con la
escala de severidad por consistencia visual, pero se declara por separado:
son funciones semánticas distintas y el rojo nunca entra aquí.

- Paso 1 → `#26456B`
- Paso 2 → `#3E6E9E`
- Paso 3 → `#5E8FC2`
- Paso 4 → `#7FA8D4`
- Paso 5 → `#A0C1E0`

El paso 5 (`#A0C1E0`) existe solo en esta rampa. No tiene equivalente en
la escala de severidad.

## Tipografía (no negociable)
- **Space Grotesk** (weight 500): marca/logo, todos los títulos, etiquetas, navegación, números y referencias de datos (KPIs, conteos, badges, headers de tabla).
- **IBM Plex Sans**: todo el texto de lectura corrida (diagnósticos, descripciones, propuestas de reforma, párrafos).
- No usar fuentes monoespaciadas.

## Marca
Logo denominativo "ALEPH" en Space Grotesk 500, letras finas, con la "A" tratada como chevron (trazo delgado, elegante). Isotipo abstracto opcional: anillos de onda concéntricos / híbrido tipo gráfico radial, geométrico y simple, en azul acero. Nunca figurativo.

## Estilo general
Minimalista, sobrio, institucional pero moderno. Mucho espacio en blanco. NO es dark mode completo: contenido claro, sidebar grafito. Densidad de datos alta pero ordenada, tipo herramienta analítica profesional. Tarjetas con esquinas suavemente redondeadas (~8px), sombras muy sutiles, charts planos sin 3D.

## Navegación (estructura fija)
- Sidebar grafito persistente en todas las pantallas. De arriba a abajo: logo ALEPH; **switcher de país** (Todos · Honduras · Paraguay · Ecuador · El Salvador · Guatemala); menú con **Regulaciones** como ítem padre y submenú **Dashboard · Barreras · Trámites**; luego **Comparativa** y **Repositorio**; un **selector de idioma ES/EN**; y **Salir**. El ítem activo se resalta con un indicador sutil.
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
