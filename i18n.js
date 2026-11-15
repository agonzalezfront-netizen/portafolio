/* Idioma del sitio (inglés / español): un solo estado de idioma para la página y para «See it in motion».
   Carga en el <head> como script clásico (sin defer, sin fetch, sin módulos): funciona igual por http y por file://.
   - Idioma inicial: ?lang=es|en manda; si no, la elección guardada (localStorage); si no, navigator.language (es* → es).
   - Antes del primer pintado fija <html lang>, <title> y la meta description; si el idioma no es el del HTML (inglés),
     oculta el body (clase i18n-hold) hasta que __i18n.ready() traduce el documento al final del <body>.
   - Traduce nodos de texto y los atributos alt, aria-label, title y placeholder. Cada texto se reconoce por su clave:
     data-i18n="clave" en el elemento (o data-i18n-<atributo>="clave"), o por su texto en cualquiera de los dos idiomas.
   - Sincronía con el video: si la pieza está cargada, __sb.setLang(); si no, __fabricaEmbed.lang. Cuando el video cambia
     de idioma con su botón propio, fabrica.js avisa «fabrica:lang» y la página lo sigue. A swarm.js le avisa «site:lang».
   La tabla completa de textos, con notas, está en _revision/es/tabla-textos.md. */
(function () {
  'use strict';
  // [clave, inglés, español, opciones]; opciones.x = solo por clave explícita (el texto inglés se repite con otro sentido)
  var D = [
    /* ---- head ---- */
    ['head.title', 'Alberto González, product designer', 'Alberto González, diseñador de producto'],
    ['head.desc', 'Product designer and founder. I direct a team of AI agents from the first spec to a verified release.',
      'Diseñador de producto y fundador. Dirijo un equipo de agentes de IA desde la primera spec (encargo) hasta una entrega verificada.'],

    /* ---- cabecera ---- */
    ['skip.content', 'Skip to content', 'Saltar al contenido'],
    ['skip.intro', 'Skip', 'Saltar'],
    ['skip.introAria', 'Skip the intro animation', 'Saltar la animación de entrada'],
    ['nav.aria', 'Sections', 'Secciones'],
    ['nav.work', 'Work', 'Proyectos'],
    ['nav.process', 'Process', 'Proceso'],
    ['nav.contact', 'Contact', 'Contacto'],
    ['top.status', 'Open to freelance work', 'Disponible para freelance'],
    ['tour.replay', 'Replay tour', 'Ver recorrido'],
    ['lang.group', 'Language', 'Idioma'],

    /* ---- hero ---- */
    ['hero.word', 'PORTFOLIO', 'PORTAFOLIO'],
    ['hero.alt', 'Portrait of Alberto González', 'Retrato de Alberto González'],
    ['hero.hello', 'Hello, I’m', 'Hola, soy'],
    ['hero.role', 'Product designer & founder', 'Diseñador de producto y fundador'],
    ['hero.sub', 'I direct a team of AI agents from the first spec to a verified release. 9+ years in UX/UI and design systems for fintech and ecommerce.',
      'Dirijo un equipo de agentes de IA de la spec (encargo) a la entrega verificada. 9+ años en UX/UI y design systems en fintech y e-commerce.'],
    ['hero.loc', 'Chile, UTC-3 · Spanish native', 'Chile, UTC-3 · español nativo'],
    ['hero.cta', 'See the work', 'Ver proyectos'],
    ['hero.stats', 'In numbers', 'En cifras'],
    ['hero.stat1', 'Years in product design', 'Años en diseño de producto'],
    ['hero.stat2', 'Products designed and built', 'Productos diseñados y construidos'],
    ['hero.stat3', 'Agent roles, one board', 'Roles de agente, un solo tablero'],
    ['hero.note', 'Agentic-first, with Claude Code and MCP every day.', 'Primero los agentes: uso Claude Code y MCP todos los días.'],

    /* ---- Sala de Mando ---- */
    ['room.title', 'The Command Room', 'La Sala de Mando'],
    ['room.note', 'Where I direct the agents. A recreation with made-up sample data; the real board stays private.',
      'Donde dirijo a los agentes. Es una recreación con datos de ejemplo inventados; el tablero real es privado.'],
    ['room.app', 'Factory', 'Fábrica'],
    ['chip.sample', 'sample data', 'datos de ejemplo'],
    ['room.updated', 'updated 09:41', 'actualizado 09:41'],
    ['room.release', 'Release 2', 'Entrega 2'],
    ['room.kitchen', '· Kitchen view', '· Vista de cocina'],
    ['room.of', '7 of 9', '7 de 9'],
    ['room.eta', 'On pace: the last two cards are in independent check.', 'A tiempo: las dos últimas tarjetas están en revisión independiente.'],
    ['room.mode', 'Board view', 'Vista del tablero'],
    ['room.agents', 'Agents', 'Agentes'],
    ['room.board', 'Board', 'Tablero'],
    ['room.kpis', 'Today, sample data', 'Hoy, datos de ejemplo'],
    ['kpi.cards', 'Cards verified', 'Tarjetas verificadas'],
    ['kpi.today', 'today', 'hoy'],
    ['kpi.cards30', '30 days: 9 a day on average', '30 días: 9 al día en promedio'],
    ['kpi.returns', 'Returns per card', 'Vueltas por tarjeta'],
    ['kpi.returnsV', '0.3', '0,3'],
    ['kpi.returns30', '30 days: 0.4', '30 días: 0,4'],
    ['kpi.time', 'Time to verify', 'Tiempo en verificar'],
    ['kpi.time30', '30 days: 44 min', '30 días: 44 min'],
    ['board.summary', 'Board summary', 'Resumen del tablero'],
    ['board.n.verified', 'verified', 'verificadas', {x: 1}],
    ['board.n.check', 'in check', 'en revisión', {x: 1}],
    ['board.n.build', 'in build', 'en construcción', {x: 1}],
    ['board.n.spec', 'spec', 'spec', {x: 1}],
    ['board.row.verified', 'verified', 'verificada', {x: 1}],
    ['board.row.check', 'in check', 'en revisión', {x: 1}],
    ['board.row.build', 'in build', 'en construcción', {x: 1}],
    ['board.row.spec', 'spec', 'spec', {x: 1}],
    ['task.button', 'Order button wording', 'Texto del botón de pedido'],
    ['task.kitchen', 'Kitchen view at 360 px', 'Vista de cocina a 360 px'],
    ['task.contrast', 'Menu contrast AA', 'Contraste AA del menú'],
    ['task.empty', 'Empty orders state', 'Estado sin pedidos'],
    ['task.launch', 'Launch post draft', 'Borrador del post de lanzamiento'],
    ['task.weekly', 'Owner weekly summary', 'Resumen semanal del dueño'],
    ['ag.cortex', 'memory and coordination', 'memoria y coordinación'],
    ['ag.working', 'working', 'trabajando'],
    ['ag.po', 'orders the board', 'ordena el tablero'],
    ['ag.free', 'free', 'libre'],
    ['ag.tl', 'technical plan', 'plan técnico'],
    ['ag.dev', 'build in their own workspace', 'construyen en su propio espacio'],
    ['ag.verif', 'independent checks', 'revisiones independientes'],
    ['ag.waiting', 'waiting', 'esperando'],
    ['ag.mkt', 'writes', 'escribe'],
    ['ag.asleep', 'asleep', 'en reposo'],
    ['review.title', 'To review', 'Por revisar'],
    ['review.items', '0 items', '0 pendientes'],
    ['review.empty', 'Nothing waits for your review.', 'Nada espera tu revisión.'],
    ['review.foot', '2 cards still in independent check.', '2 tarjetas siguen en revisión independiente.'],
    ['room.happened', 'What happened', 'Qué pasó'],
    ['room.ev.saved', 'Cortex saved the session notes', 'Cortex guardó las notas de la sesión'],
    ['room.ev.memory', '· Memory', '· Memoria'],
    ['room.ev.back', 'verif-8 sent one back with evidence', 'verif-8 devolvió una con evidencia'],
    ['room.ev.returned', '· Returned', '· Devuelta'],
    ['room.ev.passed5', 'verif-5 passed 3/3 checks', 'verif-5 aprobó 3 de 3 controles'],
    ['room.ev.passed8', 'verif-8 passed 3/3 checks', 'verif-8 aprobó 3 de 3 controles'],
    ['room.ev.verifiedDot', '· Verified', '· Verificada'],
    ['room.ev.verified', 'Verified', 'Verificada', {x: 1}],
    ['room.ev.build', 'Dev 8 started the build', 'Dev 8 empezó la construcción'],
    ['room.ev.buildDot', '· Build', '· Construcción'],
    ['room.ev.spec', 'PO opened a card: weekly summary', 'PO abrió una tarjeta: resumen semanal'],
    ['room.ev.specDot', '· Spec', '· Spec'],
    ['room.live', 'Live', 'En vivo'],
    ['room.cap', 'A recreation of my Command Room with made-up sample data: release progress, today’s numbers, the board with each task, its state and the agent working on it, what is waiting for my review and what happened recently.',
      'Una recreación de mi Sala de Mando con datos de ejemplo inventados: el avance de la entrega, las cifras de hoy, el tablero con cada tarea, su estado y el agente que la trabaja, lo que espera mi revisión y lo que pasó hace poco.'],
    ['motion.returned', '↩ returned', '↩ devuelta'],

    /* ---- proyectos ---- */
    ['cases.title', 'Selected work', 'Proyectos destacados'],
    ['cases.note', 'Spec, build, then verified by a separate agent or shipped.', 'Spec, construcción y después verificación por otro agente, o publicación.'],
    ['pc.spec', 'Spec', 'Encargo'],
    ['rail.aria', 'Card states', 'Estados de la tarjeta'],
    ['rail.spec', 'Spec', 'Encargada'],
    ['rail.build', 'Build', 'Construida'],
    ['rail.verified', 'Verified', 'Verificada'],
    ['rail.shipped', 'Shipped', 'Publicada'],
    // herramienta privada (Sales Command Center): está en uso, pero no se publicó
    ['rail.inuse', 'In use', 'En uso'],
    ['case.problem', 'Problem', 'Problema'],
    ['c1.title', 'The Command Room and the agent factory', 'La Sala de Mando y la fábrica de agentes'],
    ['c1.problem', 'Directing many AI agents, you lose track between sessions. An agent that checks its own work is no check.',
      'Al dirigir muchos agentes de IA se pierde el hilo entre sesiones. Y un agente que revisa su propio trabajo no es revisión.'],
    ['c1.p1', 'One board holds every decision and the live state of each task. One agent builds, another checks, then it reaches me.',
      'Un tablero guarda cada decisión y el estado en vivo de cada tarea. Un agente construye, otro revisa y recién ahí llega a mí.'],
    ['meta.role', 'role', 'rol'],
    ['meta.stack', 'stack', 'stack'],
    ['meta.builds', 'builds', 'construye'],
    ['meta.team', 'team', 'equipo'],
    ['meta.roles', 'roles', 'roles'],
    ['meta.pilot', 'pilot', 'piloto'],
    ['meta.launch', 'launch', 'lanzamiento'],
    ['c1.role', 'Founder, product and system design', 'Fundador, diseño de producto y del sistema'],
    ['c1.team', 'Cortex (memory), PO, TL, Devs, verifiers, Marketing', 'Cortex (memoria), PO, TL, Devs, verificadores, Marketing'],
    ['c1.builds', 'Kocino, my restaurant product', 'Kocino, mi producto para restaurantes'],
    ['ticket.card', 'card', 'tarjeta'],
    ['ticket.spec', 'spec', 'spec'],
    ['ticket.specTxt', 'The main button says what happens: “Place order”, not “Submit”. It stays disabled until the order is complete.',
      'El botón principal dice lo que pasa: «Hacer pedido», no «Enviar». Queda desactivado hasta que el pedido esté completo.'],
    ['ticket.verif', 'verification, by a different agent', 'verificación, por otro agente'],
    ['ticket.req', 'Requirement', 'Requisito'],
    ['ticket.evid', 'Evidence', 'Evidencia'],
    ['ticket.result', 'Result', 'Resultado'],
    ['ticket.r1', 'Label names the action', 'El texto nombra la acción'],
    ['ticket.e1', 'Screenshot at 390 px', 'Captura a 390 px'],
    ['ticket.pass', 'pass', 'pasa'],
    ['ticket.r2', 'Disabled until complete', 'Desactivado hasta completar'],
    ['ticket.e2', 'Test with an empty cart', 'Prueba con el carro vacío'],
    ['ticket.r3', 'Text contrast AA', 'Contraste AA del texto'],
    ['ticket.e3', 'Measured 7.1:1', 'Medido: 7,1:1'],
    ['ticket.cap', 'Recreated card with made-up content. The real board stays private.', 'Tarjeta recreada con contenido inventado. El tablero real es privado.'],
    ['c2.title', 'Kocino, ordering and operations for restaurants', 'Kocino, pedidos y operación para restaurantes'],
    ['c2.problem', 'Ordering apps charge restaurants a commission per order, and kitchen, delivery and cash live in separate places.',
      'Las apps de pedidos cobran comisión por pedido, y la cocina, el reparto y la caja están en lugares distintos.'],
    ['c2.p1', 'Web orders go straight to the restaurant. One owner panel holds live orders, the catalog, timing analytics and the day’s cash. I defined the product and UX; the agents built it under my review.',
      'Los pedidos web llegan directo al restaurante. Un panel reúne pedidos en vivo, catálogo, tiempos y la caja del día. Yo definí el producto y la UX; los agentes lo construyeron bajo mi revisión.'],
    ['c2.pilotV', 'June 2026', 'junio de 2026'],
    ['c2.launchV', 'November 2026', 'noviembre de 2026'],
    ['c2.stack', 'Python back end, own design system', 'Back end en Python, design system (sistema de diseño) propio'],
    ['c2.alt1', 'Kocino menu: a sandwich with a required bread choice marked done, optional extras with counters and an Add button with the price.',
      'Menú de Kocino: un sándwich con la elección de pan obligatoria marcada como lista, extras opcionales con contadores y un botón para agregar con el precio.'],
    ['c2.cap1', 'Ordering a dish with options', 'Pedir un plato con opciones'],
    ['c2.alt2', 'Kocino owner panel: live orders, three flagged as needing attention, with kitchen and pickup states and times.',
      'Panel del dueño en Kocino: pedidos en vivo, tres marcados porque necesitan atención, con estados y tiempos de cocina y retiro.'],
    ['c2.cap2', 'Live orders in the owner panel', 'Pedidos en vivo en el panel del dueño'],
    ['c2.note', 'Demo store with sample data. The interface is in Spanish.', 'Local de demostración con datos de ejemplo. La interfaz está en español.'],
    ['c3.title', 'Pulsed, a platform for training organizations', 'Pulsed, una plataforma para organismos de capacitación'],
    ['c3.problem', 'Training organizations in Chile need to know in time who is falling behind.',
      'Los organismos de capacitación en Chile necesitan saber a tiempo quién se queda atrás.'],
    ['c3.p1', 'Designed end to end, with a design system from day one. A traffic light shows each student’s progress and a radar lists who to contact first, so tutors act in time.',
      'Diseñada de punta a punta, con design system desde el primer día. Un semáforo muestra el avance de cada estudiante y un radar dice a quién contactar primero.'],
    // acciones al pie de cada caso (los dominios kocino.cl/demo y pulsed.cl no se traducen)
    ['case.demo', 'See the live demo', 'Ver la demo'],
    ['case.site', 'Visit the site', 'Ver el sitio'],
    ['case.newtab', '(opens in a new tab)', '(se abre en una pestaña nueva)'],
    ['case.private', 'Private tool: no public demo.', 'Herramienta privada: no tiene demo pública.'],
    ['c3.role', 'Product and UX/UI design, part of the front end', 'Diseño de producto y UX/UI, parte del front end'],
    ['c3.roles', 'admin, director, tutor, assistant', 'administrador, director, tutor, asistente'],
    ['c3.alt0', 'Pulsed landing page: a headline about managing a training organization with precision, next to a control panel preview.',
      'Página de presentación de Pulsed: un titular sobre gestionar con precisión un organismo de capacitación, junto a una vista previa del panel de control.'],
    ['c3.cap0', 'The pulsed.cl landing',
      'La página de presentación de pulsed.cl'],
    ['c3.thumbs', 'More Pulsed screens', 'Más pantallas de Pulsed'],
    ['c3.alt1', 'Student list where each student carries a progress status: good progress, little progress, insufficient or no progress.',
      'Lista de estudiantes, cada uno con su estado de avance: buen avance, poco avance, insuficiente o sin avance.'],
    ['c3.cap1', 'Each student’s progress status', 'El estado de avance de cada estudiante'],
    ['c3.alt2', 'Communications radar: escalated students first, then courses ordered by how many students need contact.',
      'Radar de comunicaciones: primero los estudiantes escalados, después los cursos ordenados según cuántos estudiantes hay que contactar.'],
    ['c3.cap2', 'Communications radar, most urgent first', 'Radar de comunicaciones, primero lo más urgente'],
    ['c3.alt3', 'Tutor view: only the tutor’s own courses, with alerts and each course’s progress bar.',
      'Vista del tutor: solo sus propios cursos, con alertas y la barra de avance de cada curso.'],
    ['c3.cap3', 'The tutor’s view of their courses', 'La vista del tutor con sus cursos'],
    ['c3.alt4', 'Pulsed platform, director’s management view: totals for courses, students and tutors, alerts, students that need the director’s attention, and a card per course with its progress bar.',
      'Plataforma Pulsed, vista de gestión del director: totales de cursos, estudiantes y tutores, alertas, estudiantes que necesitan la atención del director y una tarjeta por curso con su barra de avance.'],
    ['c3.cap4', 'StudentHub panel, demo data',
      'Panel StudentHub, datos inventados'],
    ['c4.title', 'Sales Command Center, inbox triage with AI', 'Sales Command Center, el correo ordenado con IA'],
    ['c4.problem', 'Sales email arrives mixed with everything else, and the next step gets lost.', 'El correo de ventas llega mezclado con todo lo demás, y el siguiente paso se pierde.'],
    ['c4.p1', 'Mobile PWA: Claude sorts email by category and shows the pipeline. PIN and biometric login.',
      'PWA móvil: Claude ordena el correo y muestra el embudo. Ingreso con PIN y biometría.'],
    ['c4.inbox', 'Inbox', 'Recibidos'],
    ['c4.cats', 'Categories', 'Categorías'],
    ['c4.leads', 'Leads 2', 'Prospectos 2'],
    ['c4.follow', 'Follow-up 1', 'Seguimiento 1'],
    ['c4.other', 'Other 4', 'Otros 4'],
    ['c4.fromA', 'Sample sender A', 'Remitente de ejemplo A'],
    ['c4.fromB', 'Sample sender B', 'Remitente de ejemplo B'],
    ['c4.fromC', 'Sample sender C', 'Remitente de ejemplo C'],
    ['c4.subjA', 'Can we book a demo next week?', '¿Podemos agendar una demo la próxima semana?'],
    ['c4.subjB', 'Question about the plans', 'Consulta sobre los planes'],
    ['c4.subjC', 'Re: the proposal we discussed', 'Re: la propuesta que conversamos'],
    ['c4.lead', 'lead', 'prospecto'],
    ['c4.followCat', 'follow-up', 'seguimiento'],
    ['c4.cap', 'Recreation with made-up email. The real inbox holds other people’s mail, so it is not shown.',
      'Recreación con correos inventados. La bandeja real tiene correos de otras personas, por eso no se muestra.'],

    /* ---- más trabajo ---- */
    ['more.title', 'More work', 'Más proyectos'],
    ['more.note', 'Earlier client and employer work, on Behance.', 'Trabajos anteriores para clientes y empleadores, en Behance.'],
    ['more.fu.alt', 'Follow Up cover: three phones in dark mode showing sign-in, indicator tables and a sales chart.',
      'Portada de Follow Up: tres teléfonos en modo oscuro con el inicio de sesión, tablas de indicadores y un gráfico de ventas.'],
    ['more.fu.d', 'Mobile-first redesign of their app’s desktop data tables, to compare results between stores.',
      'Rediseño mobile-first de las tablas de escritorio de su app, para comparar resultados entre tiendas.'],
    ['more.ff.alt', 'Falabella Finanzas cover: a laptop showing the Falabella logo on a dark concrete background, next to a fragment of a tablet interface.',
      'Portada de Falabella Finanzas: un notebook con el logo de Falabella sobre un fondo de concreto oscuro, junto a un fragmento de una interfaz de tablet.'],
    ['more.ff.d', 'UX/UI redesign of the design system behind an internal financial reconciliation tool.',
      'Rediseño UX/UI del design system de una herramienta interna de conciliación financiera.'],
    ['more.bci.alt', 'BCI Plus UX report cover: the BCI Plus logo and the words Design Thinking methodology on a white background.',
      'Portada del informe UX de BCI Plus: el logo de BCI Plus y las palabras «Design Thinking methodology» sobre fondo blanco.'],
    ['more.bci.d', 'A UX report for BCI Plus, a cashback program: personas, interviews and analytics.',
      'Un informe UX para BCI Plus, un programa de cashback: personas, entrevistas y analítica.'],
    ['more.b2b.cat', 'E-commerce prototype', 'Prototipo de tienda en línea'],
    ['more.b2b.d', 'E-commerce catalog prototype for sellers to share products with clients, on desktop and mobile.',
      'Catálogo para que los vendedores compartan productos con clientes, en escritorio y móvil.'],
    ['more.sw.alt', 'Santander Work Café cover: the Work Café Santander logo in white and red on black.',
      'Portada de Santander Work Café: el logo de Work Café Santander en blanco y rojo sobre negro.'],
    ['more.sw.d', 'UX/UI for Work Café, the bank’s café and coworking spaces.', 'UX/UI para Work Café, los espacios de café y cowork del banco.'],
    ['more.entel.alt', 'Entel TV cover: the Entel TV logo on dark blue.', 'Portada de Entel TV: el logo de Entel TV sobre azul oscuro.'],
    ['more.entel.d', 'UX research and design for Entel TV, the telecom company’s TV service.', 'UX research (investigación de usuarios) y diseño para Entel TV, el servicio de televisión de Entel.'],

    /* ---- cómo trabajo ---- */
    ['how.title', 'How I work', 'Cómo trabajo'],
    ['how.note', 'The same path for every task, whether a person or an agent builds it.', 'El mismo camino para cada tarea, la construya una persona o un agente.'],
    ['how.lb1', 'Spec', 'Encargo'],
    ['how.lb2', 'Build', 'Construcción'],
    ['how.lb3', 'Verify', 'Verificación'],
    ['how.lb4', 'Ship', 'Entrega'],
    ['how.h1', 'Spec', 'Encargo con criterios'],
    ['how.h2', 'Build', 'Construcción aislada'],
    ['how.h3', 'Independent verification', 'Verificación independiente'],
    ['how.h4', 'Review and ship', 'Revisión y entrega'],
    ['how.p1', 'Each task is a card with its acceptance criteria. The technical plan comes before the build.',
      'Cada tarea es una tarjeta con sus criterios de aceptación. El plan técnico va antes de construir.'],
    ['how.p2', 'A developer agent builds in its own workspace, with the design system and automatic checks.',
      'Un agente construye en su propio espacio, con el design system y controles automáticos.'],
    ['how.p3', 'A second agent checks every requirement with evidence. Failures go back and, if repeated, escalate.',
      'Otro agente revisa cada requisito con evidencia. Lo que falla vuelve y, si se repite, se escala.'],
    ['how.p4', 'I review at the end of each stage. Then it goes to staging, and from there to production.',
      'Reviso al final de cada etapa. Después pasa a staging y de ahí a producción.'],
    ['fab.title', 'See it in motion', 'Míralo en movimiento'],
    ['fab.note', 'The same path as a short animation, with a fail, a fix and the lesson it leaves.',
      'El mismo camino en una animación corta, con una falla, un arreglo y la lección que deja.'],
    ['fab.play', 'Play', 'Reproducir'],
    ['fab.anyway', 'Watch anyway', 'Verla igual'],
    ['fab.meta', '41 s · with sound', '41 s · con sonido'],
    ['fab.rm', 'Reduced motion is on, so this is a still view. Press play if you want to watch it anyway.',
      'Tienes activado reducir el movimiento, por eso ves una imagen fija. Presiona reproducir si quieres verla igual.'],
    // controles de la pieza antes de que fabrica.js los rotule con su propio diccionario (mismos textos que fabrica.js)
    ['fab.ui.prev', 'Previous scene', 'Escena anterior'],
    ['fab.ui.next', 'Next scene', 'Escena siguiente'],
    ['fab.ui.replay', 'Replay', 'Repetir'],
    ['fab.ui.see8', 'See the 8 scenes', 'Ver las 8 escenas'],
    ['fab.ui.step', 'Step by step', 'Paso a paso'],
    ['fab.ui.sound', 'Sound', 'Sonido'],
    ['fab.ui.sndOff', 'sound off', 'sonido apagado'],
    // póster C «Titular»; la tira usa los mismos rótulos que las escenas de la pieza (TX.*.tag de fabrica.js)
    ['pc.h1', 'One task.', 'Una tarea.'],
    ['pc.h2', 'One fail.', 'Una falla.'],
    ['pc.h3', 'One lesson.', 'Una lección.'],
    ['pc.sub', 'Follow it from spec to production.', 'Síguela de la spec a producción.'],
    ['pc.s2', 'Order + plan', 'Orden + plan'],
    ['pc.s3', 'Team + room', 'Equipo y lugar'],
    ['pc.s4', 'Build + seal', 'Hacer + sellar'],
    ['pc.s5', 'Check + return', 'Revisión + vuelta'],
    ['pc.s6', 'How are we doing?', '¿Cómo vamos?'],
    ['pc.s7', 'Review + ship', 'Revisar + salir'],
    ['pc.s8', 'Lesson', 'Lección'],
    ['pc.fail', 'fails once', 'falla una vez'],

    /* ---- trayectoria ---- */
    ['bg.title', 'Background', 'Trayectoria'],
    ['bg.now', '2025 to now', '2025 a la fecha'],
    ['bg.sence', 'Instructor and mentor for UX/UI and AI-for-design bootcamps', 'Instructor y mentor de bootcamps de UX/UI e IA aplicada al diseño'],
    ['bg.fal.when', '2023 to 2025', '2023 a 2025'],
    ['bg.fal', 'Product designer. Led a design system to unify internal tools and platforms, with reusable components, working with product managers and engineers.',
      'Diseñador de producto. Lideré un design system para unificar herramientas y plataformas internas, con componentes reutilizables, junto a product managers e ingenieros.'],
    ['bg.shipped', 'shipped', 'lanzado', {x: 1}],
    ['bg.ade', 'Designer and developer. Worked on Salsa, an AI assistant', 'Diseñador y desarrollador. Trabajé en Salsa, un asistente de IA'],
    ['bg.bci.when', '2021 to 2022', '2021 a 2022'],
    ['bg.bci', 'UI and visual designer', 'Diseñador UI y visual'],
    ['bg.sw.when', '2020 to 2021', '2020 a 2021'],
    ['bg.sw', 'UX/UI designer. Led the design cell', 'Diseñador UX/UI. Lideré la célula de diseño'],
    ['bg.latam.when', '2018 to 2020', '2018 a 2020'],
    ['bg.latam', 'UI designer and front end, through Kiteknology. Web interfaces and animations for a multi-platform application.',
      'Diseñador UI y front end, por medio de Kiteknology. Interfaces web y animaciones para una aplicación multiplataforma.'],
    ['bg.skills', 'Skills', 'Habilidades'],
    ['sk.product', 'Product Design', 'Diseño de producto'],
    ['sk.ux', 'UX Design', 'Diseño UX'],
    ['sk.ui', 'UI Design', 'Diseño UI'],
    ['sk.ds', 'Design Systems', 'Design systems'],
    ['sk.proto', 'Prototyping', 'Prototipado'],
    ['sk.test', 'Usability Testing', 'Pruebas de usabilidad'],
    ['sk.pm', 'Product Management', 'Gestión de producto'],
    // grupo «IA y agentes» (lista aprobada el 14-11; Playwright y Git worktrees son nombres propios y no se traducen)
    ['sk.g.ai', 'AI and agents', 'IA y agentes'],
    ['sk.g.do', 'What I do', 'Lo que hago'],
    ['sk.g.with', 'With', 'Con qué'],
    ['sk.g.design', 'Design and product', 'Diseño y producto'],
    ['sk.g.code', 'Code', 'Código'],
    ['sk.ai.orch', 'Multi-agent orchestration (PO, TL, Dev, verifier)', 'Orquestación de equipos de agentes (PO, TL, Dev, verificador)'],
    ['sk.ai.spec', 'Specs and acceptance criteria for agents', 'Specs y criterios de aceptación para agentes'],
    ['sk.ai.verif', 'Independent verification by a second agent', 'Verificación independiente por otro agente'],
    ['sk.ai.guard', 'Guardrails, sensors and mutation testing', 'Guardas, sensores y pruebas de mutación'],
    ['sk.ai.mem', 'Persistent memory for agents', 'Memoria persistente para agentes'],
    ['sk.ai.qa', 'Browser automation and visual QA', 'Automatización de navegador y QA visual'],
    ['sk.ai.voice', 'Voice interfaces (TTS and dictation)', 'Interfaces de voz (texto a voz y dictado)'],
    ['sk.ai.cc', 'Claude Code (skills, hooks, subagents, workflows)', 'Claude Code (skills, hooks, subagentes, workflows)'],
    ['sk.ai.mcp', 'MCP servers and connectors', 'MCP (servidores y conectores)'],
    ['sk.ai.ollama', 'Local models with Ollama', 'Modelos locales con Ollama'],

    /* ---- contacto y pie ---- */
    ['contact.title', 'Contact', 'Contacto'],
    ['contact.lead', 'Open to product design work with teams building with AI.', 'Disponible para diseño de producto con equipos que construyen con IA.'],
    ['contact.email', 'Email', 'Correo'],
    ['foot.text', 'Built by me and my agents, then checked by a separate one.', 'Lo construimos mis agentes y yo, y después lo revisó otro agente.']
  ];

  var LANGS = ['en', 'es'], KEY_STORE = 'site-lang', d = document.documentElement;
  var BY = {}, EN = {}, ES = {};
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  D.forEach(function (e) {
    BY[e[0]] = e;
    if (e[3] && e[3].x) return;
    var a = norm(e[1]), b = norm(e[2]);
    if (!(a in EN)) EN[a] = e[0];
    if (!(b in ES)) ES[b] = e[0];
  });
  function valid(l) { return LANGS.indexOf(l) >= 0 ? l : null; }
  function fromUrl() { try { var m = /[?&]lang=([a-z]{2})/i.exec(location.search); return m ? valid(m[1].toLowerCase()) : null; } catch (e) { return null; } }
  function fromStore() { try { return valid(localStorage.getItem(KEY_STORE)); } catch (e) { return null; } }
  function fromNav() { try { return /^es\b/i.test(navigator.language || '') ? 'es' : 'en'; } catch (e) { return 'en'; } }
  var L = fromUrl() || fromStore() || fromNav();
  var ready = false;

  function t(k, l) { var e = BY[k]; if (!e) return k; return (l || L) === 'es' ? e[2] : e[1]; }
  function keyOf(text) { var n = norm(text); return n ? (EN[n] || ES[n] || null) : null; }

  function head() {
    d.lang = L;
    try { document.title = t('head.title'); } catch (e) {}
    var m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute('content', t('head.desc'));
    // og:* y twitter:* si algún día se agregan: se traducen por su texto
    Array.prototype.forEach.call(document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"]'), function (x) {
      var c = x.getAttribute('content'), k = x.__k || keyOf(c || ''); if (k) { x.__k = k; x.setAttribute('content', t(k)); }
    });
  }

  // fuera de alcance: lo que otros scripts escriben con su propio diccionario (barra del Tour, cursores, la pieza animada)
  var SKIP = '.swarm-hud,.swarm-invite,.cur,.fr,[data-i18n-skip],#seq-box .cap,#seq-box .sc-tag,#seq-box .sbar,#seq-box .ctrl,#seq-box svg,#seq-live';
  var ATTRS = ['alt', 'aria-label', 'title', 'placeholder'];
  function skipped(el) { return !!(el && el.closest && el.closest(SKIP)); }
  function apply(root) {
    root = root || document.body; if (!root) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (tn) {
      var p = tn.parentNode; if (!p || p.nodeType !== 1) return;
      if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(p.tagName) || skipped(p)) return;
      var k = p.getAttribute('data-i18n') || tn.__k || keyOf(tn.nodeValue);
      if (!k || !BY[k]) return;
      tn.__k = k;
      var v = tn.nodeValue, m = /^(\s*)[\s\S]*?(\s*)$/.exec(v), out = m[1] + t(k) + m[2];
      if (v !== out) tn.nodeValue = out;
    });
    var els = root.querySelectorAll ? root.querySelectorAll('[alt],[aria-label],[title],[placeholder]') : [];
    Array.prototype.forEach.call(els, function (el) {
      if (skipped(el)) return;
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        el.__ka = el.__ka || {};
        var k = el.getAttribute('data-i18n-' + a) || el.__ka[a] || keyOf(el.getAttribute(a));
        if (!k || !BY[k]) return;
        el.__ka[a] = k;
        var out = t(k); if (el.getAttribute(a) !== out) el.setAttribute(a, out);
      });
    });
    // el bloque de la pieza declara su idioma (fabrica.js hace lo mismo al cargarse)
    var box = document.getElementById('seq-box'); if (box) box.lang = L;
  }
  function paintSwitch() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang-set]'), function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang-set') === L));
    });
  }
  function urlSync() {
    try { var u = new URL(location.href); u.searchParams.set('lang', L); history.replaceState(history.state, '', u.href); } catch (e) {}
  }
  function set(l, opts) {
    l = valid(l); if (!l) return;
    opts = opts || {};
    if (opts.save !== false) { try { localStorage.setItem(KEY_STORE, l); } catch (e) {} }
    if (l === L) { paintSwitch(); return; }
    L = l;
    head(); apply(document.body); paintSwitch(); urlSync();
    if (window.__fabricaEmbed) window.__fabricaEmbed.lang = L;
    if (opts.from !== 'video' && window.__sb && window.__sb.setLang) { try { window.__sb.setLang(L); } catch (e) {} }
    try { document.dispatchEvent(new CustomEvent('site:lang', {detail: {lang: L}})); } catch (e) {}
  }
  function init() {
    if (ready) return; ready = true;
    apply(document.body); paintSwitch();
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang-set]'), function (b) {
      b.addEventListener('click', function () { set(b.getAttribute('data-lang-set')); });
    });
    d.classList.remove('i18n-hold');
  }
  document.addEventListener('fabrica:lang', function (e) { var l = e && e.detail && e.detail.lang; if (l) set(l, {from: 'video'}); });

  head();
  if (L !== 'en') {
    d.classList.add('i18n-hold');
    // red de seguridad: si ready() no llega, la página se muestra igual
    setTimeout(function () { d.classList.remove('i18n-hold'); }, 2500);
  }
  window.__i18n = {
    get lang() { return L; }, t: function (k) { return t(k); }, set: set, apply: apply, ready: init,
    entries: D, keyOf: keyOf, langs: LANGS
  };
})();
