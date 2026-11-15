/* Swarm rebuild: los agentes reales arman la página como en una herramienta de diseño.
   ETAPA DE INICIO: al cargar, pantalla negra, los agentes orbitan en dos bandadas (y se aquietan solos a los 5 s) y la
   etapa ESPERA al visitante: botón «Take the tour · ~N s» y enlace «Scroll on my own». El Tour nunca arranca solo.
   «Tour» arma la primera pantalla y luego la página baja sola a ritmo de lectura mientras cada bloque se construye;
   bajar por su cuenta (o «Scroll on my own») arma la primera pantalla y deja el scroll en manos del lector.
   Cualquier entrada de scroll del visitante durante el Tour lo pone en «Paused» sin mover la página; «Resume» sigue
   desde ahí. «Replay tour» vive siempre en la cabecera y en el pie (en el HTML).
   Cada unidad pasa por: MARCO (un agente arrastra un marco de selección con tiradores; etiqueta «spec»),
   RELLENO PROVISIONAL (bloque plano o barras de texto, como un wireframe), CONTENIDO (el contenido real entra
   con un fundido corto, o el texto se escribe por líneas tras la barra de texto; etiqueta «build») y SUELTA (el marco se va de golpe). En las unidades
   principales un verificador pasa antes de soltar: el marco se pone verde con «verified».
   El TL arrastra los marcos de interfaz y los Devs la ponen; PO, Marketing y Cortex abren su caja y escriben el texto.
   La barra cuenta agentes, bloques y verificados; al terminar dice «Rebuilt by N agents in SS.s» y se retira.
   Secuencias (data-seq en un contenedor + data-order en sus unidades, p. ej. el póster de «See it in motion»): la primera
   se construye en su línea como cualquiera; cada siguiente espera a que la anterior quede armada y entra en cuanto está a la
   vista (una fila con data-order cuenta entera). data-draw: un trazo SVG se dibuja (stroke-dashoffset) en vez del fundido.
   data-behind="<selector>": el marco pasa por detrás de ese elemento (se recorta donde está), sin tapar su texto.
   El contenido ya está en el HTML: esto solo lo revela con clip-path (el lector de pantalla lo tiene entero).
   No corre con prefers-reduced-motion (lo decide el script del <head>). Llegada con ancla o scroll restaurado: sin etapa.
   Skip, Escape, la caché de atrás/adelante o cualquier error dejan todo armado al instante.
   Opacidad del contenido solo en el fundido corto de 120 ms; el resto es transform y clip-path. */

/* Ritmo: todas las duraciones en ms, en un solo lugar. Estructura medida en la referencia
   (_revision/referencia-motion.md, sección H): gestos rápidos y secos, y pausas legibles entre pasos.
   Si la intro o la etapa se alargan, sube también la red del <head> de index.html (INICIO.esperaEntrar + introMax + redMargen). */
var RITMO = {
  escaneo: 440,          // «Scanning page…» con el enjambre antes del primer marco (repetición del Tour)
  estallido: 180,        // BURST_DELAY: de la órbita al primer marco tras Tour o Enter
  viaje: 180,            // TRAVEL_DUR: vuelo a la tarea con frenado fuerte
  viajeLargo: 240,       // vuelos de más de 700 px
  viajeFila: 100,        // SWAP_STAGGER: de un elemento al vecino en una fila
  anclaje: 110,          // GUIDE_DELAY + BOX_DELAY: aterriza, guías y chip, y recién ahí arrastra
  marcoGrande: 270,      // BOX_DRAG_DUR grande
  marcoChico: 200,       // BOX_DRAG_DUR chica o mediana
  marcoRafaga: 50,       // NEIGHBOR_STAGGER: filas, los marcos vacíos aparecen casi juntos
  esperaGrande: 500,     // PLACEHOLDER_HOLD: el relleno provisional a la vista antes del contenido
  espera: 400,
  esperaFila: 120,       // SWAP_EMPTY
  fundido: 120,          // CONTENT_CROSSFADE: el contenido real entra sobre el relleno
  dibujo: 700,           // data-draw: un trazo se dibuja de punta a punta (al bajar, RITMO_BAJANDO.dibujo)
  fondoFuera: 120,       // PLACEHOLDER_BG_FADE
  teclear: 6,            // TYPE_RATE: ms por carácter (≈166 car/s, a ráfagas), con mínimo y tope
  teclearMin: 220, teclearMax: 520,
  soltarGrande: 330,     // FRAME_RELEASE_DELAY: el marco sigue tras el contenido; la suelta es un corte
  soltarChico: 130,
  verificar: 240,        // marco verde con «verified» antes del corte
  hudReposo: 1400,       // a mano: sin obra a la vista, la barra se esconde
  ocioso: 240, salida: 300, entreSalidas: 50,
  miniMin: 260, miniMax: 560, // cursores chicos del enjambre
  redCola: 9000,         // red: una unidad en cola que no empieza en este tiempo queda armada
  redArmado: 1500,       // red: una unidad a medio armar queda armada tras su duración + esto
  // Al bajar (después de la intro): presupuesto por pantalla, no cola global
  plazo: 700,            // plazo duro por unidad desde que entra: a este tiempo su contenido está entero, pase lo que pase
  directo: 140,          // revelado directo (con prisa): fundido corto, sin marco ni cursor
  escalon: 45,           // las unidades que entran juntas se arman en paralelo con este escalonado
  colaMax: 4,            // con más unidades armándose a la vez que esto, la siguiente entra directa (móvil: 3)
  prisa: 1.6,            // px/ms: bajando más rápido que esto, todo entra directo
  prisaVentana: 450,     // tras un salto o un tramo rápido, lo que entra en este tiempo también va directo
  planoEspera: 700       // una unidad en plano que lleva esto visible sin cruzar la línea se construye donde esté
};
/* Etapa de inicio (referencia, secciones B y D) */
var INICIO = {
  orbita: 3200,          // IDLE_ORBIT_PERIOD: una vuelta de la bandada, sentido horario
  quieto: 4000,          // sin acción del visitante, la órbita empieza a frenar aquí y queda quieta al sumar el frenado (WCAG 2.2.2: ≤ 5 s de movimiento)
  frenoOrbita: 1000,     // ms del frenado de la órbita
  orbitaPaso: 0.55,      // rad entre cursores con nombre de una bandada (en teléfono ×1.6); con cursores de 26 px, menos de 0.5 se enciman
  orbitaArco: 150,       // px mínimos de arco entre cursores con nombre (pantallas bajas: radio chico)
  orbitaRadios: [0, 36, -32, 16, -12], // px: desfase radial de cada cursor de la bandada (alterna dentro/fuera)
  introMax: 3500,        // la intro (primera pantalla) no pasa de esto
  redMargen: 1500        // red: si la intro no termina en introMax + esto tras la decisión del visitante, todo queda visible
};
/* Tour: scroll automático (referencia, sección G). La velocidad es constante en px/s durante el recorrido:
   recorrido total / TOUR.objetivo, acotada a [pxsMin, pxsMax]. Así el Tour dura lo mismo en escritorio y en móvil,
   aunque la página móvil mida casi el doble. A 1x: objetivo + intro + arranque + pausas ≈ 47 s. */
var TOUR = {
  arranque: 800,         // SCROLL_START: tras armarse la primera pantalla, espera esto antes de bajar
  objetivo: 36000,       // ms de desplazamiento puro a 1x (sin intro ni pausas)
  pxsMin: 140, pxsMax: 380, // px/s a 1x (≈0,15–0,45 alturas de viewport por segundo)
  pausaSeccion: 400,     // al entrar cada sección grande, se detiene esto para que se vea construir
  suavizado: 220,        // ms: constante de tiempo del arranque y del frenado (velocidad con inercia)
  frenado: 0.4,          // en la última fracción de viewport antes del pie, frena hasta parar
  obra: 0.5,             // con la cola de obra llena, baja a esta fracción de la velocidad
  rotuloFinal: 4000,     // «Rebuilt by N agents in SS.s» antes de retirarse (queda «Replay tour» en la cabecera y en el pie)
  velocidades: [1, 2],   // el botón 1x alterna entre estas
  /* Tramos lentos: secciones que el Tour cruza más lento, SIN detenerse nunca (una pausa se lee como «aquí termina»).
     Frena con curva suave al acercarse, cruza la sección lento y continuo mientras su animación corre, y reacelera
     suave al terminar. La velocidad lenta se calcula: el recorrido en que el bloque animado se ve entero en pantalla,
     dividido por lo que le falta a su animación (dura × holgura, contado desde que motion.js le pone «mo-run»), con
     techo lentoMax × base (para que el cambio se note) y piso lentoPiso px/s (para que nunca parezca detenido).
     El final real llega con «motion:done» en el elemento animado; tope: si no llega, suelta igual. A 2x, dura, tope
     y piso se escalan con el multiplicador (motion.js acorta la animación en la misma proporción).
     Para otra sección: una línea aquí, y que su animación ponga «mo-run» y emita «motion:done». */
  tramosLentos: [{ seccion: '#how', anima: '#how .flow', dura: 4300, tope: 9000 }, // dura: stepper medido 4,3 s a 1x (1440 y 390)
    // póster de «See it in motion»: sus piezas se arman en secuencia (data-seq); swarm.js le pone «mo-run» al empezar la primera y
    // avisa «motion:done» al quedar armada la última. dura: titular → play medido 3,45 s a 1280 (marco, contenido, verificador)
    { seccion: '#fabrica', anima: '#fabrica', dura: 3500, tope: 8000 }],
  frenoLento: 0.45,      // fracción de viewport antes del tramo en la que empieza a frenar (smoothstep sobre la posición)
  lentoMax: 0.5,         // techo de la velocidad lenta: fracción de la base (más que esto no se percibe como frenar)
  lentoPiso: 12,         // px/s a 1x: piso absoluto; por debajo el movimiento deja de percibirse y se lee como pausa
  lentoHolgura: 1.2,     // la animación debe terminar con un 20 % de tiempo de recorrido visible de sobra
  lentoVisible: 0.6,     // fracción del bloque animado que debe seguir en pantalla al terminar (en teléfono el stepper mide
                         // 580 de 844 px y su último paso recién se construye con el bloque ya rozando el borde superior)
  aceleraLento: 1200     // ms de la reaceleración al soltar (smoothstep desde la velocidad lenta hasta la base)
};
/* Entrada del visitante: lo que detiene el Tour (o, en la etapa, cuenta como «bajar por mi cuenta»).
   Umbrales para que un roce mínimo de trackpad o un toque no lo corten. */
var GESTO = {
  rueda: 12,             // px acumulados de rueda/trackpad (en una ventana de ruedaVentana ms) antes de contar
  ruedaVentana: 250,
  arrastre: 10           // px de arrastre táctil antes de contar (un toque solo no cuenta)
};
/* Textos de la barra: un juego por idioma, según <html lang>. {n} {x} {y} {z} {s} se reemplazan. */
var TEXTOS = {
  en: {
    grupo: 'Page build controls',
    escaneo: 'Scanning page…', escaneoCorto: 'Scanning…',
    tour: 'Tour', touring: 'Touring', pausado: 'Paused', pausar: 'Pause', reanudar: 'Resume',
    invitar: 'Take the tour · ~{s} s', solo: 'Scroll on my own', grupoInvitar: 'Page tour',
    entrar: 'Enter', saltar: 'Skip', repetir: 'Replay tour', repetirCorto: 'Replay',
    progreso: '{n} agents · {x} / {y} blocks · {z} verified', progresoCorto: '{n} agents · {x}/{y}',
    final: 'Rebuilt by {n} agents in {s}s', decimal: '.',
    ariaTour: 'Start the tour: the page scrolls by itself while it builds',
    ariaTouring: 'Pause the tour', ariaReanudar: 'Resume the tour from here',
    ariaEntrar: 'Enter and scroll on your own', ariaVelocidad: 'Tour speed {v}x',
    ariaSaltar: 'Skip the animation and show the whole page', ariaRepetir: 'Replay the tour from the top',
    verbo: { frame: 'spec', write: 'writing', build: 'building', check: 'checking', save: 'saving', saved: 'saved' },
    marco: { spec: 'spec', build: 'build', ok: 'verified' }
  },
  es: {
    grupo: 'Controles de la construcción de la página',
    escaneo: 'Analizando la página…', escaneoCorto: 'Analizando…',
    tour: 'Recorrido', touring: 'Recorriendo', pausado: 'En pausa', pausar: 'Pausar', reanudar: 'Reanudar',
    invitar: 'Hacer el recorrido · ~{s} s', solo: 'Bajar por mi cuenta', grupoInvitar: 'Recorrido de la página',
    entrar: 'Entrar', saltar: 'Saltar', repetir: 'Repetir recorrido', repetirCorto: 'Repetir',
    progreso: '{n} agentes · {x} / {y} bloques · {z} verificados', progresoCorto: '{n} agentes · {x}/{y}',
    final: 'Reconstruida por {n} agentes en {s} s', decimal: ',',
    ariaTour: 'Iniciar el recorrido: la página baja sola mientras se construye',
    ariaTouring: 'Pausar el recorrido', ariaReanudar: 'Reanudar el recorrido desde aquí',
    ariaEntrar: 'Entrar y recorrer a mano', ariaVelocidad: 'Velocidad del recorrido {v}x',
    ariaSaltar: 'Saltar la animación y mostrar toda la página', ariaRepetir: 'Repetir el recorrido desde el inicio',
    verbo: { frame: 'encargo', write: 'escribiendo', build: 'construyendo', check: 'revisando', save: 'guardando', saved: 'guardado' },
    marco: { spec: 'encargo', build: 'construcción', ok: 'verificado' }
  }
};
/* Línea de construcción: al asomar por abajo una unidad muestra su PLANO (marco punteado y relleno tenue);
   se CONSTRUYE cuando su borde superior cruza esta línea (fracción del alto del viewport), para que el gesto
   se vea completo en el centro de la pantalla. Las unidades más altas que media pantalla usan LINEA_ALTA. */
var LINEA = 0.65, LINEA_MOVIL = 0.70, LINEA_ALTA = 0.55;
/* La línea real de cada unidad depende de su alto: se construye cuando su CENTRO llega a CENTRO_OBRA de la pantalla
   (así la obra cae en el centro y no en la franja baja), sin pasar de LINEA / LINEA_MOVIL / LINEA_ALTA ni subir de
   LINEA_MIN (las muy altas empiezan con el borde superior a ~12 %). Las últimas unidades de la página, que no llegan a
   esa línea, se construyen cuando llegan a su posición final (al terminar el scroll). Afinables aquí. */
var CENTRO_OBRA = 0.65, LINEA_MIN = 0.12;
// fracción del viewport donde se construye una unidad de alto hu (la usan el motor y los tramos lentos del Tour)
function lineaFrac(hu, vh, mobile) {
  var cap = hu > vh * 0.5 ? LINEA_ALTA : mobile ? LINEA_MOVIL : LINEA;
  return Math.max(LINEA_MIN, Math.min(cap, CENTRO_OBRA - hu / vh / 2));
}
/* Ritmo corto para las unidades que se arman al bajar (la intro usa RITMO tal cual).
   Peor caso ≈ viaje 150 + anclaje 50 + marco 150 + espera 140 + contenido 240 = 730 ms < plazo. */
var RITMO_BAJANDO = {
  viaje: 150, viajeLargo: 150, viajeFila: 70, anclaje: 50, marcoGrande: 150, marcoChico: 130, marcoRafaga: 30,
  esperaGrande: 140, espera: 120, esperaFila: 70, teclear: 3, teclearMin: 160, teclearMax: 240, dibujo: 520
};

(function () {
  var root = document.documentElement;
  var on = root.classList.contains('swarm') && !!window.requestAnimationFrame;
  var log = setupLog(on);
  if (!on) { root.classList.remove('swarm', 'sw-stage'); return; }
  root.classList.add('sw-js'); // desde aquí las redes son de este script (la del <head> ya no actúa)

  var S = TEXTOS[(root.lang || 'en').slice(0, 2).toLowerCase()] || TEXTOS.en;
  var ICON = {
    play: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z"/></svg>',
    pause: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2v8H2zM6 1h2v8H6z"/></svg>',
    x: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'
  };
  var narrow = window.matchMedia ? window.matchMedia('(max-width: 479px)') : { matches: window.innerWidth < 480 };

  var fine = window.matchMedia ? window.matchMedia('(pointer: fine)') : { matches: true };
  var eng = null, bar = null, invite = null, final = null, finalArgs = null;
  function finalText() { return finalArgs ? tpl(S.final, { n: finalArgs.n, s: (finalArgs.ms / 1000).toFixed(1).replace('.', S.decimal) }) : null; }
  /* [portafolio] cambio de idioma del sitio (i18n.js avisa «site:lang»): la barra y la invitación se repintan en el idioma nuevo */
  document.addEventListener('site:lang', function (e) {
    var l = e && e.detail && e.detail.lang; if (!TEXTOS[l]) return;
    S = TEXTOS[l];
    try {
      if (finalArgs) final = finalText();
      if (invite) {
        invite.setAttribute('aria-label', S.grupoInvitar);
        invite.go.querySelector('span').textContent = tpl(S.invitar, { s: tourSeconds() });
        invite.solo.textContent = S.solo;
      }
      if (bar) {
        bar.setAttribute('aria-label', S.grupo);
        if (bar.b.skip) { bar.b.skip.innerHTML = ICON.x + '<span>' + S.saltar + '</span>'; bar.b.skip.setAttribute('aria-label', S.ariaSaltar); }
        bar.b.enter.textContent = S.entrar; bar.b.enter.setAttribute('aria-label', S.ariaEntrar);
        paintSpeed(); paint();
      }
    } catch (x) {}
  });
  var inStage = false, netT = 0;
  var wheelAcc = 0, wheelAt = 0, touchY = null, touchX = null;
  var speedIx = 0;
  var tour = { on: false, paused: false, hiddenPause: false, reached: false, pos: 0, v: 0, expected: -1, last: 0,
    raf: 0, startAt: 0, holdUntil: 0, pxs: 200, max: 0, secs: [] };
  var tstat = window.__tour = { start: null, reached: null, done: null, pauses: 0 };
  var engineDone = null;

  function pad(v, w) { v = String(v); while (v.length < w) v = ' ' + v; return v; }
  function tpl(s, o) { return s.replace(/\{(\w)\}/g, function (m, k) { return k in o ? o[k] : m; }); }
  function panic(e) { // error fuera del motor: todo visible y sin barra
    window.__swarmError = String(e && e.stack || e);
    try { if (eng) eng.stop('error'); } catch (x) {}
    Array.prototype.forEach.call(document.querySelectorAll('.sw-pending,[data-build],[data-build-items] > *'), function (el) {
      el.classList.remove('sw-pending'); el.style.clipPath = ''; el.style.opacity = '';
    });
    undraw(document);
    Array.prototype.forEach.call(document.querySelectorAll('.plan-layer,.swarm-layer,.swarm-hud,.swarm-replay'), function (el) { el.remove(); });
    root.classList.remove('swarm', 'sw-ready', 'sw-stage', 'sw-stage-out');
    tourHalt();
  }
  // trazos data-draw: vuelven a su estado normal (entero), quitando lo que puso el dibujo
  function undraw(scope) {
    Array.prototype.forEach.call(scope.querySelectorAll('[data-draw] path'), function (p) { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
  }
  function guard(fn) { return function (e) { try { fn(e); } catch (x) { panic(x); } }; }

  function boot() {
    if (typeof window.IntersectionObserver !== 'function') { root.classList.remove('swarm', 'sw-stage'); return; } // sin IO: página normal
    makeBar();
    eng = Engine({ replay: false });
    if (eng.dead()) { removeStage(true); return; }
    // acceso permanente al Tour: «Replay tour» en la cabecera y en el pie (en el HTML, ocultos sin JS y con reduced-motion)
    Array.prototype.forEach.call(document.querySelectorAll('[data-tour-replay]'), function (b) {
      b.hidden = false;
      b.addEventListener('click', guard(function () { if (inStage) enter(true); else replay(); }));
    });
    window.addEventListener('wheel', guard(gesture), { passive: true, capture: true });
    window.addEventListener('touchstart', guard(gesture), { passive: true, capture: true });
    window.addEventListener('touchmove', guard(gesture), { passive: true, capture: true });
    window.addEventListener('pointerdown', guard(gesture), { passive: true, capture: true });
    window.addEventListener('keydown', guard(gesture), { capture: true });
    window.addEventListener('click', guard(onStageClick), { capture: true });
    document.addEventListener('focusin', guard(onStageFocus));
    window.addEventListener('scroll', guard(onTourScroll), { passive: true });
    window.addEventListener('resize', guard(function () { if (tour.on) measureTour(); }), { passive: true });
    document.addEventListener('visibilitychange', guard(onVisibility));
    // «See it in motion» (index.html): si el visitante la reproduce durante el Tour, el Tour queda en «Paused» (la pieza nunca arranca por el Tour)
    document.addEventListener('fabrica:play', guard(function () { tourPause(true); }));
    window.addEventListener('pageshow', guard(function (e) { if (e.persisted) skipAll('persist'); }));
    if (eng.arrival() || !eng.hasIntro()) { removeStage(true); setMode('building'); eng.begin(0); }
    else stage();
  }

  /* ---------- Etapa de inicio ----------
     En reposo hasta que el visitante decide: botón «Take the tour · ~N s» (el único camino en táctil) y enlace
     «Scroll on my own». Atajos: en escritorio (puntero fino) un clic en la etapa fuera de enlaces y botones inicia el
     Tour; bajar por su cuenta (rueda, arrastre, teclas de scroll, barra de desplazamiento) o llevar el foco a la página
     entra sin Tour. La órbita frena y queda quieta sola a los INICIO.quieto ms. */
  function stage() {
    inStage = true;
    root.classList.add('sw-stage');
    setMode('stage');
    barShow(false);
    makeInvite(); // antes de la órbita: la bandada se dimensiona para no bajar hasta la invitación
    eng.orbitStart();
  }
  function tourSeconds() { // duración aproximada del Tour a 1x, redondeada a 5 s (intro + arranque + bajada + pausas de sección)
    var se = document.scrollingElement || root, max = Math.max(0, se.scrollHeight - window.innerHeight);
    var pxs = Math.max(TOUR.pxsMin, Math.min(TOUR.pxsMax, max / (TOUR.objetivo / 1000)));
    var secs = document.querySelectorAll('.rest > section, .case, .card').length;
    // tiempo que suma cada tramo lento respecto de cruzarlo a velocidad base (frenado, tramo y reaceleración)
    var slow = TOUR.tramosLentos.reduce(function (t, cfg) {
      var an = document.querySelector(cfg.anima);
      if (!document.querySelector(cfg.seccion) || !an) return t;
      var e = { cfg: cfg, an: an }; placeLento(e, max, pxs, 1);
      var w = e.yB - e.yA, fb = e.yA - e.yBrake, r = e.vPlan / pxs;
      return t + (w / e.vPlan - w / pxs + fb / pxs * (2 / (1 + r) - 1) + TOUR.aceleraLento / 1000 * (1 - r) / 2) * 1000;
    }, 0);
    // 5800: intro, arranque real y frenado al pie (calibrado con el Tour medido: 47 s sin tramos lentos a 1440 y a 390)
    var ms = 5800 + TOUR.arranque + max / pxs * 1000 + secs * TOUR.pausaSeccion + TOUR.suavizado * 2 + slow;
    return Math.max(5, Math.round(ms / 5000) * 5);
  }
  function makeInvite() {
    if (invite) return;
    var v = invite = document.createElement('div');
    v.className = 'swarm-invite';
    v.setAttribute('role', 'group');
    v.setAttribute('aria-label', S.grupoInvitar);
    v.innerHTML = '<button type="button" class="btn btn--primary swarm-invite__go">' + ICON.play + '<span></span></button>' +
      '<a class="swarm-invite__solo" href="#room"></a>';
    v.go = v.querySelector('button'); v.solo = v.querySelector('a');
    v.go.querySelector('span').textContent = tpl(S.invitar, { s: tourSeconds() });
    v.solo.textContent = S.solo;
    v.go.addEventListener('click', guard(function () { enter(true); }));
    v.solo.addEventListener('click', guard(function (e) {
      e.preventDefault();
      var to = document.getElementById('room');
      enter(false);
      if (!to) return;
      var y = to.getBoundingClientRect().top + window.scrollY;
      try { window.scrollTo({ top: y, behavior: 'smooth' }); } catch (x) { window.scrollTo(0, y); }
      if (!to.hasAttribute('tabindex')) to.setAttribute('tabindex', '-1');
      to.focus({ preventScroll: true });
    }));
    var link = document.querySelector('.skip-link');
    if (link && link.parentNode) link.parentNode.insertBefore(v, link.nextSibling);
    else document.body.insertBefore(v, document.body.firstChild);
    requestAnimationFrame(function () { if (invite === v) v.classList.add('is-on'); });
  }
  function inviteRemove() {
    if (!invite) return;
    var v = invite, hadFocus = v.contains(document.activeElement);
    invite = null;
    v.classList.remove('is-on');
    setTimeout(function () { if (v.parentNode) v.parentNode.removeChild(v); }, 300);
    return hadFocus;
  }
  function enter(withTour) { // Tour o «por mi cuenta»: la órbita estalla y se arma la primera pantalla
    if (!inStage) return;
    inStage = false;
    var hadFocus = inviteRemove();
    removeStage(false);
    eng.orbitStop();
    eng.begin(RITMO.estallido);
    window.__swarmEnter = performance.now();
    clearTimeout(netT); // red: si la intro no termina a tiempo, todo queda visible
    netT = setTimeout(guard(function () { if (!eng.introDone()) skipAll('skip'); }), INICIO.introMax + INICIO.redMargen);
    if (withTour) { tourStart(); if (hadFocus && bar) bar.b.tour.focus({ preventScroll: true }); }
    else setMode('building');
  }
  function removeStage(now) {
    inviteRemove();
    if (!root.classList.contains('sw-stage')) return;
    root.classList.remove('sw-stage');
    if (now) return;
    root.classList.add('sw-stage-out'); // el negro se va con un fundido corto
    setTimeout(function () { root.classList.remove('sw-stage-out'); }, 400);
  }
  function inBar(e) { var t = e.target; return !!(t && t.closest && t.closest('.swarm-hud,.swarm-invite,[data-tour-replay]')); }
  var SCROLL_KEYS = /^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| |Spacebar)$/;
  // ¿Es una entrada del visitante que mueve la página? Con umbral para rueda y arrastre.
  function userScrolls(e) {
    if (e.type === 'keydown') {
      var t = e.target, editable = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      return !editable && SCROLL_KEYS.test(e.key);
    }
    if (e.type === 'wheel') {
      var now = performance.now(), k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      if (now - wheelAt > GESTO.ruedaVentana) wheelAcc = 0;
      wheelAt = now;
      wheelAcc += (Math.abs(e.deltaY) + Math.abs(e.deltaX)) * k;
      return wheelAcc >= GESTO.rueda;
    }
    if (e.type === 'touchstart') { var p = e.touches && e.touches[0]; touchY = p ? p.clientY : null; touchX = p ? p.clientX : null; return false; }
    if (e.type === 'touchmove') {
      var q = e.touches && e.touches[0];
      if (!q || touchY === null) return false;
      return Math.abs(q.clientY - touchY) + Math.abs(q.clientX - touchX) >= GESTO.arrastre;
    }
    if (e.type === 'pointerdown') return e.clientX >= root.clientWidth; // la barra de desplazamiento sí; un clic en la página no
    return false;
  }
  // Entradas del visitante: en la etapa, bajar por su cuenta = entrar sin Tour; durante el Tour, lo pausan sin mover la página
  function gesture(e) {
    if (e.type === 'keydown') {
      if (e.key === 'Escape') { if (inStage || tour.on || (bar && bar.isConnected)) skipAll('skip'); return; }
      if (e.altKey || e.ctrlKey || e.metaKey) return;
    }
    if (inBar(e)) return;
    if (inStage) { if (userScrolls(e)) enter(false); return; }
    if (!tour.on || tour.paused || tour.reached) return;
    if (userScrolls(e)) tourPause(true);
  }
  // Atajo de escritorio: un clic con puntero fino en la etapa (fuera de enlaces y botones) inicia el Tour.
  // En táctil un toque no hace nada (suele ser el comienzo de un arrastre): solo el botón inicia.
  function onStageClick(e) {
    if (!inStage || inBar(e) || !e.detail) return; // !detail: clic sintético de teclado, lo maneja su propio control
    // lo que está bajo el negro no se ve: ningún clic o toque lo activa mientras dura la etapa
    e.preventDefault(); e.stopPropagation();
    if (!fine.matches || e.pointerType === 'touch' || e.pointerType === 'pen') return;
    enter(true);
  }
  // El foco de teclado sale de la invitación hacia la página (Tab): entra sin Tour, para que lo enfocado se vea
  function onStageFocus(e) {
    if (!inStage) return;
    var t = e.target;
    if (!t || t === document.body || t === root || inBar(e) || (t.closest && t.closest('.skip-link'))) return;
    enter(false);
  }
  function onVisibility() {
    if (document.hidden) {
      if (tour.on && !tour.paused && !tour.reached) { tourPause(false); tour.hiddenPause = true; }
    } else {
      if (tour.hiddenPause) { tour.hiddenPause = false; tourResume(); }
    }
  }

  /* ---------- Barra-controlador ---------- */
  function makeBar() {
    bar = document.createElement('div');
    bar.className = 'swarm-hud';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', S.grupo);
    bar.innerHTML = '<span class="swarm-hud__dot" aria-hidden="true"></span><span class="swarm-hud__st" role="status" hidden></span><span class="swarm-hud__txt" aria-live="off"></span>' +
      '<span class="swarm-hud__bar" aria-hidden="true"><i></i></span>' +
      '<button type="button" class="swarm-hud__b" data-k="tour" aria-pressed="false"></button>' +
      '<button type="button" class="swarm-hud__b" data-k="enter"></button>' +
      '<button type="button" class="swarm-hud__b swarm-hud__b--speed" data-k="speed"></button>';
    bar.txt = bar.querySelector('.swarm-hud__txt');
    bar.fill = bar.querySelector('.swarm-hud__bar i');
    bar.st = bar.querySelector('.swarm-hud__st');
    bar.b = {};
    Array.prototype.forEach.call(bar.querySelectorAll('button'), function (b) { bar.b[b.getAttribute('data-k')] = b; });
    var skip = document.querySelector('.swarm-skip'), link = document.querySelector('.skip-link');
    if (skip && skip.closest('.swarm-hud')) skip = null; // repetición: la barra anterior aún se retira con su botón
    if (!skip) { skip = document.createElement('button'); skip.type = 'button'; skip.className = 'swarm-skip'; }
    // mismo lugar en el orden de tabulación: justo después de «Skip to content»
    if (skip.parentNode) skip.parentNode.insertBefore(bar, skip);
    else if (link && link.parentNode) link.parentNode.insertBefore(bar, link.nextSibling);
    else document.body.insertBefore(bar, document.body.firstChild);
    skip.classList.add('swarm-hud__b');
    skip.setAttribute('data-k', 'skip');
    skip.innerHTML = ICON.x + '<span>' + S.saltar + '</span>';
    skip.setAttribute('aria-label', S.ariaSaltar);
    bar.appendChild(skip);
    bar.b.skip = skip;
    bar.b.enter.textContent = S.entrar;
    bar.b.enter.setAttribute('aria-label', S.ariaEntrar);
    paintSpeed();
    bar.b.tour.addEventListener('click', guard(onTourButton));
    bar.b.enter.addEventListener('click', guard(function () { enter(false); }));
    bar.b.speed.addEventListener('click', guard(function () { speedIx = (speedIx + 1) % TOUR.velocidades.length; paintSpeed(); }));
    skip.addEventListener('click', guard(function () { skipAll('skip'); }));
    bar.addEventListener('focusin', function () { barShow(true); });
    bar.addEventListener('focusout', function () { setTimeout(guard(function () { if (bar && mode === 'building' && !bar.contains(document.activeElement)) idleCheck(); }), 0); });
    if (narrow.addEventListener) narrow.addEventListener('change', function () { if (bar) paint(); });
  }
  var mode = '', lastProg = null;
  function setMode(m) { mode = m; root.classList.toggle('sw-touring', m === 'touring'); paint(); }
  function paint() {
    if (!bar) return;
    var n = narrow.matches, b = bar.b, t = b.tour;
    var showTour = mode !== 'final', running = mode === 'touring';
    t.hidden = !showTour;
    t.setAttribute('aria-pressed', running ? 'true' : 'false');
    if (running) { t.innerHTML = ICON.pause + '<span>' + S.pausar + '</span>'; t.setAttribute('aria-label', S.ariaTouring); }
    else if (mode === 'paused') { t.innerHTML = ICON.play + '<span>' + S.reanudar + '</span>'; t.setAttribute('aria-label', S.ariaReanudar); }
    else { t.innerHTML = ICON.play + '<span>' + S.tour + '</span>'; t.setAttribute('aria-label', S.ariaTour); }
    bar.st.hidden = !(running || mode === 'paused');
    bar.st.textContent = running ? S.touring : S.pausado;
    bar.classList.toggle('is-paused', mode === 'paused');
    bar.txt.hidden = n && (running || mode === 'paused'); // teléfono: el estado en lugar de las cifras; el progreso queda en la línea
    b.enter.hidden = mode !== 'stage';
    b.speed.hidden = mode === 'final';
    b.skip.hidden = mode === 'stage' || mode === 'final';
    b.skip.querySelector('span').className = n ? 'sr-only' : '';
    bar.classList.toggle('is-final', mode === 'final');
    if (mode === 'final') { bar.txt.textContent = final; bar.fill.style.transform = 'scaleX(1)'; }
    else if (lastProg) progress(lastProg);
    else bar.txt.textContent = n ? S.escaneoCorto : S.escaneo;
  }
  function paintSpeed() {
    var v = TOUR.velocidades[speedIx];
    bar.b.speed.textContent = v + 'x';
    root.setAttribute('data-tour-speed', v); // motion.js acorta en proporción las animaciones de sus tramos lentos
    bar.b.speed.setAttribute('aria-label', tpl(S.ariaVelocidad, { v: v }));
  }
  function progress(p) {
    lastProg = p;
    if (!bar || mode === 'final') return;
    var n = narrow.matches;
    // P1: cifras tabulares rellenas con espacio de cifra (U+2007) al ancho del total: el rótulo no baila al sumar dígitos
    bar.txt.textContent = p.scanning ? (n ? S.escaneoCorto : S.escaneo)
      : tpl(n ? S.progresoCorto : S.progreso, { n: pad(p.agents, 2), x: pad(p.shown, String(p.total).length), y: p.total, z: p.verified });
    bar.fill.style.transform = 'scaleX(' + (p.total ? p.shown / p.total : 1) + ')';
  }
  function barShow(onOff) { if (bar) bar.classList.toggle('is-on', onOff); }
  function idleCheck() { // a mano: sin obra la barra se esconde (salvo con el foco dentro)
    if (!bar || mode !== 'building') return;
    if (bar.contains(document.activeElement)) return;
    barShow(false);
  }
  function barRemove() {
    if (!bar) return;
    var b = bar, hadFocus = b.contains(document.activeElement);
    bar = null;
    b.classList.remove('is-on');
    setTimeout(function () { b.remove(); }, 350);
    return hadFocus;
  }
  // Hooks que el motor llama
  var hooks = {
    progress: function (p) { progress(p); },
    activity: function () { if (mode !== 'final') barShow(true); },
    idle: function () { idleCheck(); },
    done: function (info) { engineDone = info; maybeFinish(); },
    stopped: function (why) { if (why === 'replay') return; finishAll(why); },
    arrive: function () { if (inStage) { inStage = false; clearTimeout(netT); removeStage(true); eng.orbitStop(); setMode('building'); barShow(false); } }
  };

  /* ---------- Final: «Rebuilt by…» y luego «Replay tour» ---------- */
  function maybeFinish() {
    if (!engineDone || mode === 'final') return;
    if (tour.on && !tour.reached) return; // el Tour sigue (o está en pausa con «Resume»): termina al llegar al pie
    finishAll('done');
  }
  function finishAll(why) {
    clearTimeout(netT);
    var wasStage = inStage;
    inStage = false;
    if (wasStage || root.classList.contains('sw-stage')) removeStage(why !== 'done');
    tourHalt();
    if (why === 'error') { barRemove(); return; }
    if (why === 'done' && engineDone && engineDone.frames) {
      tstat.done = performance.now();
      var ms = performance.now() - engineDone.t0; // hasta que todo quedó armado Y el Tour llegó al pie
      finalArgs = { n: engineDone.agents, ms: ms };
      final = finalText();
      setMode('final');
      barShow(true);
      var b = bar;
      setTimeout(guard(function () { if (bar === b && mode === 'final') focusReplay(barRemove()); }), TOUR.rotuloFinal);
      return;
    }
    mode = 'final';
    root.classList.remove('sw-touring'); // Skip a mitad del Tour: la cabecera vuelve a su conducta normal
    focusReplay(barRemove());
  }
  // La barra se retira al terminar; si tenía el foco, pasa a «Replay tour» de la cabecera (acceso permanente)
  function focusReplay(focus) {
    if (!focus) return;
    var r = document.querySelector('.top__replay');
    if (r && !r.hidden) r.focus({ preventScroll: true });
  }
  function replay() { // arriba, unidades reseteadas y el Tour completo otra vez
    tourHalt();
    if (eng) eng.stop('replay');
    root.classList.remove('smooth-nav');
    scrollToY(0);
    engineDone = null; final = null; lastProg = null;
    tstat = window.__tour = { start: null, reached: null, done: null, pauses: 0 };
    if (!bar) { makeBar(); }
    eng = Engine({ replay: true });
    tourStart();
    barShow(true);
    eng.begin(RITMO.escaneo);
    bar.b.tour.focus({ preventScroll: true });
  }
  function skipAll(why) {
    try { document.dispatchEvent(new CustomEvent('swarm:skip')); } catch (e) {} // motion.js: lo que esté animando salta a su estado final
    if (eng) eng.stop(why); // dispara hooks.stopped → finishAll
    if (mode !== 'final') finishAll(why);
  }

  /* ---------- Tour: scroll automático con requestAnimationFrame ---------- */
  function onTourButton() {
    if (inStage) { enter(true); return; }
    if (mode === 'touring') tourPause(true);
    else if (mode === 'paused') tourResume();
    else tourStart();
  }
  function scrollToY(y) {
    try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); }
  }
  function measureTour() {
    var se = document.scrollingElement || root;
    tour.max = Math.max(0, se.scrollHeight - window.innerHeight);
    tour.pxs = Math.max(TOUR.pxsMin, Math.min(TOUR.pxsMax, tour.max / (TOUR.objetivo / 1000)));
    var y = window.scrollY, line = window.innerHeight * LINEA;
    tour.secs = Array.prototype.map.call(document.querySelectorAll('.rest > section, .case, .card'), function (el) {
      var top = el.getBoundingClientRect().top + y;
      return { top: top, passed: top <= y + line };
    });
    (tour.lentos || []).forEach(function (e) {
      placeLento(e, tour.max, tour.pxs, TOUR.velocidades[speedIx]);
      if (!e.passed && y >= e.yOut) e.passed = true; // Tour retomado más abajo: el bloque ya salió de pantalla
    });
  }
  // Geometría de un tramo lento, medida en vivo (las imágenes de arriba pueden cambiar la altura de la página):
  // yA: el bloque animado entró entero; yRun: su última pieza cruza la línea de construcción (la animación no puede
  // arrancar antes: espera a que todo el bloque esté armado); yB: último punto con al menos lentoVisible del bloque en
  // pantalla (si es más alto que la pantalla: mientras la llena). yBrake: empieza a frenar; yOut: el bloque salió.
  // vPlan: la velocidad que cubre [max(yA, yRun), yB] en lo que dura la animación (con holgura), entre piso y techo.
  function placeLento(e, max, pxs, sp) {
    var vh = window.innerHeight, y = window.scrollY, r = e.an.getBoundingClientRect(), m = vh * 0.04;
    var top = r.top + y, bot = r.bottom + y, fits = r.height <= vh - 2 * m;
    function c(v) { return Math.max(0, Math.min(max, v)); }
    var yRun = 0;
    Array.prototype.forEach.call(e.an.querySelectorAll('[data-build-items] > *, [data-build]'), function (u) {
      if (u._u && u._u.after) return; // en una secuencia solo cuenta la que abre: las demás entran detrás de ella, no en su línea
      var q = u.getBoundingClientRect();
      yRun = Math.max(yRun, q.top + y - vh * lineaFrac(q.height, vh, window.innerWidth < 768));
    });
    e.yA = c(fits ? bot - vh + m : top - m);
    e.yB = Math.max(e.yA + 1, c(fits ? top - m + (1 - TOUR.lentoVisible) * r.height : bot - vh + m));
    e.yRun = c(Math.min(e.yB - 1, Math.max(e.yA, yRun)));
    e.yBrake = c(e.yA - vh * TOUR.frenoLento);
    e.yOut = c(bot - m);
    e.piso = TOUR.lentoPiso * sp;
    e.vPlan = Math.max(e.piso, Math.min(pxs * sp * TOUR.lentoMax, (e.yB - e.yRun) / (e.cfg.dura * TOUR.lentoHolgura / sp / 1000)));
  }
  function makeLentos() {
    (tour.lentos || []).forEach(function (e) { e.an.removeEventListener('motion:done', e.on); });
    tour.lentos = TOUR.tramosLentos.map(function (cfg) {
      var sec = document.querySelector(cfg.seccion), an = document.querySelector(cfg.anima);
      if (!sec || !an) return null;
      var e = { cfg: cfg, sec: sec, an: an, runAt: 0, inAt: 0, passed: false,
        done: !an.classList.contains('mo-pre') && !an.classList.contains('mo-run') }; // ya armada y quieta: nada que mostrar
      if (e.done) e.passed = true;
      e.on = function () { e.done = true; };
      an.addEventListener('motion:done', e.on);
      return e;
    }).filter(Boolean);
    tstat.lentos = [];
    tstat.lento = null;
  }
  function tourStart() {
    tour.on = true; tour.paused = false; tour.reached = false; tour.hiddenPause = false;
    tour.startAt = 0; tour.v = 0; tour.expected = -1;
    tstat.start = tstat.start || performance.now();
    root.classList.remove('smooth-nav');
    makeLentos();
    tour.relAt = 0;
    measureTour();
    tour.pos = window.scrollY;
    setMode('touring');
    barShow(true);
    tick0();
  }
  function tourPause(byUser) {
    if (!tour.on || tour.paused) return;
    tour.paused = true; tour.v = 0; tour.expected = -1; tour.relAt = 0;
    if (tour.raf) { cancelAnimationFrame(tour.raf); clearTimeout(tour.tm); tour.raf = 0; }
    if (byUser) { tstat.pauses++; tstat.pausedAt = performance.now(); setMode('paused'); maybeFinish(); }
  }
  function tourResume() {
    if (!tour.on || !tour.paused) return;
    tour.paused = false; tour.reached = false; tour.v = 0; tour.expected = -1;
    measureTour();
    tour.pos = window.scrollY;
    setMode('touring');
    tick0();
  }
  function tourHalt() {
    tour.on = false; tour.paused = false; tour.hiddenPause = false;
    tstat.lento = null;
    if (tour.raf) { cancelAnimationFrame(tour.raf); clearTimeout(tour.tm); tour.raf = 0; }
  }
  function tick0() { tour.last = performance.now(); next(); }
  // próximo cuadro; si el navegador frena requestAnimationFrame (ventana tapada), un temporizador corto lo reemplaza
  function next() {
    if (tour.raf) return;
    var ran = false, tm = 0, run = guard(function () { if (ran) return; ran = true; clearTimeout(tm); tick(performance.now()); });
    tour.raf = requestAnimationFrame(run);
    tm = setTimeout(run, 40);
    tour.tm = tm;
  }
  function onTourScroll() { // alguien movió la página (barra de scroll, script, ancla): manda él
    if (inStage) { if (window.scrollY > 2) enter(false); return; } // bajó por su cuenta antes de decidir: sin Tour
    if (tour.on && tour.paused && !tour.reached) { // en pausa y llegó al pie por su cuenta: el Tour ya no tiene adónde ir
      var se = document.scrollingElement || root;
      if (window.scrollY >= se.scrollHeight - window.innerHeight - 2) { tour.reached = true; maybeFinish(); }
      return;
    }
    if (!tour.on || tour.paused || tour.reached || tour.expected < 0) return;
    if (Math.abs(window.scrollY - tour.expected) > 3) tourPause(true);
  }
  function tick(now) {
    tour.raf = 0;
    if (!tour.on || tour.paused || tour.reached) return;
    var dt = Math.min(100, Math.max(0, now - tour.last));
    tour.last = now;
    if (!eng.introDone()) { next(); return; } // primero se arma la primera pantalla
    if (!tour.startAt) tour.startAt = now + TOUR.arranque;
    if (now < tour.startAt) { next(); return; }
    var y = window.scrollY;
    if (tour.expected >= 0 && Math.abs(y - tour.expected) > 3) { tourPause(true); return; }
    // el alto de la página puede crecer mientras baja (imágenes diferidas): el pie se mide en vivo
    tour.max = Math.max(0, (document.scrollingElement || root).scrollHeight - window.innerHeight);
    var vh = window.innerHeight, line = y + vh * LINEA, sp = TOUR.velocidades[speedIx], base = tour.pxs * sp;
    // Tramo lento: frena con curva suave, cruza la sección lento (nunca a 0) mientras su animación corre y reacelera al terminar
    var slow = -1, L = null;
    (tour.lentos || []).some(function (e) { if (!e.passed) { L = e; return true; } return false; });
    if (L) {
      placeLento(L, tour.max, tour.pxs, sp);
      if (!L.runAt && L.an.classList.contains('mo-run')) L.runAt = now;
      var free = L.done || (L.runAt && now - L.runAt >= L.cfg.tope / sp) || (L.inAt && now - L.inAt >= L.cfg.tope * 1.5 / sp);
      if (free || tour.pos >= L.yOut) { // terminó (o el bloque ya salió de pantalla): suelta y reacelera desde donde va
        L.passed = true; tstat.lento = null;
        if (L.inAt) {
          tour.relAt = now; tour.relFrom = Math.max(L.piso, tour.v);
          tstat.lentos.push({ seccion: L.cfg.seccion, ms: Math.round(now - L.inAt), vPlan: Math.round(L.vPlan),
            por: L.done ? 'fin de la animación' : free ? 'tope' : 'salió de pantalla' });
        }
      } else if (tour.pos >= L.yBrake) {
        if (!L.inAt) L.inAt = now;
        // lo que falta de la animación (si aún no arranca, toda): la velocidad que la deja terminar con el bloque entero en pantalla
        var rest = (L.cfg.dura * TOUR.lentoHolgura / sp - (L.runAt ? now - L.runAt : 0)) / 1000;
        var v = Math.max(L.piso, Math.min(L.vPlan, (L.yB - tour.pos) / Math.max(0.25, rest)));
        var k = tour.pos >= L.yA ? 1 : (tour.pos - L.yBrake) / Math.max(1, L.yA - L.yBrake);
        k = k * k * (3 - 2 * k); // smoothstep sobre la posición: entra frenando sin escalón
        slow = base + (v - base) * k;
        tstat.lento = { en: true, seccion: L.cfg.seccion, v: Math.round(v), plan: Math.round(L.vPlan), corre: !!L.runAt };
      }
    }
    var easing = slow >= 0 || tour.relAt;
    // pausa corta al entrar cada sección; dentro de un tramo lento no (ahí el movimiento sigue, más lento)
    tour.secs.forEach(function (s) { if (!s.passed && s.top <= line) { s.passed = true; if (!easing) tour.holdUntil = now + TOUR.pausaSeccion; } });
    var target = now < tour.holdUntil ? 0 : base;
    if (eng.crowded()) target *= TOUR.obra;
    var left = tour.max - tour.pos, brake = vh * TOUR.frenado;
    if (left < brake) target = Math.min(target, base * Math.max(0.15, left / brake));
    if (slow >= 0) target = Math.max(L.piso, Math.min(target, slow));
    if (tour.relAt) { // reaceleración al soltar un tramo lento: de la velocidad lenta a la base, sin pasar por 0
      var q = (now - tour.relAt) / TOUR.aceleraLento;
      if (q >= 1) tour.relAt = 0;
      else target = Math.max(tour.relFrom, Math.min(target, tour.relFrom + (base - tour.relFrom) * q * q * (3 - 2 * q)));
    }
    tour.v += (target - tour.v) * (1 - Math.exp(-dt / TOUR.suavizado));
    tour.pos = Math.min(tour.max, tour.pos + tour.v * dt / 1000);
    scrollToY(tour.pos);
    tour.expected = window.scrollY;
    if (tour.pos >= tour.max - 0.5) {
      tour.reached = true; tstat.reached = now;
      eng.poke(); // lo que queda abajo se construye ya
      maybeFinish();
      return;
    }
    next();
  }

  /* ====================================================================================================
     MOTOR: una corrida del efecto (la carga, o cada «Replay tour»). Estado propio; se detiene con stop().
     ==================================================================================================== */
  function Engine(opts) {
    var H = hooks;
    var COLOR = {
      'Cortex': '--ag-cortex', 'PO': '--ag-po', 'TL': '--ag-tl', 'Dev 3': '--ag-dev3', 'Dev 8': '--ag-dev8',
      'verif-5': '--ag-verif5', 'verif-8': '--ag-verif8', 'Marketing': '--ag-mkt'
    };
    var MINI_COLORS = ['--ag-tl', '--ag-dev3', '--ag-verif5', '--ag-dev8', '--ag-po', '--ag-verif8', '--ag-mkt', '--ag-cortex'];
    var ARROW = '<svg viewBox="0 0 18 18"><path d="M2 1.5l13 6.2-5.6 1.6-2.3 5.4z"/></svg>';
    var IBEAM = '<svg viewBox="0 0 18 22"><path d="M5 2h8M9 2v18M5 20h8"/></svg>';

    var mobile = window.innerWidth < 768, MAX = mobile ? 3 : 8, MAX_MINI = mobile ? 3 : 8, COLA_MAX = mobile ? 3 : RITMO.colaMax;
    var lastY = window.scrollY, lastT = performance.now(), rushUntil = 0, nextStart = 0, poll = 0;
    var units = [], cursors = [], minis = [], waiting = [], tweens = [], intro = [];
    var loop = 0, sraf = 0, rraf = 0, stopped = false, scanning = false, introLeft = 0, introDone = false;
    var begun = false, introQueued = false, isArrival = false, orb = null;
    var io = null, ro = null, planLayer = null, curLayer = null, hudIdle = 0;
    var uid = 0, lastSpawn = 0, total = 0, shown = 0, verified = 0, finished = false;
    var stat = window.__swarm = { start: performance.now(), t0: null, end: null, skipped: false, arrival: false,
      built: 0, instant: 0, verified: 0, maxCursors: 0, maxMinis: 0, maxAgents: 0, frames: 0, replay: !!opts.replay };

    var api = {
      dead: function () { return stopped; },
      arrival: function () { return isArrival; },
      hasIntro: function () { return intro.length > 0; },
      introDone: function () { return introDone; },
      crowded: function () { return busyCount() >= COLA_MAX; },
      begin: function (d) { safe(function () { begin(d); }); },
      orbitStart: function () { safe(orbitStart); },
      orbitStop: function () { safe(orbitStop); },
      poke: function () { safe(scan); },
      stop: function (why) { cancelAll(why || 'skip'); }
    };
    try { init(); } catch (e) { fail(e); }
    return api;

    function safe(fn) { try { fn(); } catch (e) { fail(e); } }
    function fail(e) { stat.error = String(e && e.stack || e); cancelAll('error'); } // cualquier error: todo visible
    function colorOf(n) { return 'var(' + (COLOR[n] || '--cyan') + ')'; }
    function isText(n) { return n === 'PO' || n === 'Marketing' || n === 'Cortex'; }
    function easeIO(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
    function easeTravel(p) { return 1 - Math.pow(1 - p, 2.4); } // ≈70 % del trayecto en el primer 40 % del tiempo
    function easeDrag(p) { return 1 - Math.pow(1 - p, 1.6); }   // casi lineal con frenado al final
    function clampX(x) { return Math.max(6, Math.min(window.innerWidth - 120, x)); }
    function clampY(y) { return Math.max(6, Math.min(window.innerHeight - 34, y)); }
    function rand(a, b) { return a + Math.random() * (b - a); }
    function T(u, k) { return (!u.intro || u.quick) && k in RITMO_BAJANDO ? RITMO_BAJANDO[k] : RITMO[k]; } // ritmo de la unidad (las piezas del hero, salvo el retrato, usan el corto: la intro no pasa de 3,5 s)
    function working(u) { return u.state !== 'pending' && u.state !== 'plan' && u.state !== 'done'; }
    function busyCount() { var n = 0; units.forEach(function (u) { if (working(u)) n++; }); return n; }
    function lineY(u, r) {
      var h = window.innerHeight, y = h * lineaFrac(r.height, h, mobile);
      // la unidad que no puede subir hasta ahí (final de la página) se construye al llegar a su posición final
      var finalTop = r.top + window.scrollY - (document.documentElement.scrollHeight - h);
      return finalTop > y - 1 ? finalTop + 2 : y;
    }
    function byTop(a, b) { return a.el.getBoundingClientRect().top - b.el.getBoundingClientRect().top; }
    // Las unidades con data-order (piezas del hero) se arman en ese orden, en los mismos puestos que ocupaban por posición
    function introOrder(list) {
      var slots = [], ord = [];
      list.forEach(function (u, i) { if (u.el.hasAttribute('data-order')) { slots.push(i); ord.push(u); } });
      ord.sort(function (a, b) { return a.el.getAttribute('data-order') - b.el.getAttribute('data-order'); });
      slots.forEach(function (s, k) { list[s] = ord[k]; });
      return list;
    }
    function blocked(u) { return !!u.after && u.after.some(function (p) { return p.state !== 'done'; }); }
    // ¿lista para construirse? la que va detrás de otra en su secuencia: en cuanto la anterior quedó armada; el resto: al cruzar su línea
    function ready(u, r) { return u.after ? !blocked(u) : r.top < lineY(u, r); }
    function seqEnd(el) { // la secuencia quedó armada entera (o Skip): el Tour suelta su tramo lento
      if (!el || !(el.classList.contains('mo-pre') || el.classList.contains('mo-run'))) return;
      el.classList.remove('mo-pre', 'mo-run');
      try { el.dispatchEvent(new CustomEvent('motion:done')); } catch (e) {}
    }
    function kickNext(u) { // la anterior quedó armada: la siguiente de la secuencia entra si está a la vista
      if (!u.seq) return;
      if (units.every(function (n) { return n.seq !== u.seq || n.state === 'done'; })) seqEnd(u.seq);
      if (stopped) return;
      units.forEach(function (n) {
        if (n.after && n.after.indexOf(u) >= 0 && !blocked(n) && (n.state === 'plan' || n.state === 'pending') && inView(n)) {
          if (n.state === 'pending') enterPlan(n, n.el.getBoundingClientRect()); else queue(n);
        }
      });
    }
    function inView(u) { var r = u.el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; }
    function layer(cls) {
      var d = document.createElement('div');
      d.className = cls;
      d.setAttribute('aria-hidden', 'true');
      document.body.appendChild(d);
      return d;
    }

    function init() {
      // Unidades: cada [data-build], y cada hijo de un [data-build-items] (filas repetidas: pasos, trayectoria, skills, enlaces)
      var list = [];
      Array.prototype.forEach.call(document.querySelectorAll('[data-build],[data-build-items]'), function (el) {
        if (el.hasAttribute('data-build-items')) {
          var by = (el.getAttribute('data-by') || 'Dev 3').split(',');
          Array.prototype.forEach.call(el.children, function (ch, i) { list.push({ el: ch, by: by[i % by.length], group: el, orderEl: el }); });
        } else list.push({ el: el, by: el.getAttribute('data-by') || 'Dev 3', verify: el.getAttribute('data-verify') });
      });
      total = list.length;

      var vh = window.innerHeight, y0 = window.scrollY, hashEl = null;
      // Llegada a mitad de página (ancla o scroll restaurado): lo de arriba y lo que está en pantalla queda armado, sin etapa ni intro
      if (!opts.replay) try { hashEl = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null; } catch (e) {}
      var limit = y0 + vh;
      if (hashEl) limit = Math.max(limit, hashEl.getBoundingClientRect().top + y0 + vh);
      var mid = !opts.replay && (y0 > 40 || limit > y0 + vh);
      isArrival = stat.arrival = mid;

      planLayer = layer('plan-layer');
      curLayer = layer('swarm-layer');
      root.classList.remove('rebuilt');
      list.forEach(function (d) {
        d.el.classList.remove('sw-pending', 'sw-wait'); d.el.removeAttribute('data-built'); d.el.style.clipPath = ''; d.el.style.opacity = '';
        var r = d.el.getBoundingClientRect();
        if (!r.width && !r.height) { shown++; return; } // oculta en este ancho (p. ej. tarjetas solo de escritorio): no es obra
        if (mid && r.top + y0 < limit) { shown++; return; }
        var u = { el: d.el, id: ++uid, by: d.by, verify: d.verify || null, group: d.group || null, state: 'pending' };
        u.main = !!u.verify;
        u.order = +((d.orderEl || d.el).getAttribute('data-order') || 0);
        u.seq = u.order > 0 ? (d.orderEl || d.el).parentNode.closest('[data-seq]') : null; // secuencia propia (póster), no la del hero
        u.quick = u.order > 0 && u.order !== 2; // el retrato (verificado) conserva el ritmo largo
        u.text = isText(u.by);
        u.drawer = u.text ? u.by : d.el.getAttribute('data-drawer') || 'TL'; // el TL arrastra los marcos de interfaz; quien escribe un texto abre su propia caja; data-drawer: otro dibujante en paralelo
        var area = r.width * r.height;
        u.size = u.group || area < 60000 ? 'small' : u.main ? 'big' : 'mid';
        d.el._u = u;
        d.el.classList.add('sw-pending', 'sw-wait'); // sw-wait: hasta el enganche «built» (motion.js prepara aquí su estado inicial)
        units.push(u);
        if (!mid && r.top < vh && r.bottom > 0) { u.intro = true; intro.push(u); }
      });
      introLeft = intro.length;
      scanning = intro.length > 0;
      // piezas del hero con data-order: cada una revela su contenido después de la anterior
      intro.forEach(function (u) { if (u.order > 1) intro.forEach(function (p) { if (p.order === u.order - 1) u.prev = p; }); });
      // secuencias al bajar (data-seq): cada unidad espera a TODAS las del paso anterior presente (las ocultas en este ancho no cuentan)
      units.forEach(function (u) {
        if (!u.seq || u.intro) return;
        var best = 0;
        units.forEach(function (p) { if (p.seq === u.seq && !p.intro && p.order < u.order && p.order > best) best = p.order; });
        if (best) u.after = units.filter(function (p) { return p.seq === u.seq && !p.intro && p.order === best; });
      });
      // el contenedor de la secuencia avisa al Tour (tramo lento): «mo-pre» mientras espera, «mo-run» al empezar, «motion:done» al final
      units.forEach(function (u) { if (u.seq && !u.intro) u.seq.classList.add('mo-pre'); });
      root.classList.add('sw-ready'); // las unidades ya están marcadas: el CSS puede encadenar lo que depende de ellas
      hudUpdate();
      // Enganche para motion.js: las unidades pendientes ya llevan sw-wait
      try { document.dispatchEvent(new CustomEvent('swarm:init', { detail: { replay: !!opts.replay } })); } catch (e) {}

      io = new IntersectionObserver(function (es) {
        safe(function () {
          if (es.some(function (e) { return e.isIntersecting; })) scan(); // entra al viewport: plano, o construcción si ya cruzó la línea
        });
      }, { rootMargin: '0px' });
      units.forEach(function (u) { if (!u.intro) io.observe(u.el); });
      window.addEventListener('scroll', onScroll, { passive: true });
      // red: si el navegador frena los eventos de scroll (ventana tapada), un sondeo liviano los reemplaza
      poll = setInterval(function () { if (window.scrollY !== lastY) onScroll(); }, 100);
      window.addEventListener('resize', onResize, { passive: true });
      if ('ResizeObserver' in window) { ro = new ResizeObserver(onResize); ro.observe(document.body); }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

      // Scroll restaurado al terminar de cargar (el navegador lo aplica tarde): si saltó sin que el lector tocara nada, es una llegada
      var touched = false;
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (t) {
        window.addEventListener(t, function () { touched = true; }, { passive: true, once: true });
      });
      function onLoad() {
        requestAnimationFrame(function () {
          safe(function () {
            if (stopped) return;
            onResize();
            if (opts.replay || touched || Math.abs(window.scrollY - y0) < window.innerHeight * 0.5) return;
            isArrival = stat.arrival = true;
            begun = introQueued = true; scanning = false;
            var h = window.innerHeight;
            units.forEach(function (u) { if (u.state !== 'done' && u.el.getBoundingClientRect().top < h) instant(u, true); });
            H.arrive();
            scan();
          });
        });
      }
      if (document.readyState === 'complete') onLoad(); else window.addEventListener('load', onLoad);
      // Vuelta desde la caché de atrás/adelante: no se repite nada, todo armado (lo maneja la barra con skipAll)
    }
    // Arranque de la obra: Tour, Enter, llegada o repetición. d = espera antes del primer marco.
    function begin(d) {
      if (begun || stopped) return;
      begun = true;
      stat.t0 = performance.now();
      if (!intro.length) { introQueued = true; finishIntro(false); hudUpdate(); scan(); tidy(); return; }
      scanning = true;
      hudShow();
      hudUpdate();
      spawnMinis();
      setTimeout(function () {
        safe(function () {
          if (stopped) return;
          scanning = false;
          introQueued = true;
          hudUpdate();
          introOrder(intro.sort(byTop)).forEach(queue);
        });
      }, d);
    }

    /* ---------- Etapa: bandada en órbita alrededor del centro ---------- */
    function orbitStart() {
      if (stopped || orb) return;
      var names = mobile ? ['TL', 'Dev 3', 'PO', 'Dev 8', 'verif-5'] : ['TL', 'Dev 3', 'PO', 'verif-5', 'Dev 8', 'Cortex', 'Marketing', 'verif-8'];
      var half = Math.ceil(names.length / 2), RO = INICIO.orbitaRadios, RM = [-44, 48, -12, 34];
      orb = { t: 0, last: performance.now(), raf: 0, list: [], n: names.length };
      curLayer.classList.add('swarm-layer--in');
      orb.mark = document.createElement('span');
      orb.mark.className = 'sw-mark';
      orb.mark.textContent = 'AG';
      orb.mark.style.left = orbitGeo().cx + 'px';
      curLayer.appendChild(orb.mark);
      names.forEach(function (n, i) {
        var g = i < half ? 0 : 1, k = g ? i - half : i, c = makeCursor(n);
        c.orbit = { g: g, a: k, r: RO[k % RO.length], ph: rand(0, 6.3) }; // a: puesto en la bandada (× paso)
        orb.list.push(c);
      });
      for (var j = 0; j < MAX_MINI; j++) {
        var m = makeMini(), k = Math.floor(j / 2);
        m.orbit = { g: j % 2, a: k + 0.5, r: RM[k % RM.length], ph: rand(0, 6.3) };
        orb.list.push(m);
      }
      orbitPaint();
      hudUpdate();
      orbNext();
    }
    function orbNext() { // cuadro o, con la ventana tapada, temporizador corto; con la pestaña oculta, nada (la órbita se pausa)
      var o = orb, ran = false, run = function () { if (ran) return; ran = true; clearTimeout(o.tm); orbitFrame(performance.now()); };
      o.raf = requestAnimationFrame(run);
      if (!document.hidden) o.tm = setTimeout(run, 40);
    }
    function orbitFrame(now) {
      if (!orb || stopped) return;
      var dt = Math.min(50, Math.max(0, now - orb.last)); // pestaña oculta: no salta al volver
      orb.last = now;
      // la bandada sigue en órbita a velocidad constante mientras la etapa esté visible (orbitStop o cancelAll la cortan)
      orb.t += dt;
      safe(orbitPaint);
      if (orb) orbNext();
    }
    // Órbita: elipse centrada un poco a la izquierda (la etiqueta va a la derecha de la flecha); en móvil, alta y angosta
    function orbitGeo() {
      var w = window.innerWidth, h = window.innerHeight, g = { cy: h * 0.44 };
      if (mobile) { g.cx = (w - 84) / 2; g.rx = Math.max(60, g.cx - 44); g.ry = Math.min(h * 0.24, 210); g.k = 0.6; }
      else { g.cx = w / 2 - 40; g.rx = g.ry = Math.min(w * 0.3, h * 0.3); g.k = 1; }
      // la bandada no baja hasta la invitación (botón del Tour): en pantallas bajas se achica y, si hace falta, sube
      var inv = document.querySelector('.swarm-invite');
      if (inv) {
        var lim = inv.getBoundingClientRect().top - 12 - 44 - 40 * g.k; // entrada animada + flecha y etiqueta + desfase radial
        if (g.cy + g.ry > lim) {
          var r = Math.max(90, lim - g.cy);
          if (g.cy + r > lim) g.cy = Math.max(r * 0.6 + 44, lim - r);
          g.ry = r; // solo se aplana en vertical: el ancho se mantiene y los cursores no se enciman
        }
      }
      return g;
    }
    function orbitPaint() {
      var g = orbitGeo(), base = orb.t / INICIO.orbita * Math.PI * 2;
      if (orb.mark) orb.mark.style.top = g.cy + 'px';
      // paso entre cursores: el fijo, o más si el radio es chico (≥ orbitaArco px de arco), sin pasar del reparto parejo
      var step = Math.min(Math.PI * 2 / orb.n * 0.92, Math.max(INICIO.orbitaPaso * (mobile ? 1.6 : 1), INICIO.orbitaArco / Math.max(g.rx, g.ry)));
      orb.list.forEach(function (it) {
        var o = it.orbit, th = base + o.g * Math.PI - o.a * step, dr = (o.r + 6 * Math.sin(orb.t / 900 + o.ph)) * g.k;
        var x = g.cx + Math.cos(th) * (g.rx + dr), y = g.cy + Math.sin(th) * (g.ry + dr);
        if (it.lab) { x = clampX(x); y = clampY(y); }
        it.x = x; it.y = y; paint(it);
      });
    }
    function orbitStop() { // la bandada se suelta: los que tienen obra vuelan a ella, el resto sale por el borde
      if (!orb) return;
      cancelAnimationFrame(orb.raf); clearTimeout(orb.tm);
      if (orb.mark) orb.mark.remove();
      if (curLayer) curLayer.classList.remove('swarm-layer--in');
      var list = orb.list;
      orb = null;
      list.forEach(function (it) {
        it.orbit = null;
        if (it.lab) { // cursor con nombre: queda libre; si nadie le da obra, se va
          it.idle = true;
          it.wait = setTimeout(function () { safe(function () { if (it.idle && !it.jobs.length) leave(it); }); }, RITMO.ocioso + RITMO.estallido + 400);
        } else miniStep(it);
      });
    }

    /* ---------- Barra: el motor solo informa ---------- */
    function hudShow() {
      if (stopped || finished) return;
      H.activity();
      clearTimeout(hudIdle);
      if (introDone) {
        hudIdle = setTimeout(function () {
          if (stopped || finished) return;
          if (!units.some(working)) H.idle(); else hudShow();
        }, RITMO.hudReposo);
      }
    }
    function hudUpdate() {
      if (stopped) return;
      var agents = cursors.length + minis.length;
      stat.maxAgents = Math.max(stat.maxAgents, agents);
      H.progress({ scanning: scanning, agents: agents, shown: shown, total: total, verified: verified });
    }

    /* ---------- Marco de selección (overlay en una capa sobre la página; nunca toca el layout) ---------- */
    function box(u) {
      var r = u.el.getBoundingClientRect(), b = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
      if (u.el.getAttribute('data-plan') === 'content') { // secciones con aire propio: el marco va al contenido
        var cs = getComputedStyle(u.el);
        b.left += parseFloat(cs.paddingLeft); b.right -= parseFloat(cs.paddingRight);
        b.top += parseFloat(cs.paddingTop); b.bottom -= parseFloat(cs.paddingBottom);
      }
      b.width = Math.max(2, b.right - b.left); b.height = Math.max(2, b.bottom - b.top);
      return b;
    }
    function makeFrame(u) {
      var f = { el: document.createElement('div') };
      f.el.className = 'fr';
      f.el.innerHTML = '<div class="fr__ph"></div><i class="fr__e fr__e--t"></i><i class="fr__e fr__e--l"></i>' +
        '<i class="fr__e fr__e--r"></i><i class="fr__e fr__e--b"></i><b class="fr__h"></b><b class="fr__h"></b>' +
        '<b class="fr__h"></b><b class="fr__h"></b><span class="fr__tag"></span>';
      f.ph = f.el.querySelector('.fr__ph');
      f.t = f.el.querySelector('.fr__e--t'); f.l = f.el.querySelector('.fr__e--l');
      f.r = f.el.querySelector('.fr__e--r'); f.b = f.el.querySelector('.fr__e--b');
      f.hs = f.el.querySelectorAll('.fr__h');
      f.tag = f.el.querySelector('.fr__tag');
      u.fr = f;
      planLayer.appendChild(f.el);
      placeFrame(u);
      setDrag(f, 0, 0);
      stat.frames++;
      return f;
    }
    function placeFrame(u) {
      var f = u.fr;
      if (!f) return;
      var b = box(u), r = u.el.getBoundingClientRect();
      f.w = b.width; f.h = b.height;
      f.el.style.width = f.w + 'px'; f.el.style.height = f.h + 'px';
      f.el.style.transform = 'translate(' + (b.left + window.scrollX) + 'px,' + (b.top + window.scrollY) + 'px)';
      behind(u, f, b);
      // relleno provisional: barras por línea para texto, bloque plano para interfaz
      f.ph.innerHTML = '';
      f.bars = [];
      if (u.text) {
        rawLines(u.el).forEach(function (l) {
          var bar = document.createElement('i'), lh = l.bottom - l.top;
          bar.className = 'fr__bar';
          bar._x = r.left + l.left - b.left;
          bar._w = Math.max(8, l.right - l.left);
          bar.style.width = bar._w + 'px';
          bar.style.height = Math.max(4, lh * 0.56) + 'px';
          bar.style.transform = 'translate(' + bar._x + 'px,' + (r.top + l.top - b.top + lh * 0.22) + 'px)';
          f.ph.appendChild(bar);
          f.bars.push(bar);
        });
      }
      if (!f.bars.length) f.ph.classList.add('fr__ph--flat');
      if (f.drag) setDrag(f, f.drag[0], f.drag[1]);
    }
    // data-behind: el marco pasa por detrás de otro elemento (recorte con un hueco donde está), para no tapar su texto
    function behind(u, f, b) {
      var sel = u.el.getAttribute('data-behind'), o = sel && (u.seq || document).querySelector(sel);
      f.el.classList.toggle('fr--behind', !!o);
      if (!o) { f.el.style.clipPath = ''; return; }
      var q = o.getBoundingClientRect(), m = 6, P = 60;
      var x0 = q.left - b.left - m, y0 = q.top - b.top - m, x1 = q.right - b.left + m, y1 = q.bottom - b.top + m;
      f.el.style.clipPath = 'polygon(evenodd,' + -P + 'px ' + -P + 'px,' + (f.w + P) + 'px ' + -P + 'px,' + (f.w + P) + 'px ' + (f.h + P) + 'px,' + -P + 'px ' + (f.h + P) + 'px,' + -P + 'px ' + -P + 'px,' +
        x0 + 'px ' + y0 + 'px,' + x1 + 'px ' + y0 + 'px,' + x1 + 'px ' + y1 + 'px,' + x0 + 'px ' + y1 + 'px,' + x0 + 'px ' + y0 + 'px)';
    }
    function setDrag(f, px, py) {
      var w = f.w * px, h = f.h * py;
      f.drag = [px, py];
      f.t.style.transform = 'scaleX(' + px + ')';
      f.l.style.transform = 'scaleY(' + py + ')';
      f.r.style.transform = 'translateX(' + Math.max(0, w - 1) + 'px) scaleY(' + py + ')';
      f.b.style.transform = 'translateY(' + Math.max(0, h - 1) + 'px) scaleX(' + px + ')';
      var pts = [[0, 0], [w, 0], [0, h], [w, h]];
      for (var i = 0; i < 4; i++) f.hs[i].style.transform = 'translate(' + (pts[i][0] - 3.5) + 'px,' + (pts[i][1] - 3.5) + 'px)';
      if (!f.keepPh) f.ph.style.clipPath = 'inset(0 ' + (f.w - w) + 'px ' + (f.h - h) + 'px 0)';
    }
    function dropFrame(u) { // la suelta es un corte seco: marco, tiradores y etiqueta se van en un cuadro
      var f = u.fr;
      if (!f) return;
      u.fr = null;
      f.el.remove();
    }
    function guides(on, b) { // guías finas alineadas a los bordes mientras se arrastra
      if (!curLayer) return;
      if (!guides.h) {
        guides.h = document.createElement('i'); guides.h.className = 'guide guide--h';
        guides.v = document.createElement('i'); guides.v.className = 'guide guide--v';
        curLayer.appendChild(guides.h); curLayer.appendChild(guides.v);
      }
      guides.h.classList.toggle('is-on', on);
      guides.v.classList.toggle('is-on', on);
      if (b) {
        guides.h.style.transform = 'translateY(' + b.top + 'px)';
        guides.v.style.transform = 'translateX(' + b.left + 'px)';
      }
    }

    /* ---------- Cola: marco (TL o PO) → contenido (Dev, PO, Marketing o Cortex) → verificación (unidades principales) ---------- */
    function queue(u) {
      if (stopped || !u || (u.state !== 'pending' && u.state !== 'plan')) return;
      if (blocked(u)) return; // su anterior en la secuencia aún no queda armada: sigue en plano
      clearTimeout(u.planT); u.planT = 0;
      if (!u.intro) {
        // Al bajar: con prisa (salto, scroll rápido o demasiada obra a la vez) la unidad entra directa
        // (las de una secuencia no cuentan la obra ajena: van de a un paso y su fila entra completa)
        if (performance.now() < rushUntil || (!u.seq && busyCount() >= COLA_MAX)) { direct(u); return; }
        // plazo duro propio: a RITMO.plazo de entrar, su contenido está entero aunque el teatro no haya terminado
        u.hard = setTimeout(function () { safe(function () { if (!u.shown) instant(u); }); }, RITMO.plazo);
      }
      u.state = 'queued';
      if (u.seq && u.seq.classList.contains('mo-pre')) { u.seq.classList.remove('mo-pre'); u.seq.classList.add('mo-run'); }
      trace(u, 's');
      if (io) io.unobserve(u.el);
      u.safety = setTimeout(function () { safe(function () { instant(u); }); }, RITMO.redCola);
      spawnMinis();
      hudShow();
      var now = performance.now();
      if (u.group) { // filas: los marcos vacíos aparecen en ráfaga, sin cursor; luego se llenan en cascada
        var g = u.group, d = Math.max(0, (g._next || 0) - now);
        g._next = now + d + T(u, 'marcoRafaga');
        setTimeout(function () { safe(function () { if (u.state === 'queued') drawFrame(null, u, function () {}); }); }, d);
      } else if (!u.intro) { // las que entran juntas se arman en paralelo, con escalonado corto
        var s = Math.max(0, nextStart - now);
        nextStart = now + s + RITMO.escalon;
        setTimeout(function () { safe(function () { if (u.state === 'queued') addJob(u, 'frame', u.drawer); }); }, s);
      } else addJob(u, 'frame', u.drawer);
    }
    // PLANO: al asomar, marco punteado y relleno provisional tenue; el contenido sigue recortado
    function enterPlan(u, r) {
      u.state = 'plan';
      var f = makeFrame(u);
      f.el.classList.add('fr--plan');
      f.keepPh = true;
      setDrag(f, 1, 1);
      // ya en su línea (p. ej. la página no tiene más scroll y quedó a la vista): se construye
      if (ready(u, r)) { queue(u); return; }
      armPlan(u);
    }
    function armPlan(u) { // si el lector se detiene, la unidad en plano no espera la línea para siempre
      if (u.planT) return;
      // solo cuenta la quietud real: si la página se movió hace menos de planoEspera (lector o Tour bajando), espera más
      var still = performance.now() - lastT;
      u.planT = setTimeout(function () {
        safe(function () {
          u.planT = 0;
          if (u.state !== 'plan') return;
          if (performance.now() - lastT < RITMO.planoEspera - 20) { armPlan(u); return; }
          if (inView(u)) queue(u);
        });
      }, Math.max(60, RITMO.planoEspera - Math.min(still, RITMO.planoEspera)));
    }
    // Revelado directo: fundido corto, sin marco ni cursor
    function direct(u) {
      clearTimeout(u.planT); u.planT = 0;
      dropFrame(u);
      trace(u, 'd');
      u.state = 'direct';
      if (io) io.unobserve(u.el);
      u.el.classList.remove('sw-pending');
      u.el.style.clipPath = '';
      u.el.style.opacity = '0';
      u.safety = setTimeout(function () { safe(function () { instant(u); }); }, RITMO.directo + 250);
      tween(null, RITMO.directo, function (p) {
        if (u.state !== 'direct') return true;
        u.el.style.opacity = String(p);
      }, function () { if (u.state === 'direct') instant(u); });
    }
    function addJob(u, phase, name) {
      var job = { u: u, phase: phase, name: name };
      if (assign(job)) return;
      if (phase === 'frame') drawFrame(null, u, function () {});  // sin cupo: el marco se arrastra solo
      else if (phase === 'check') check(null, u, function () {});  // sin cupo: se verifica sin cursor
      else if (!u.intro) fill(null, u, function () {});           // al bajar: nadie espera turno, se arma sin cursor
      else waiting.push(job);
    }
    function assign(job) {
      var c = null;
      cursors.forEach(function (k) { if (!c && k.name === job.name && !k.gone && !k.orbit) c = k; });
      // al bajar, un cursor ocupado no acumula cola: la unidad se arma en paralelo sin él
      if (c && !job.u.intro && (!c.idle || c.jobs.length) && !c.leaving) return false;
      if (!c && cursors.length < MAX) c = spawn(job.name, startPoint(job));
      if (!c) return false;
      c.jobs.push(job);
      if (c.leaving) { c.leaving = false; c.idle = true; } // vuelve antes de salir
      if (c.idle) {
        clearTimeout(c.wait);
        c.idle = false;
        var d = c.fresh ? Math.max(0, c.fresh - performance.now()) : 0;
        c.fresh = 0;
        if (d) setTimeout(function () { safe(function () { work(c); }); }, d); else work(c);
      }
      return true;
    }
    function drain() {
      var list = waiting.splice(0, waiting.length);
      list.forEach(function (job) { if (job.u.state === 'framed' && !assign(job)) waiting.push(job); });
    }
    function startPoint(job) {
      var b = box(job.u);
      if (job.phase === 'check') return { x: b.right - 8, y: b.top + 8 };                // verificador: esquina superior derecha
      if (job.phase === 'fill' && !job.u.text) return b.height > window.innerHeight * 0.5 ? { x: b.right - 6, y: b.top + 6 } : { x: b.right - 6, y: b.bottom - 6 }; // interfaz: el tirador inferior derecho (arriba en las altas)
      return { x: b.left, y: b.top };
    }

    /* ---------- Cursores con nombre ---------- */
    function makeCursor(name) {
      var el = document.createElement('div');
      el.className = 'cur';
      el.style.setProperty('--a', colorOf(name));
      el.innerHTML = ARROW + '<span></span>';
      var c = { el: el, lab: el.querySelector('span'), name: name, jobs: [], idle: true, leaving: false, gone: false, mode: 'arrow', tw: null, x: -60, y: -60 };
      label(c, '');
      curLayer.appendChild(el);
      cursors.push(c);
      stat.maxCursors = Math.max(stat.maxCursors, cursors.length);
      return c;
    }
    function spawn(name, p) {
      var c = makeCursor(name);
      var q = edgePoint({ x: clampX(p.x), y: clampY(p.y) });
      c.x = q.x; c.y = q.y;
      paint(c);
      var now = performance.now();
      if (now < lastSpawn + RITMO.entreSalidas) c.fresh = lastSpawn + RITMO.entreSalidas;
      lastSpawn = Math.max(now, c.fresh || 0);
      hudUpdate();
      return c;
    }
    function label(c, verb) { c.lab.textContent = verb ? c.name + ' · ' + verb : c.name; }
    function paint(c) { c.el.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px)'; }
    function setMode(c, text) { // flecha para marcos e interfaz; barra de texto para escribir
      var m = text ? 'text' : 'arrow';
      if (c.mode === m) return;
      c.mode = m;
      c.el.classList.toggle('cur--text', text);
      c.el.removeChild(c.el.firstChild);
      c.el.insertAdjacentHTML('afterbegin', text ? IBEAM : ARROW);
    }
    function edgePoint(p) { // el punto fuera de pantalla más cercano: los cursores nunca aparecen en el aire
      var w = window.innerWidth, h = window.innerHeight, d = [p.x, w - p.x, p.y, h - p.y], m = Math.min.apply(null, d);
      if (m === d[0]) return { x: -60, y: p.y };
      if (m === d[1]) return { x: w + 24, y: p.y };
      if (m === d[2]) return { x: p.x, y: -50 };
      return { x: p.x, y: h + 24 };
    }
    function work(c) {
      if (stopped || c.gone) return;
      var job = c.jobs.shift();
      if (!job) {
        c.idle = true;
        c.wait = setTimeout(function () { safe(function () { if (c.idle && !c.jobs.length) leave(c); }); }, RITMO.ocioso);
        return;
      }
      c.idle = false;
      var u = job.u, need = job.phase === 'frame' ? 'queued' : job.phase === 'fill' ? 'framed' : 'checking';
      if (u.state !== need) { work(c); return; }
      if (job.phase !== 'check') {
        var b = box(u);
        if (b.bottom <= 0 || b.top >= window.innerHeight) { instant(u); work(c); return; } // salió de vista: armada sin esperar
      }
      var text = job.phase === 'fill' && u.text;
      setMode(c, text);
      label(c, job.phase === 'frame' ? S.verbo.frame : job.phase === 'check' ? S.verbo.check : u.by === 'Cortex' ? S.verbo.save : text ? S.verbo.write : S.verbo.build);
      var next = function () { work(c); };
      var tdur = u.group ? T(u, 'viajeFila') : u.intro ? 0 : T(u, 'viaje');
      travel(c, function () { return startPoint(job); }, tdur, function () {
        safe(function () {
          if (job.phase === 'frame') drawFrame(c, u, next);
          else if (job.phase === 'fill') fill(c, u, next);
          else check(c, u, next);
        });
      });
    }
    function leave(c) {
      if (stopped || c.leaving || c.gone || c.orbit) return;
      c.leaving = true; c.idle = true;
      var sx = c.x, sy = c.y, q = edgePoint({ x: c.x, y: c.y });
      tween(c, RITMO.salida, function (p) {
        var e = easeIO(p);
        c.x = sx + (q.x - sx) * e; c.y = sy + (q.y - sy) * e; paint(c);
      }, function () {
        if (!c.leaving) return;
        c.gone = true;
        c.el.remove();
        cursors.splice(cursors.indexOf(c), 1);
        hudUpdate();
        drain();
        tidy();
      });
    }
    function travel(c, target, fixed, done) {
      var sx = c.x, sy = c.y, t = target(), d = Math.sqrt(Math.pow(clampX(t.x) - sx, 2) + Math.pow(clampY(t.y) - sy, 2));
      var dur = fixed || (d > 700 ? RITMO.viajeLargo : RITMO.viaje);
      tween(c, dur, function (p) {
        var e = easeTravel(p), q = target();
        c.x = sx + (clampX(q.x) - sx) * e; c.y = sy + (clampY(q.y) - sy) * e; paint(c);
      }, done);
    }

    /* ---------- Enjambre: cursores chicos sin nombre que siempre vienen de otra obra ---------- */
    function spawnMinis() {
      var n = MAX_MINI - minis.length;
      for (var i = 0; i < n; i++) (function (k) {
        setTimeout(function () { safe(function () { if (!stopped && minis.length < MAX_MINI) mini(); }); }, k * 60);
      })(i);
    }
    function makeMini() {
      var m = { el: document.createElement('div'), tw: null, leaving: false, x: -60, y: -60 };
      m.el.className = 'mini';
      m.el.style.setProperty('--a', 'var(' + MINI_COLORS[(minis.length + uid) % MINI_COLORS.length] + ')');
      m.el.innerHTML = ARROW;
      curLayer.appendChild(m.el);
      minis.push(m);
      stat.maxMinis = Math.max(stat.maxMinis, minis.length);
      return m;
    }
    function mini() {
      var m = makeMini();
      var q = edgePoint({ x: rand(0, window.innerWidth), y: rand(0, window.innerHeight) });
      m.x = q.x; m.y = q.y;
      paint(m);
      hudUpdate();
      miniStep(m);
    }
    function miniStep(m) {
      if (stopped || m.leaving || m.orbit) return;
      var w = window.innerWidth, h = window.innerHeight, p = null;
      if (scanning) p = { x: rand(0.08, 0.92) * w, y: rand(0.08, 0.85) * h };
      else {
        var live = units.filter(function (u) { return working(u) && inView(u); });
        if (live.length) {
          var b = box(live[Math.floor(Math.random() * live.length)]);
          p = { x: b.left + Math.random() * b.width, y: b.top + Math.random() * Math.min(b.height, h) };
        }
      }
      if (!p) { // sin obra a la vista: sale por el borde
        m.leaving = true;
        var sx = m.x, sy = m.y, q = edgePoint({ x: m.x, y: m.y });
        tween(m, RITMO.salida, function (t) { var e = easeIO(t); m.x = sx + (q.x - sx) * e; m.y = sy + (q.y - sy) * e; paint(m); }, function () {
          m.el.remove(); minis.splice(minis.indexOf(m), 1); hudUpdate(); tidy();
        });
        return;
      }
      var x0 = m.x, y0 = m.y;
      p.x = Math.max(4, Math.min(w - 16, p.x)); p.y = Math.max(4, Math.min(h - 16, p.y));
      tween(m, rand(RITMO.miniMin, RITMO.miniMax), function (t) {
        var e = easeTravel(t); m.x = x0 + (p.x - x0) * e; m.y = y0 + (p.y - y0) * e; paint(m);
      }, function () { miniStep(m); });
    }
    /* ---------- Pasos de cada unidad ---------- */
    // MARCO: el cursor aterriza, nacen guías y etiqueta, y arrastra el marco de esquina a esquina con el relleno provisional
    function drawFrame(c, u, done) {
      if (u.state !== 'queued') { done(); return; }
      u.state = 'framing';
      var f = u.fr || makeFrame(u);
      f.el.classList.remove('fr--plan');
      f.el.style.setProperty('--fc', colorOf(c ? c.name : u.drawer));
      f.tag.textContent = S.marco.spec;
      var dur = u.size === 'big' ? T(u, 'marcoGrande') : T(u, 'marcoChico');
      if (c) guides(true, box(u));
      tween(c, c ? T(u, 'anclaje') : 1, function () { return u.state !== 'framing'; }, function () {
        tween(c, dur, function (p) {
          if (u.state !== 'framing') return true;
          var e = easeDrag(p);
          setDrag(f, e, e);
          if (c) {
            var b = box(u);
            c.x = clampX(b.left + b.width * e); c.y = clampY(b.top + b.height * e); paint(c);
            guides(true, b);
          }
        }, function () {
          if (c) guides(false);
          if (u.state === 'framing') {
            setDrag(f, 1, 1);
            u.state = 'framed';
            u.framedAt = performance.now();
            f.tag.textContent = S.marco.spec + ' · ' + Math.round(f.w) + '×' + Math.round(f.h);
            addJob(u, 'fill', u.by);
          }
          done();
        });
      });
    }
    // CONTENIDO: tras la espera con el relleno a la vista, el contenido real entra (fundido corto en interfaz,
    // escritura por líneas con barra de texto en texto); luego el relleno se va. Etiqueta «build».
    function fill(c, u, done0) {
      var called = false, done = function () { if (!called) { called = true; done0(); } };
      if (u.state !== 'framed') { done(); return; }
      u.state = 'building';
      clearTimeout(u.safety);
      var f = u.fr || makeFrame(u);
      setDrag(f, 1, 1);
      f.el.style.setProperty('--fc', colorOf(c ? c.name : u.by));
      f.tag.textContent = S.marco.build;
      var hold = u.group ? T(u, 'esperaFila') : u.size === 'big' ? T(u, 'esperaGrande') : T(u, 'espera');
      var wait = Math.max(1, (u.framedAt || 0) + hold - performance.now());
      var lines = u.text && !u.group ? tiledLines(u.el) : []; // filas: cambio de contenido en cascada, sin teclear
      var chars = (u.el.textContent || '').replace(/\s+/g, ' ').trim().length;
      var dur = lines.length ? Math.max(T(u, 'teclearMin'), Math.min(T(u, 'teclearMax'), chars * T(u, 'teclear'))) : u.el.hasAttribute('data-draw') ? T(u, 'dibujo') : RITMO.fundido;
      u.safety = setTimeout(function () { safe(function () { instant(u); }); }, wait + dur + RITMO.redArmado);
      tween(c, wait, function () { return u.state !== 'building'; }, function () {
        if (mustWait(u)) { done(); c = null; } // esperando su turno: suelta el cursor y entra después con un fundido
        afterPrev(u, function () {
        if (u.state !== 'building') { done(); return; }
        u.contentAt = performance.now();
        // P2: la palabra gigante (data-rise, letras ya partidas por motion.js) sube desde la máscara en vez del fundido
        var rise = !lines.length && u.el.hasAttribute('data-rise') && !!u.el.querySelector('.l');
        // data-draw: el trazo se dibuja de punta a punta (pathLength=1) en vez del fundido
        var paths = !lines.length && u.el.hasAttribute('data-draw') ? u.el.querySelectorAll('path') : [];
        if (paths.length) { u.draw = true; Array.prototype.forEach.call(paths, function (q) { q.style.strokeDasharray = '1 1'; q.style.strokeDashoffset = '1'; }); }
        if (!lines.length) { u.el.classList.remove('sw-pending'); u.el.style.clipPath = ''; u.el.style.opacity = rise || paths.length ? '' : '0'; }
        if (rise) u.el.classList.add('is-rising');
        if (u.group) done(); // filas: el cursor ya salta al vecino mientras entra el contenido
        tween(u.group ? null : c, dur, function (p) {
          if (u.state !== 'building') return true;
          if (paths.length) { var o = String(1 - easeDrag(p)); Array.prototype.forEach.call(paths, function (q) { q.style.strokeDashoffset = o; }); return; }
          if (!lines.length) { if (!rise) u.el.style.opacity = String(p); return; }
          var b = box(u), r = u.el.getBoundingClientRect(), totalW = 0, acc = 0, i = 0;
          lines.forEach(function (l) { totalW += l.w; });
          var q = Math.min(1, p + 0.035 * Math.sin(p * 22)); // a ráfagas, nunca hacia atrás
          var target = Math.max(0, q) * totalW;
          while (i < lines.length - 1 && acc + lines[i].w < target) { acc += lines[i].w; i++; }
          var l = lines[i], x = Math.min(l.right, l.left + (target - acc)), W = r.width;
          u.el.style.clipPath = 'polygon(-30px -30px,' + (W + 30) + 'px -30px,' + (W + 30) + 'px ' + l.top + 'px,' + x + 'px ' + l.top + 'px,' +
            x + 'px ' + l.bottom + 'px,-30px ' + l.bottom + 'px)';
          // las barras provisionales se borran a medida que entra el texto
          var ex = r.left + x - b.left, ey = r.top + l.top - b.top;
          f.bars.forEach(function (bar) {
            var by = parseFloat(bar.style.transform.split(',')[1]);
            var cut = by + 2 < ey ? bar._w : by > r.top + l.bottom - b.top ? 0 : Math.max(0, Math.min(bar._w, ex - bar._x));
            bar.style.clipPath = 'inset(0 0 0 ' + cut + 'px)';
          });
          if (c) { c.x = clampX(r.left + x - 9); c.y = clampY(r.top + l.top + Math.max(0, (l.bottom - l.top - 22) / 2)); paint(c); }
        }, function () {
          if (u.state !== 'building') { done(); return; }
          reveal(u);
          if (c && u.by === 'Cortex') label(c, S.verbo.saved);
          // el relleno provisional se va con un fundido corto; el marco sigue un momento y se suelta de golpe
          tween(null, RITMO.fondoFuera, function (p) { f.ph.style.opacity = String(1 - p); }, function () {
            if (u.state !== 'building') return;
            if (u.main) { u.state = 'checking'; addJob(u, 'check', u.verify); }
            else { u.state = 'releasing'; later(u, u.size === 'big' ? RITMO.soltarGrande : RITMO.soltarChico); }
          });
          done();
        });
      }); });
    }
    // Orden del hero: el contenido de una pieza entra 120 ms después del de la anterior.
    // Mientras espera, su red propia se pausa (la anterior tiene la suya); tope de espera 4 s.
    function mustWait(u) { var p = u.prev; return !!p && p.state !== 'done' && !(p.contentAt && performance.now() - p.contentAt >= 120); }
    function afterPrev(u, go) {
      if (!mustWait(u)) { go(); return; }
      var t0 = performance.now();
      clearTimeout(u.safety);
      (function chk() {
        if (u.state !== 'building' || !mustWait(u) || performance.now() - t0 > 4000) {
          u.safety = setTimeout(function () { safe(function () { instant(u); }); }, RITMO.fundido + RITMO.redArmado);
          go(); return;
        }
        setTimeout(function () { safe(chk); }, 20);
      })();
    }
    // VERIFICACIÓN: el verificador llega a la esquina, el marco se pone verde con «verified», y recién ahí se suelta
    function check(c, u, done) {
      if (u.state !== 'checking') { done(); return; }
      var f = u.fr;
      u.safety = setTimeout(function () { safe(function () { if (u.state === 'checking') release(u); }); }, RITMO.verificar + RITMO.redArmado);
      // verde: se quita el color del agente que puso fill() en línea (si no, tapaba el de .fr.is-ok y el marco nunca se veía verde)
      if (f) { f.el.style.removeProperty('--fc'); f.el.classList.add('is-ok'); f.tag.textContent = S.marco.ok; }
      verified++; stat.verified++;
      hudUpdate();
      tween(c, RITMO.verificar, function (p) {
        if (c) { var b = box(u); c.x = clampX(b.right - 8 - 8 * Math.sin(p * Math.PI)); c.y = clampY(b.top + 8); paint(c); }
      }, function () {
        if (u.state === 'checking') release(u);
        done();
      });
    }
    function later(u, ms) {
      u.safety = setTimeout(function () { safe(function () { if (u.state === 'releasing') release(u); }); }, ms);
    }
    function reveal(u) {
      if (u.draw) undraw(u.el.parentNode);
      u.el.classList.remove('sw-pending');
      u.el.style.clipPath = '';
      u.el.style.opacity = '';
      if (!u.shown) { u.shown = true; shown++; stat.built++; hudUpdate(); }
    }
    function release(u) {
      clearTimeout(u.safety); clearTimeout(u.hard);
      u.state = 'done';
      dropFrame(u);
      built(u, false);
      introStep(u);
      kickNext(u);
      tidy();
    }

    function instant(u, quiet) {
      if (!u || u.state === 'done') return;
      clearTimeout(u.safety); clearTimeout(u.hard); clearTimeout(u.planT);
      if (io) io.unobserve(u.el);
      u.state = 'done';
      reveal(u);
      dropFrame(u, false);
      stat.instant++;
      built(u, quiet);
      introStep(u);
      kickNext(u);
      tidy();
    }
    // Enganche «built»: la unidad quedó armada (marco suelto). quiet = sin animar (Skip, llegada, fuera de vista).
    // Traza liviana para medir dónde ocurre la obra: [id, fase, top, bottom, alto de pantalla, ms]
    function trace(u, ph) {
      if (!stat.trace) stat.trace = [];
      if (stat.trace.length > 600) return;
      var r = u.el.getBoundingClientRect();
      stat.trace.push([u.id, ph, Math.round(r.top), Math.round(r.bottom), window.innerHeight, Math.round(performance.now()), u.intro ? 1 : 0]);
    }
    function built(u, quiet) {
      if (u.builtSent) return;
      u.builtSent = true;
      trace(u, quiet ? 'q' : 'e');
      u.el.classList.remove('sw-wait');
      u.el.setAttribute('data-built', '');
      try { u.el.dispatchEvent(new CustomEvent('built', { bubbles: true, detail: { quiet: !!quiet || !inView(u) } })); } catch (e) {}
    }
    function introStep(u) {
      if (!u.intro || u.counted) return;
      u.counted = true;
      if (--introLeft <= 0) finishIntro(false);
    }
    function finishIntro(skipped) {
      if (introDone) return;
      introDone = true;
      root.classList.remove('sw-ready');
      if (!stopped) setTimeout(function () { safe(scan); }, 0);
      root.classList.remove('swarm');
      stat.end = performance.now();
      stat.skipped = skipped;
      if (stopped) return;
      if (units.some(function (u) { return u.state !== 'pending' && u.state !== 'done'; })) hudShow(); else H.idle();
    }
    function tidy() { // cuando ya no queda nada por armar, la barra cierra y se va todo lo que el efecto agregó
      if (stopped || !begun || units.some(function (u) { return u.state !== 'done'; })) return;
      window.removeEventListener('scroll', onScroll);
      clearInterval(poll);
      window.removeEventListener('resize', onResize);
      if (io) { io.disconnect(); io = null; }
      if (ro) { ro.disconnect(); ro = null; }
      if (!finished) {
        finished = true;
        clearTimeout(hudIdle);
        hudUpdate();
        root.classList.add('rebuilt');
        H.done({ frames: stat.frames, agents: stat.maxAgents, t0: stat.t0 || stat.start });
      }
      if (cursors.length || minis.length) return;
      setTimeout(function () {
        if (cursors.length || minis.length || tweens.length) return;
        if (planLayer) { planLayer.remove(); planLayer = null; }
        if (curLayer) { curLayer.remove(); curLayer = null; guides.h = guides.v = null; }
      }, 300);
    }
    // Skip, Escape, caché atrás/adelante, repetición o cualquier error: todo armado al instante, sin marcos ni cursores
    function cancelAll(why) {
      if (stopped) return;
      stopped = true;
      tweens = [];
      loop = 0;
      if (orb) { cancelAnimationFrame(orb.raf); clearTimeout(orb.tm); orb = null; }
      clearTimeout(hudIdle);
      units.forEach(function (u) { clearTimeout(u.safety); clearTimeout(u.hard); clearTimeout(u.planT); u.state = 'done'; });
      Array.prototype.forEach.call(document.querySelectorAll('.sw-pending,[data-build],[data-build-items] > *'), function (el) {
        el.classList.remove('sw-pending', 'is-rising'); el.style.clipPath = ''; el.style.opacity = '';
      });
      undraw(document);
      units.forEach(function (u) { built(u, true); seqEnd(u.seq); });
      root.classList.add('rebuilt');
      if (planLayer) planLayer.remove();
      if (curLayer) curLayer.remove();
      planLayer = curLayer = null; guides.h = guides.v = null;
      cursors = []; minis = []; waiting = [];
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      clearInterval(poll);
      window.removeEventListener('resize', onResize);
      finishIntro(why === 'skip');
      root.classList.remove('swarm', 'sw-ready');
      if (why === 'skip' && log) log.finish();
      H.stopped(why);
    }

    /* ---------- Líneas de texto de una unidad (solo nodos de texto), en coordenadas de la unidad ---------- */
    function rawLines(el) {
      var r0 = el.getBoundingClientRect(), raw = [], walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n, range = document.createRange();
      while ((n = walker.nextNode())) {
        if (!/\S/.test(n.nodeValue)) continue;
        range.selectNodeContents(n);
        Array.prototype.forEach.call(range.getClientRects(), function (q) {
          if (q.width < 2 || q.height < 4) return;
          raw.push({ top: q.top - r0.top, bottom: q.bottom - r0.top, left: q.left - r0.left, right: q.right - r0.left });
        });
      }
      raw.sort(function (a, b) { return a.top - b.top || a.left - b.left; });
      var lines = [];
      raw.forEach(function (q) {
        var L = null;
        lines.forEach(function (k) { if (!L && q.top < k.bottom - 3 && q.bottom > k.top + 3 && q.left < k.right + 40 && q.right > k.left - 40) L = k; });
        if (L) {
          L.top = Math.min(L.top, q.top); L.bottom = Math.max(L.bottom, q.bottom);
          L.left = Math.min(L.left, q.left); L.right = Math.max(L.right, q.right);
        } else lines.push({ top: q.top, bottom: q.bottom, left: q.left, right: q.right });
      });
      return lines;
    }
    function tiledLines(el) { // líneas de lectura (una por altura), repartidas sin huecos; la última llega hasta abajo
      var r0 = el.getBoundingClientRect(), lines = [];
      rawLines(el).sort(function (a, b) { return a.top - b.top; }).forEach(function (q) {
        var L = lines[lines.length - 1];
        if (L && q.top < L.bottom - 3) {
          L.top = Math.min(L.top, q.top); L.bottom = Math.max(L.bottom, q.bottom);
          L.left = Math.min(L.left, q.left); L.right = Math.max(L.right, q.right);
        } else lines.push({ top: q.top, bottom: q.bottom, left: q.left, right: q.right });
      });
      for (var i = 1; i < lines.length; i++) {
        var mid = (lines[i - 1].bottom + lines[i].top) / 2;
        lines[i - 1].bottom = mid; lines[i].top = mid;
      }
      if (lines.length) { lines[0].top = Math.min(lines[0].top, 0); lines[lines.length - 1].bottom = r0.height + 30; }
      lines.forEach(function (l) { l.w = Math.max(24, l.right - l.left); });
      return lines;
    }

    /* ---------- Bucle de animación (un solo requestAnimationFrame para todo) ---------- */
    function tween(c, dur, fn, done) {
      var t = { t0: performance.now(), dur: Math.max(1, dur), fn: fn, done: done, dead: false };
      if (c) { if (c.tw) c.tw.dead = true; c.tw = t; }
      tweens.push(t);
      if (!loop) schedule();
    }
    function frame() {
      loop = -1; // mientras corre, nadie pide otro cuadro
      if (stopped) { loop = 0; return; }
      var now = performance.now();
      try {
        tweens.slice().forEach(function (t) {
          if (t.dead) return;
          var p = Math.min(1, Math.max(0, (now - t.t0) / t.dur));
          var stop = t.fn(p) === true;
          if (p >= 1 || stop) { t.dead = true; if (t.done) t.done(); }
        });
        tweens = tweens.filter(function (t) { return !t.dead; });
      } catch (e) { loop = 0; fail(e); return; }
      loop = 0;
      if (tweens.length && !stopped) schedule();
    }
    // pide el próximo cuadro; si la ventana está tapada y el navegador frena requestAnimationFrame, un temporizador corto lo reemplaza
    function schedule() {
      loop = 1;
      var ran = false, tm = 0;
      var run = function () { if (ran) return; ran = true; clearTimeout(tm); frame(); };
      requestAnimationFrame(run);
      tm = setTimeout(run, 40);
    }
    function onScroll() {
      // velocidad del lector: un salto (más de 1,5 pantallas de una vez) o un tramo rápido abren la ventana de prisa
      var now = performance.now(), y = window.scrollY, dy = Math.abs(y - lastY), dt = Math.max(16, now - lastT);
      if (dy > window.innerHeight * 1.5 || dy / dt > RITMO.prisa) rushUntil = now + RITMO.prisaVentana;
      lastY = y; lastT = now;
      if (sraf) return;
      // un cuadro o, si el navegador frena los cuadros (ventana tapada), un temporizador corto: lo primero que llegue
      var ran = false, tm = 0;
      var run = function () { if (ran) return; ran = true; clearTimeout(tm); scan(); };
      sraf = 1;
      requestAnimationFrame(run);
      tm = setTimeout(run, 50);
    }
    function scan() {
      sraf = 0;
      if (stopped || !begun) return; // en la etapa de inicio no se construye nada
      safe(function () {
        var h = window.innerHeight;
        units.forEach(function (u) {
          if (u.state === 'done') return;
          if (u.intro && !introQueued) return;                             // la intro aún no arranca: la arma su cola
          var r = u.el.getBoundingClientRect();
          if (r.bottom <= 0) { instant(u); return; }                       // el lector ya pasó: armada al instante
          if (r.top >= h) return;                                          // todavía abajo
          if (u.state === 'pending') {
            if (performance.now() < rushUntil) { direct(u); return; }      // salto o scroll rápido: directo
            enterPlan(u, r);                                               // asoma: se ve su plano
          }
          if (u.state === 'plan') {
            if (ready(u, r)) queue(u);                                     // cruzó la línea (o su anterior quedó armada): se construye
            else armPlan(u);
          }
        });
      });
    }
    function onResize() {
      if (rraf) return;
      rraf = requestAnimationFrame(function () {
        rraf = 0;
        safe(function () { units.forEach(function (u) { if (u.fr) placeFrame(u); }); });
      });
    }
  }

  try { boot(); } catch (e) { panic(e); } // al final: todas las variables de arriba ya tienen su valor

  /* Log en vivo: las líneas de muestra se escriben una sola vez por carga, sin reduced-motion.
     Si el log ya se ve al cargar, empieza a los 0,6 s; si está más abajo, cuando entra en pantalla. */
  function setupLog(enabled) {
    var box = document.querySelector('.log');
    if (!box || !enabled) return null;
    var lines = box.querySelectorAll('.log__line');
    var STAGGER = 280, TYPE = 340, state = { start: null, end: null };
    window.__log = state;
    Array.prototype.forEach.call(lines, function (li, i) {
      var msg = li.querySelector('.log__msg');
      li.style.setProperty('--d', (i * STAGGER) + 'ms');
      msg.style.setProperty('--n', msg.textContent.length);
      msg.style.setProperty('--t', TYPE + 'ms');
    });
    box.classList.add('armed');
    var total = (lines.length - 1) * STAGGER + 60 + TYPE + 40, endTimer = null;
    function play() {
      if (state.start !== null || !box.classList.contains('armed')) return;
      state.start = performance.now();
      box.classList.add('play');
      endTimer = setTimeout(finishLog, total);
    }
    function finishLog() {
      clearTimeout(endTimer);
      box.classList.remove('armed', 'play');
      if (state.start === null) state.start = performance.now();
      state.end = performance.now();
    }
    var r = box.getBoundingClientRect();
    if (r.top < window.innerHeight) setTimeout(play, 600);
    else if (typeof window.IntersectionObserver === 'function') {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { io.disconnect(); play(); }
      }, { threshold: 0.4 });
      io.observe(box);
    } else finishLog();
    return { finish: finishLog };
  }
})();
