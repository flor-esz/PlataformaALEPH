# ALEPH — Prompts Pipeline HITL (Etapas 1–4)
### v3 — con el criterio de recorte Figma Make (visual) vs. Claude Code (lógica)

> Presupuesto real: 416 créditos totales. Lote 0 consumió 196 (más de lo esperado).
> Quedan ~220 para 7 lotes. CRITERIO OBLIGATORIO a partir de aquí:
>
> **A Figma Make solo se le pide lo que es caro de diseñar a mano y barato de pedir bien:
> layout, componentes visuales, estados con datos de muestra estáticos.**
>
> **A Claude Code se le deja todo lo que es lógica pura: filtrado por rol, navegación
> real entre pantallas, wiring de estado, validaciones — cosas que no cuestan crédito
> de "diseño" porque no generan ninguna pantalla nueva, solo comportamiento sobre
> pantallas que Figma Make ya dejó bien construidas.**
>
> Cada lote de aquí en adelante está partido en dos bloques marcados:
> **[FIGMA MAKE]** y **[CLAUDE CODE]**. Solo el bloque [FIGMA MAKE] se pega en Figma
> Make. El bloque [CLAUDE CODE] queda documentado aquí para cuando se haga el handoff.

---

## ESTADO ACTUAL — créditos de Figma Make agotados en Lote 4

- ✅ **Lote 0** (196 créditos): tipos `Section`/`UserRole`/`View` extendidos, colores
  ámbar/verde en `C`, ítem "Revisión" en Sidebar. `Guidelines.md` copiado a `guidelines/`.
- ✅ **Lote 1a**: `StageChip` y `IconActionButton` construidos en `src/app/revision/shared/`.
- ✅ **Lote 1b**: `RevisionRepositorio.tsx` construido — SOLO vista visual, sin
  filtrado por rol ni navegación real (ver bloque [CLAUDE CODE] del Lote 1b, sigue
  pendiente completo).
- ✅ **Lote 2**: `RevisionTriageModales.tsx` con los 3 modales — sin wiring a datos
  reales (ver bloque [CLAUDE CODE] del Lote 2, sigue pendiente completo).
- ✅ **Lote 3**: `RevisionAsesorDetalle.tsx` construido con datos de muestra — sin
  conectar a log_errores/Etapa 2 real (ver [CLAUDE CODE] del Lote 3, pendiente).
- ✅ **Lote 4**: `RevisionAnalistaChecklist.tsx` construido con datos de muestra — sin
  cálculo dinámico de "resuelve:" ni conexión a Etapa 4 real (ver [CLAUDE CODE] del
  Lote 4, pendiente).
- ❌ **Sin créditos para continuar en Figma Make.** TODO lo siguiente se hace en
  Claude Code: los 5 bloques [CLAUDE CODE] ya pendientes de los Lotes 1b/2/3/4,
  MÁS los Lotes 5, 6 y 7 completos (ninguno tiene su parte [FIGMA MAKE] construida).

### Lo que Claude Code debe hacer, en orden:
1. Los 4 bloques [CLAUDE CODE] de los Lotes 1b, 2, 3 y 4 (wiring de lo ya construido)
   — esto es lo más urgente, porque sin esto las pantallas ya hechas no "hacen" nada,
   solo se ven bien.
2. Lote 5 completo — incluyendo la parte que iba a ser [FIGMA MAKE] (la pantalla de
   Decisión final en sí, que ahora hay que construir en código, no solo conectar).
3. Lote 6 completo (candados + log_errores) — construir por imitación del patrón de
   Administración → Usuarios, como ya estaba previsto como plan B.
4. Lote 7 completo (notificaciones) — como ya estaba planeado, siempre iba aquí.

---

## REFERENCIA RÁPIDA — Nomenclatura y modelo confirmados

**Roles:** Asesor (ESZ) = Etapa 1, ve todo el corpus. Validador BID = Etapa 2 (triage) +
Etapa 4 (decisión final), único con visibilidad completa. Analista jurídico-económico
(antiguo "Revisor BID") = Etapa 3. Revisor del País fuera de scope.

**Etapas canónicas:**
| # | Nombre | Rol | Acción |
|---|---|---|---|
| 1 | Etapa 1 · Validación del Asesor | Asesor | corrige detalle menor o rechaza |
| 2 | Etapa 2 · Triage del Validador | Validador | resolver directo (es/no es barrera) o enviar a Analista |
| 3 | Etapa 3 · Revisión del Analista | Analista | 10 criterios jurídico-económicos |
| 4 | Etapa 4 · Decisión final | Validador | Aceptar y publicar / Ajustar (yo mismo o devolver) / No usar |

**Matriz de visibilidad (repositorio):** Asesor solo su Etapa 1. Analista su Etapa 3 +
lectura de lo suyo en Por decidir/Publicado/Rechazado. Validador ve todo. Candados
nunca aparece en el repositorio, solo en log_errores.

**Matriz de acciones por fila:**
| Etapa | Ver | Editar | Asignar | Rechazar | Publicar directo | Decidir |
|---|---|---|---|---|---|---|
| Etapa 2 · Triage | ✅ | — | ✅ | ✅ | ✅ | — |
| Etapa 3 · asignado | ✅ | 🚫 | 🚫 | — | — | — |
| Etapa 3 · sin asignar | ✅ | ✅ | ✅ | — | — | — |
| Etapa 4 · Decisión | ✅ | ✅ (Ajustar/Devolver) | — | — | — | ✅ |

**Colores:** rojo `C.critico` SOLO severidad crítica (excepción: `Cumple`/`No Cumple`
del checklist, y botón destructivo sólido en modales de confirmación). Ámbar =
modificado/pendiente/devolución. Verde = publicado/aceptado. Azul acero = neutro/triage.

**Log de errores — 5 categorías:** Sistema (candados), Asesor (inconsistente),
Validador-triage (`Descartado en triage`, NO es error de calidad), Analista (no cumple
criterios), Validador-decisión (`No usado`). Terminal, sin reingreso — solo nutre
mejora de agentes/IA.

**Arquitectura de archivos:** módulo nuevo en `src/app/revision/*.tsx`, importado desde
`App.tsx` (no seguir escribiendo dentro del archivo de 5,178 líneas). Reutilizar `C`,
`Header`, `HDR_BTN_PRIMARY/SECONDARY`, el patrón de modal `fixed inset-0` de Usuarios,
íconos lucide-react (no Tabler).

---

## LOTE 1a — Componentes compartidos [FIGMA MAKE]

Barato, reutilizable en todos los lotes siguientes. Sin cambios respecto al plan original.

```
Crea src/app/revision/shared/StageChip.tsx:
  <StageChip stage={1|2|3|4} label="Validación del Asesor" state="pending"|"active"|"readonly" />
  Chip rounded-full, px-2.5 py-1, fontFamily Space Grotesk, fontSize 11px.
  Etapa 1/3 readonly: fondo C.border, color C.textMuted.
  Etapa 2: fondo C.steel3+"22", color C.steel3.
  Etapa 4: fondo C.ambar2, color C.ambarTexto.
  Texto: "Etapa {stage} · {label}"

Crea src/app/revision/shared/IconActionButton.tsx:
  <IconActionButton icon={LucideIcon} tooltip="Ver" variant="default"|"green"|"red"|"disabled" onClick={...} />
  Círculo 32px, ícono lucide 15px, fondo C.steel4 default, C.verde1 green,
  C.critico red, C.border+opacity disabled (cursor not-allowed, sin onClick).
```

---

## LOTE 1b — Repositorio: SOLO vista del Validador, sin lógica de rol [FIGMA MAKE]

Recortado — sin filtrado por rol, sin filtros funcionales, sin navegación real.
Solo la tabla vestida con datos de muestra que cubren las 4 etapas.

```
Crea src/app/revision/RevisionRepositorio.tsx.

Usa el componente Header existente: breadcrumb="ALEPH · Revisión",
title="Repositorio de hallazgos".

Filtros VISUALES únicamente (sin lógica activa): País (select), Tipo (select),
Buscar (input) — mismo estilo de inputs del modal de Usuarios en Administración.

Tabla con 6-8 filas de datos de muestra cubriendo Etapa 2, Etapa 3 (algunas
"asignado", otras "sin asignar"), y Etapa 4. Columnas: Nombre (+ subtítulo
país·tipo·rol responsable·hace X), Estado (usa StageChip), Acciones (usa
IconActionButton según esta matriz):
- Etapa 2 · Triage: Ver, Publicar directo (verde/Check), Asignar (Users), Rechazar (rojo/X)
- Etapa 3 · asignado: solo Ver activo, Editar y Asignar en variant="disabled"
- Etapa 3 · sin asignar: Ver, Editar (Pencil), Asignar
- Etapa 4 · Decisión: Ver, Editar (Pencil), Decidir (Scale o Gavel)

Onclick de cada ícono: solo console.log("acción", id) por ahora. NO conectar
navegación real ni filtrado por rol — eso se hace en Claude Code (ver abajo).
```

**[CLAUDE CODE — pendiente, no gastar créditos de Figma Make en esto]:**
```
Sobre RevisionRepositorio.tsx ya construido:
1. Recibir props userRole: UserRole, userId: string.
2. Filtrar el array de datos ANTES de renderizar según la matriz de visibilidad
   (ver Referencia rápida arriba) — Asesor solo su Etapa 1, Analista su Etapa 3 +
   lectura de lo suyo, Validador todo.
3. Cablear los selects de País/Tipo/Buscar con estado real (useState) y filtrar
   el array mostrado.
4. Reemplazar los console.log por onNavigate() real hacia los screens del View,
   o por apertura de los modales correspondientes (Lote 2).
5. Ocultar el filtro de país/analista para roles que no lo necesitan (Asesor y
   Analista solo ven "lo suyo", no tiene sentido un filtro de analista para ellos).
```

---

## LOTE 2 — Los 3 modales de Triage, sin wiring [FIGMA MAKE]

Los modales en sí son baratos y de alto valor visual — sí vale la pena pedirlos
completos, incluida su validación simple de UI (botón disabled si falta texto,
que es una regla visual, no lógica de negocio).

```
Crea src/app/revision/RevisionTriageModales.tsx con tres modales (overlay fixed
inset-0, rgba(20,22,26,0.5), panel rounded-xl sobre C.card, como en Usuarios):

1. ModalPublicarDirecto: ícono Check en círculo C.verde2/C.verde1. Título
   "Publicar directo — es barrera". Texto explicando que se salta el Analista.
   Textarea "Nota de triage (opcional)". Botones Cancelar / "Confirmar
   publicación" (fondo C.verde1).

2. ModalRechazarTriage: ícono FilterX en círculo C.rojoClaro/C.critico. Título
   "Marcar como 'no es barrera'". Texto explicando que va a log_errores como
   "Descartado en triage", no reversible. Textarea "Motivo *" — botón de
   confirmar visualmente disabled si el textarea está vacío (esto SÍ pídelo,
   es validación de UI simple). Botones Cancelar / "Confirmar descarte"
   (fondo C.critico).

3. ModalAsignarAnalista: título "Asignar a Analista". Lista de 3 analistas de
   muestra con avatar, nombre, barra de carga de trabajo coloreada y conteo.
   Radio button de selección. Chips de prioridad Normal/Alta/Urgente
   (seleccionable, un estado activo). Textarea "Nota (opcional)". Botones
   Cancelar / "Asignar" (fondo C.steel4).

Los tres modales reciben props onConfirm y onCancel como callbacks vacíos por
ahora (solo deben poder abrirse/cerrarse visualmente) — la lógica de qué pasa
al confirmar (escribir en log_errores, mover de etapa, notificar) se conecta
en Claude Code.
```

**[CLAUDE CODE — pendiente]:**
```
1. Conectar onConfirm de cada modal a la mutación de datos real: mover el
   hallazgo de Etapa 2 a Publicado / a log_errores con categoría "Descartado
   en triage" / a Etapa 3 con el analista y prioridad elegidos.
2. Disparar la notificación correspondiente al rol afectado (Asesor si su
   hallazgo fue publicado/descartado; Analista si le llegó una asignación).
```

---

## LOTE 3 — Etapa 1: detalle del Asesor [FIGMA MAKE — vale la pena completo]

Esta pantalla es mayormente visual (cards, highlight de texto, badges de
origen) — el único elemento de "lógica" es el toggle de revisado, que es un
simple estado local por campo, barato de incluir directo.

```
Crea src/app/revision/RevisionAsesorDetalle.tsx.

Replica el layout del detalle de Barrera/Trámite ya existente en App.tsx
(badge severidad+sector arriba, card "texto normativo de origen" con highlight
del fragmento citado, card "diagnóstico económico", ficha lateral de metadatos)
pero con cada campo EDITABLE y con:
1. Etiqueta de origen por campo: "Validado por IA" (fondo C.verde2, ícono Bot)
   o "Ajustado por Asesor" (fondo C.steel1+"33", ícono UserCog).
2. Botón check circular (24px) por campo — toggle local (useState), gris si no
   revisado, azul C.steel4 con check blanco si sí. Auto-marca al editar el campo.
3. Textarea "Nota de consultoría".
4. Contador "N de M campos revisados" en color C.ambarTexto si incompleto.
5. Botones "Rechazar hallazgo" (secundario) / "Aceptar y enviar a Etapa 2"
   (primario, disabled visualmente si no todos los campos están revisados —
   esto es validación de UI, inclúyelo).

Usa datos de muestra fijos (no necesita conectarse a ningún backend real).
```

**[CLAUDE CODE — pendiente]:**
```
Conectar "Rechazar hallazgo" a escribir en log_errores categoría "Asesor".
Conectar "Aceptar y enviar" a mover el hallazgo a Etapa 2 y notificar al
Validador.
```

---

## LOTE 4 — Etapa 3: checklist del Analista [FIGMA MAKE — completo]

Igual de justificado que el Lote 3: es mayormente presentación con estado
local simple (toggle Cumple/No Cumple por criterio).

```
Crea src/app/revision/RevisionAnalistaChecklist.tsx.

Header con StageChip "Etapa 3 · Revisión del Analista". Franja de contexto
"Asignado por el Validador · aprobado en Etapa 1 por Asesor (nombre)".

Dos columnas: Criterios jurídicos (Existencia, Vigencia, Cita, Interpretación,
Aplicabilidad) / Criterios económicos (Tipo de fricción, Causalidad,
Legitimidad, Proporcionalidad, Severidad). Cada uno con dos botones pill
"Cumple" (C.verde2/C.verde1) / "No Cumple" (C.rojoClaro/C.critico), toggle
local por criterio.

Banner de alerta si hay "No Cumple" (fondo C.rojoClaro, borde C.critico):
"N criterios no cumplen — corrige los campos afectados antes de continuar".

Grid de 4 campos editables (Plazo legal, Costo, Severidad, Entidad) con patrón
Actual: / fuente citada / cambiar fuente ya usado en el Lote 3. Chip "resuelve:
{criterio}" (C.ambar2/C.ambarTexto) en los campos que corrigen un criterio en
"No Cumple" — esto puede ser estático/manual en los datos de muestra, no
necesita calcularse dinámicamente todavía.

Textarea "Dictamen del analista". Botones "Guardar avance" / "Enviar al
Validador".
```

**[CLAUDE CODE — pendiente]:**
```
1. Calcular dinámicamente qué campo "resuelve" qué criterio en vez de dato fijo.
2. Conectar "Enviar al Validador" a mover el hallazgo a Etapa 4 con el
   dictamen adjunto.
3. Si viene de una devolución (Lote 5), mostrar el motivo de devolución del
   Validador arriba del checklist.
```

---

## LOTE 5 — Etapa 4: decisión final + Ajustar/Devolver [AHORA TODO CLAUDE CODE]

> Sin créditos de Figma Make, la parte que era [FIGMA MAKE] (la pantalla de Decisión
> final en sí) se construye también en código. Buena noticia: es la pantalla que más
> reutiliza patrones ya construidos en los Lotes 1b/2/3/4 (StageChip, IconActionButton,
> el patrón de card de metric, el patrón de campo editable con "Actual:"/fuente), así
> que no es empezar de cero — es componer piezas que ya existen en el repo.

Aquí SÍ conviene recortar: la pantalla de decisión final es la más "compuesta"
(mezcla diff + scores + resumen de dos roles). Pide el visual completo, pero
dejando el modal de bifurcación como navegación simulada, no lógica real.

**[CLAUDE CODE — todo el lote]:**
```
1. Crear src/app/revision/RevisionDecisionFinal.tsx:
   - 3 metric cards: Score de desempeño, Score de calidad, Criterios evaluados
     (imitar el patrón de metric card ya usado en Lote 6 de log_errores si ya
     existe, o en dashboards de App.tsx).
   - Franja "cuatro ojos": avatar+texto Asesor, avatar+texto Analista.
   - Tabla diff: Vigente (tachado) / Etapa 3 · Propuesta (destacado), con chip
     de motivo bajo cada valor cambiado (ej. "Cita — no cumple", C.rojoClaro).
   - Card "Dictamen del analista" de solo lectura (viene del dato real que
     guardó RevisionAnalistaChecklist al enviar).
   - 3 botones: "No usar" (→ log_errores "Validador — No usado") / "Ajustar"
     (abre modal de bifurcación) / "Aceptar y publicar" (→ mueve a Publicado,
     actualiza dashboard/repositorio, fondo C.verde1).

2. Modal de bifurcación (2 opciones: "Corregirlo yo mismo" ícono Pencil /
   "Devolver al Analista" ícono CornerUpLeft fondo C.ambar2) — puede vivir en
   el mismo archivo que RevisionDecisionFinal.

3. Crear RevisionAjuste.tsx reutilizando el patrón de campos editables del
   Lote 3/4 (Actual: / fuente / chip "resuelve:"), SIN el checklist de 10
   criterios, con la franja roja heredada del motivo de "No Cumple". Botones
   Cancelar / "Guardar y volver a decisión" (vuelve a RevisionDecisionFinal).

4. Crear RevisionDevolverAnalista.tsx: card de solo lectura con el dictamen
   original del Analista, textarea obligatorio "¿Qué necesita revisarse de
   nuevo? *", nota informativa (C.ambar2), botones Cancelar / "Devolver a
   Etapa 3" (fondo C.ambar1, disabled si motivo vacío) — mueve el hallazgo
   de vuelta a Etapa 3 asignado al mismo Analista.

5. Conectar el modal de bifurcación a navegar realmente a estas dos pantallas.

6. En RevisionRepositorio.tsx, agregar el chip "Devuelto por Validador"
   (C.ambar2) a las filas de Etapa 3 que vienen de una devolución.
```

---

## LOTE 6 — Candados + log_errores [TODO CLAUDE CODE]

Sin créditos de Figma Make. Buena noticia: es justo la sección que ya estaba
marcada como "barata de construir por imitación" — su patrón visual (lista +
metric cards + detalle) es prácticamente idéntico al de Administración →
Usuarios y al del propio RevisionRepositorio, ambos ya existentes en el repo.

```
[CLAUDE CODE]
Crear src/app/revision/RevisionCandados.tsx: 6 categorías, 14 candados con
check/X, solo lectura salvo Descartar/Reintentar. Imitar el patrón de card +
lista ya usado en RevisionRepositorio.

Crear src/app/revision/RevisionLogErrores.tsx: 5 metric cards (incluye
"Descartado en triage" con fondo distinto — imitar patrón de metric card de
RevisionDecisionFinal del Lote 5), filtro Origen/País/Buscar, lista con
ícono+color por origen (imitar patrón de tabla de Administración → Usuarios),
nota final explicando que "Descartado en triage" no es error de calidad.
Click en fila → detalle con tracker horizontal de 4 nodos, motivo destacado,
valores congelados de solo lectura, nota de retroalimentación específica.

Conectar ambas pantallas a los datos reales que alimentan los Lotes 1-5
(cada rechazo/descarte generado en esos flujos debe aparecer aquí).
```

---

## LOTE 7 — Notificaciones por rol [CLAUDE CODE directo, no gastar en Figma Make]

Este lote completo se recomienda hacer en Claude Code sin pasar por Figma
Make: es 100% lógica de eventos + reutilización de un componente de
notificaciones que muy probablemente ya existe en algún lado del patrón de
`Header` (campana). Si no existe todavía ni el dropdown de campana, es un
componente pequeño y barato de escribir a mano, no justifica gastar créditos.

```
[CLAUDE CODE]
1. Si no existe, crear un dropdown de notificaciones sobre el ícono Bell del
   Header (patrón: nuevas/anteriores, ícono+color por evento, acción directa).
2. Eventos por rol:
   - Asesor: "hallazgo pasó a Etapa 2", "fue publicado", "fue descartado en
     triage" (ícono X, color ámbar, NO rojo).
   - Analista: "te asignaron un hallazgo", "el Validador devolvió tu
     dictamen" (acción "Revisar y reenviar"), "tu dictamen fue publicado",
     "no fue usado".
   - Validador: aviso de nuevas llegadas a su bandeja en cada etapa que
     requiere su acción.
```

---

## RESUMEN DE PRIORIDAD SI LOS CRÉDITOS SE ACABAN

Orden de valor por crédito, de mayor a menor: **1a → 1b → 2 → 3 → 4 → 5**.
El Lote 6 es el primer candidato a saltarse completo a Claude Code si el
saldo baja de ~40-50 créditos. El Lote 7 se recomienda hacer en Claude Code
sin importar cuántos créditos queden — no tiene sentido gastarlos ahí.

---

## HANDOFF A CLAUDE CODE

1. Exportar/sincronizar el proyecto de Figma Make con el repo de GitHub.
2. Commitear este archivo en `/docs/ALEPH_prompts_pipeline_hitl.md`.
3. Pedirle a Claude Code: leer este archivo completo, identificar qué lotes
   ya están construidos revisando `src/app/revision/`, y ejecutar TODOS los
   bloques marcados **[CLAUDE CODE]** de los lotes ya completados en Figma
   Make, más los lotes completos que se hayan saltado por falta de créditos.
4. Reutilizar `C`, `Header`, `HDR_BTN_PRIMARY/SECONDARY`, el patrón de modal
   de Usuarios, e íconos lucide-react ya importados — no introducir un
   sistema de diseño paralelo.
