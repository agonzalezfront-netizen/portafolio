/* COPIA para el portafolio. Fuente única: _revision/storyboard-fabrica.js (commit f6e539e, sha1 5ae1f839…).
 * Tiempos, textos, sonidos, música, voz y orden de escenas: idénticos a la fuente. Lo único que cambia aquí está marcado
 * con «[portafolio]» y solo actúa si la página define window.__fabricaEmbed (lo pone el cargador de index.html):
 *  · no arranca sola al entrar en vista (solo con el clic del visitante); se sigue pausando al salir de vista;
 *  · idioma inicial, ruta de los mp3 y AudioContext creado dentro del clic los entrega el cargador;
 *  · avisa «fabrica:play» al reproducir (el Tour de swarm.js se pausa);
 *  · modo teléfono (ancho ≤ 699 px, en la misma página): cuadro a 1,05 px por unidad con una cámara que recorre cada escena (CAM),
 *    bandeja «Lección por aprender» fija en una franja superior en dos renglones (rótulo 11, nota a 0,85), textos de 9,5 y 10 u. a 11,
 *    y tres achiques que en teléfono no bajan de 11 px (sesión de E3, nota aparcada de E5, «+ lección» de E8). En escritorio, igual que la fuente.
 * Si cambia la fuente, recopiar y volver a aplicar estos puntos. */
/* Storyboard de la Fábrica: motor de línea de tiempo (sin librerías). Versión completa · 41,5 s · 10 rótulos · 14-11 (E4 rehecha: sistema de diseño → Staging; E5 rehecha: el arreglo viaja y vuelve;
 *   bandeja «Lección por aprender»: el arreglo se guarda en E5, espera en E6–E7 y en E8 se revisa, se aprende y entra al skill).
 * Cada escena es una función pura del tiempo: update(t) deja el cuadro exacto del segundo t.
 * Así pausar, repetir, saltar, cambiar de idioma y mostrar láminas quietas (movimiento reducido) son lo mismo: pintar un t.
 * Tiempos tomados de storyboard-fabrica.html (tabla «Cómo se calculó cada tiempo» y fichas E1–E8). */
(function () {
  'use strict';
  var html = document.documentElement;
  var RM = html.classList.contains('rm');
  var NS = 'http://www.w3.org/2000/svg', uid = 0;
  var FD = "'Space Grotesk',system-ui,sans-serif", FX = 'Anton,Impact,sans-serif';
  var C = {bg: '#000', bg1: '#0B0F14', sf: '#121821', sf2: '#1A222D', line: '#243040', text: '#E8EDF2', muted: '#93A1B0',
    cyan: '#00E5FF', ok: '#00FF8A', warn: '#FFD600', err: '#FF6B6B',
    cortex: '#5B8DEF', po: '#7FD8A8', tl: '#00E5FF', dev8: '#E8C95A', v5: '#F2A0C8'};

  /* ───────── Textos: un diccionario por idioma, mismas claves ───────── */
  var TX = {
    en: {
      caps: [['Every task starts as a spec'], ['A plan before anyone builds'], ['It runs where there is room'], ['Built with the design system'],
        ['A fresh agent checks it', 'Fails go back with one fix', 'Round 2 passes'], ['Returns are counted, not hidden'], ['I review, then it ships'], ['Every return becomes a lesson']],
      tag: ['Spec', 'Order + plan', 'Team + room', 'Build + seal', 'Check + return', 'How are we doing?', 'Review + ship', 'Lesson'],
      bar: ['Spec', 'Order + plan', 'Team + room', 'Build + seal', 'Check + return', 'How are we doing?', 'Review + ship', 'Lesson'],
      sc: [
        {po: 'PO · writes the spec', spec: 'SPEC', title: 'Owner weekly summary', done: 'DONE WHEN', rows: ['Shows the last 7 days', 'Works at 360 px', 'Copy approved'], ready: 'spec complete'},
        {cortex: 'Cortex · keeps the order', next: 'UP NEXT', cards: ['Kitchen timer', 'Menu photos', 'Receipt email', 'Owner weekly summary'], tl: 'TL · technical plan', nodes: ['Data', 'Screen', 'Tests']},
        {st: {free: 'free', planning: 'planning', waiting: 'waiting', working: 'working'}, last: 'last option', full: 'full', room3: 'room for 3', room2: 'room for 2', session: 'session'},
        {ds: 'DESIGN SYSTEM', stg: 'Staging', prod: 'Production', checks: 'CHECKS', ck: ['Tests', 'Guards', 'Visual rules'], sealed: 'SEALED'},
        {dev: 'Dev 8 · built it', vf: 'verif-5 · did not build it', crit: 'CRITERION', evid: 'EVIDENCE', rows: ['Last 7 days shown', 'Works at 360 px', 'Empty state copy', 'Contrast AA'], fix: '1 fix · empty state copy', empty: 'No data yet', round: 'Round 2', verified: 'VERIFIED'},
        {head: 'HOW ARE WE DOING?', sample: 'sample data', k: ['CARDS CLOSED', 'RETURNS PER CARD', 'HOURS IN REVIEW'], sub: ['today', 'cards closed today', 'median, today']},
        {say: '“Stage 2 is ready for you.”', me: 'Me', st: ['Staging', 'Production']},
        {mem: 'memory', rev: 'reviewing', learn: 'learning', skill: 'Dev skill', lesson: '+ lesson', dec: 'decision logged', next: 'next start loads it', fix: '1 fix · empty state copy'}
      ],
      tray: 'LESSON TO LEARN',
      ui: {play: 'Play', pause: 'Pause', prev: 'Previous scene', next: 'Next scene', replay: 'Replay', step: 'Step by step', sound: 'Sound', sndOn: 'sound on', sndOff: 'sound off',
        group: 'Animation controls', bar: 'Scenes', scene: 'Scene {n} of 8 · {name}', go: 'Go to scene {n} of 8: {name}',
        done: 'Scene {n} of 8 finished · Next to continue', see8: 'See the 8 scenes', lang: 'Language of the animation'},
      aria: 'About 41-second animation in 8 scenes: a task starts as a spec, gets a plan before anyone builds it, runs on a machine with room, takes a component from the design system into a staging screen where checks seal it, is checked by a different agent, goes back once with a fix and passes on the second round, and the fix is kept in a «lesson to learn» tray; returns are counted, and after I review it, it ships to production; then Cortex reviews the kept fix, turns it into a lesson and adds it to the Dev skill, which moves up a version.',
      poster: {title: 'HOW THE FACTORY RUNS', b1: 'Spec', s1: 'PO writes it', b2: 'Order + plan', s2: 'Cortex · TL', b3: 'Room to run', s3: 'free machine', b4: 'Build + seal', s4: 'Dev · checks',
        b5: 'Fresh check', s5: 'other agent', b6: 'I review', s6: 'end of stage', b7: 'Staging', s7: 'with the seal', b8: 'Production', s8: 'shipped',
        f1: 'fails:', f2: 'back with a fix', around: 'AROUND IT', aroundTxt: 'Cortex memory · lessons · voice when needed · daily numbers'}
    },
    es: {
      caps: [['Toda tarea nace por escrito'], ['Nadie construye sin un plan'], ['Corre donde hay espacio'], ['Hecha con el sistema de diseño'],
        ['La revisa otro agente', 'Si falla, vuelve con un arreglo', 'La vuelta 2 pasa'], ['Vueltas: se cuentan, no se ocultan'], ['La reviso yo y después sale'], ['Cada vuelta deja una lección']],
      tag: ['Encargo', 'Orden + plan', 'Equipo y lugar', 'Hacer + sellar', 'Revisión + vuelta', '¿Cómo vamos?', 'Revisar + salir', 'Lección'],
      bar: ['Encargo', 'Orden y plan', 'Equipo y espacio', 'Construcción y sello', 'Revisión y vuelta', '¿Cómo vamos?', 'Revisión y salida', 'Lección'],
      sc: [
        {po: 'PO · escribe el encargo', spec: 'ENCARGO', title: 'Resumen semanal', done: 'LISTA CUANDO', rows: ['Muestra la última semana', 'Funciona a 360 px', 'Textos aprobados'], ready: 'encargo completo'},
        {cortex: 'Cortex · lleva el orden', next: 'PRÓXIMAS', cards: ['Reloj de cocina', 'Fotos del menú', 'Envío del recibo', 'Resumen semanal'], tl: 'TL · plan técnico', nodes: ['Datos', 'Pantalla', 'Pruebas']},
        {st: {free: 'libre', planning: 'planifica', waiting: 'espera', working: 'trabaja'}, last: 'última opción', full: 'llena', room3: 'caben 3', room2: 'caben 2', session: 'sesión'},
        {ds: 'SISTEMA DE DISEÑO', stg: 'Pruebas (staging)', prod: 'Producción', checks: 'CONTROLES', ck: ['Pruebas', 'Guardas', 'Reglas visuales'], sealed: 'SELLADA'},
        {dev: 'Dev 8 · la hizo', vf: 'verif-5 · no la construyó', crit: 'CRITERIO', evid: 'EVIDENCIA', rows: ['Muestra la semana', 'Funciona a 360 px', 'Texto sin datos', 'Contraste AA'], fix: '1 arreglo · texto sin datos', empty: 'Aún no hay datos', round: 'Vuelta 2', verified: 'VERIFICADA'},
        {head: '¿CÓMO VAMOS?', sample: 'solo ejemplo', k: ['TAREAS CERRADAS', 'VUELTAS POR TAREA', 'HORAS EN REVISIÓN'], sub: ['hoy', 'tareas cerradas hoy', 'mediana, hoy']},
        {say: '“La etapa 2 te espera.”', me: 'Yo', st: ['Pruebas (staging)', 'Producción']},
        {mem: 'memoria', rev: 'revisando', learn: 'aprendiendo', skill: 'Skill · Dev', lesson: '+ lección', dec: 'decisión anotada', next: 'la carga al arrancar', fix: '1 arreglo · texto sin datos'}
      ],
      tray: 'LECCIÓN POR APRENDER',
      ui: {play: 'Reproducir', pause: 'Pausar', prev: 'Escena anterior', next: 'Escena siguiente', replay: 'Repetir', step: 'Paso a paso', sound: 'Sonido', sndOn: 'sonido encendido', sndOff: 'sonido apagado',
        group: 'Controles de la animación', bar: 'Escenas', scene: 'Escena {n} de 8 · {name}', go: 'Ir a la escena {n} de 8: {name}',
        done: 'Escena {n} de 8 terminada · Siguiente para seguir', see8: 'Ver las 8 escenas', lang: 'Idioma de la animación'},
      aria: 'Animación de unos 41 segundos en 8 escenas: una tarea nace por escrito, se planifica antes de construirla, corre en una máquina con espacio, toma un componente del sistema de diseño y lo encaja en una pantalla de pruebas (staging), donde los controles la sellan, la revisa otro agente, vuelve una vez con un arreglo y pasa en la segunda vuelta, y el arreglo se guarda en una bandeja «lección por aprender»; las vueltas se cuentan, y cuando la reviso sale a producción; al final Cortex revisa el arreglo guardado, lo convierte en lección y lo suma al skill del Dev, que sube de versión.',
      poster: {title: 'ASÍ FUNCIONA LA FÁBRICA', b1: 'Encargo', s1: 'PO lo escribe', b2: 'Orden + plan', s2: 'Cortex · TL', b3: 'Lugar libre', s3: 'máquina libre', b4: 'Hacer + sellar', s4: 'Dev · controles',
        b5: 'Otra mirada', s5: 'otro agente', b6: 'Reviso yo', s6: 'fin de etapa', b7: 'Staging', s7: 'con el sello', b8: 'Producción', s8: 'publicada',
        f1: 'falla:', f2: 'vuelve a corregir', around: 'ALREDEDOR', aroundTxt: 'Memoria de Cortex · lecciones · voz si hace falta · cifras del día'}
    }
  };
  var EMB = window.__fabricaEmbed || null;   // [portafolio]
  var LANG = (EMB && EMB.lang === 'es') ? 'es' : 'en';
  function X() { return TX[LANG] || TX.en; }
  function nf(v, dec) {
    try { return new Intl.NumberFormat(LANG === 'es' ? 'es' : 'en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: false}).format(v); }
    catch (e) { var s = v.toFixed(dec); return LANG === 'es' ? s.replace('.', ',') : s; }
  }
  function fmt(s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k]; }); }

  function S(tag, a, p) { var e = document.createElementNS(NS, tag); if (a) for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function T(p, x, y, s, o) {
    o = o || {};
    var e = S('text', {x: x, y: y, 'font-size': o.size || 14, fill: o.fill || C.text, 'font-family': o.fam || FD,
      'font-weight': o.w || 500, 'text-anchor': o.anchor || 'start'}, p);
    if (o.ls) e.setAttribute('letter-spacing', o.ls);
    e.textContent = s; return e;
  }
  function cl(x, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return x < a ? a : (x > b ? b : x); }
  function eo(p) { return 1 - Math.pow(1 - p, 3); }
  function eio(p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function lin(p) { return p; }
  function sg(t, a, b, e) { return (e || eo)(cl((t - a) / (b - a))); }
  function L(a, b, p) { return a + (b - a) * p; }
  function op(e, v) { e.setAttribute('opacity', cl(v).toFixed(3)); }
  function tr(e, x, y, s) { e.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ')' + (s != null && s !== 1 ? ' scale(' + s.toFixed(3) + ')' : '')); }
  function draw(e, p) { e.setAttribute('stroke-dashoffset', (1 - cl(p)).toFixed(4)); }
  function drawable(e) { e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', 1); e.setAttribute('stroke-dashoffset', 1); return e; }
  function kf(t, k) {
    if (t <= k[0][0]) return [k[0][1], k[0][2]];
    for (var i = 1; i < k.length; i++) if (t <= k[i][0]) { var p = eo((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])); return [L(k[i - 1][1], k[i][1], p), L(k[i - 1][2], k[i][2], p)]; }
    var z = k[k.length - 1]; return [z[1], z[2]];
  }
  function chip(p, x, y, label, color, o) {
    o = o || {};
    var g = S('g', {}, p), w = o.w || (label.length * 7.6 + 38);
    S('rect', {x: 0, y: 0, width: w, height: 28, rx: 14, fill: o.outline ? 'none' : C.sf, stroke: o.outline ? color : C.line, 'stroke-width': 1.2}, g);
    S('circle', {cx: 15, cy: 14, r: 5, fill: color}, g);
    var t = T(g, 27, 19, label, {size: 13, w: 600, fill: o.outline ? color : C.text});
    tr(g, x, y); return {g: g, t: t, w: w};
  }
  function cursor(p, color) { var g = S('g', {}, p); S('path', {d: 'M0 0l12 8-5.4 1.3-2.7 5.4z', fill: color, stroke: 'rgba(0,0,0,.55)', 'stroke-width': 1}, g); return g; }
  function tick(p, x, y, color) { var g = S('g', {}, p); S('circle', {cx: x, cy: y, r: 9, fill: color, opacity: .16}, g); S('path', {d: 'M' + (x - 4.5) + ' ' + y + 'l3 3 6-6.5', fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}, g); return g; }
  function cross(p, x, y) { var g = S('g', {}, p); S('circle', {cx: x, cy: y, r: 9, fill: C.err, opacity: .16}, g); S('path', {d: 'M' + (x - 4) + ' ' + (y - 4) + 'l8 8M' + (x + 4) + ' ' + (y - 4) + 'l-8 8', stroke: C.err, 'stroke-width': 2, 'stroke-linecap': 'round'}, g); return g; }
  function note(p, label) { var g = S('g', {}, p), w = label.length * 7.4 + 22; S('rect', {x: 0, y: 0, width: w, height: 26, rx: 6, fill: '#1d1a08', stroke: C.warn, 'stroke-width': 1.2}, g); T(g, 11, 17.5, label, {size: 13, w: 600, fill: C.warn}); return g; }
  function mini(p) {
    var g = S('g', {}, p);
    S('rect', {x: 0, y: 0, width: 140, height: 150, rx: 10, fill: C.sf, stroke: C.line, 'stroke-width': 1.2}, g);
    S('rect', {x: 12, y: 14, width: 116, height: 10, rx: 3, fill: C.sf2}, g);
    S('rect', {x: 12, y: 34, width: 116, height: 40, rx: 6, fill: C.sf2, stroke: C.line}, g);
    S('rect', {x: 12, y: 84, width: 116, height: 15, rx: 4, fill: 'none', stroke: C.muted, 'stroke-width': 1}, g);
    S('rect', {x: 12, y: 112, width: 70, height: 20, rx: 10, fill: C.cyan}, g);
    return g;
  }

  /* Bandeja «Lección por aprender»: franja fija arriba a la izquierda (x 30, y 5, 24 de alto), libre en las 8 escenas
   * (las fichas y chips empiezan en y 36; la etiqueta de escena va arriba a la derecha). Va en la capa ov de cada escena:
   * E5 la abre y guarda el arreglo, E6 y E7 la muestran quieta con el arreglo dentro, E8 lo saca y la deja vacía. E1–E4 no la dibujan. */
  /* [portafolio] Modo teléfono (ancho ≤ 699 px): el cuadro se dibuja a 1,05 px por unidad (todo texto de 11 u. queda ≥ 11,5 px),
   * así que a 360 px se ven ~343 de las 640 unidades: una cámara recorre cada escena siguiendo la acción (CAM, más abajo).
   * Arriba se suma una franja de HB unidades donde vive la bandeja «Lección por aprender», fija en pantalla (no se va con la cámara),
   * en dos renglones y con su texto a ≥ 11 px. Mismo contenido, mismos tiempos y mismo orden de escenas que la fuente. */
  var PS = 1.05, HB = 50;
  var MQ = (EMB && window.matchMedia) ? window.matchMedia('(max-width: 699px)') : null;
  var PH = !!(MQ && MQ.matches);
  var TRAY_S, TRAY_LBL;
  function trayK() { TRAY_S = PH ? .85 : .56; TRAY_LBL = PH ? 11 : 7.5; }
  trayK();
  function trayGeo() {
    var lab = X().tray, fx = X().sc[4].fix, nw = fx.length * 7.4 + 22, tw = lab.length * 5.4 * TRAY_LBL / 7.5, sx = 30 + 10 + tw + 8;
    if (PH) return {lab: lab, fx: fx, nw: nw, sx: 18, sy: -HB + 22, w: Math.max(tw, nw * TRAY_S) + 22, ph: 1};
    return {lab: lab, fx: fx, nw: nw, sx: sx, sy: 5 + (24 - 26 * TRAY_S) / 2, w: 10 + tw + 8 + nw * TRAY_S + 4 + 6};
  }
  function lessonTray(p) {
    var G = trayGeo(), g = S('g', {'data-p': 'tray'}, p), glow, box;
    if (G.ph) {   // [portafolio] franja superior: rótulo arriba, hueco del arreglo abajo; data-hud = la sigue la cámara (queda quieta en pantalla)
      g.setAttribute('data-hud', '1');
      glow = S('rect', {x: 5, y: -HB + 1, width: G.w + 6, height: HB - 2, rx: 10, fill: 'none', stroke: C.warn, 'stroke-width': 2, opacity: 0}, g);
      box = S('rect', {x: 8, y: -HB + 4, width: G.w, height: HB - 5, rx: 8, fill: C.bg1, stroke: C.line, 'stroke-width': 1.2}, g);
      T(g, 18, -HB + 18, G.lab, {size: TRAY_LBL, w: 600, fill: C.muted, ls: '.1em'});
    } else {
      glow = S('rect', {x: 27, y: 2, width: G.w + 6, height: 30, rx: 10, fill: 'none', stroke: C.warn, 'stroke-width': 2, opacity: 0}, g);
      box = S('rect', {x: 30, y: 5, width: G.w, height: 24, rx: 8, fill: C.bg1, stroke: C.line, 'stroke-width': 1.2}, g);
      T(g, 40, 15 + TRAY_LBL * .63, G.lab, {size: TRAY_LBL, w: 600, fill: C.muted, ls: '.1em'});
    }
    var slot = S('rect', {x: G.sx - 2, y: G.sy - 2, width: G.nw * TRAY_S + 4, height: 26 * TRAY_S + 4, rx: 5, fill: 'none', stroke: C.line, 'stroke-dasharray': '3 3'}, g);
    function held(on) { box.setAttribute('stroke', on ? 'rgba(255,214,0,.4)' : C.line); box.setAttribute('data-held', on ? '1' : '0'); }
    return {g: g, box: box, glow: glow, slot: slot, G: G, held: held};
  }
  // E6 y E7: la bandeja quieta, con el arreglo guardado
  function trayHeld(ov) {
    var tb = lessonTray(ov), n = note(PH ? tb.g : ov, tb.G.fx);   // [portafolio] en teléfono el arreglo va dentro de la bandeja fija
    n.setAttribute('data-p', 'fix-held'); tr(n, tb.G.sx, tb.G.sy, TRAY_S); tb.held(true);
    return tb;
  }

  /* ───────── Escenas ─────────
   * dur: duración asignada en la tabla del HTML. caps: segundo (local) en que entra cada rótulo.
   * Cada rótulo queda en pantalla hasta que entra el siguiente (sin hueco al cambiar de escena). */
  var SC = [];

  // E1 · Spec — 4,0 s. Ficha + cursor + borde (0,2–1,0) · título (1,0–1,6) · 3 criterios (1,6–2,5) · chip (2,5–2,95). Quieto desde 2,95.
  SC.push({id: 'spec', dur: 4.0, caps: [.2],
    build: function (g, x) {
      var po = chip(g, 40, 36, x.po, C.po);
      var fill = S('rect', {x: 180, y: 78, width: 258, height: 196, rx: 12, fill: C.sf}, g);
      var out = drawable(S('rect', {x: 180, y: 78, width: 258, height: 196, rx: 12, fill: 'none', stroke: C.cyan, 'stroke-width': 1.5}, g));
      var eb = T(g, 202, 108, x.spec, {size: 11, fill: C.muted, w: 600, ls: '.12em'});
      var TITLE = x.title, title = T(g, 202, 138, '', {size: 19, w: 600});
      var dw = T(g, 202, 168, x.done, {size: 11, fill: C.muted, w: 600, ls: '.12em'});
      var rows = x.rows.map(function (s, i) {
        var y = 190 + i * 28, r = S('g', {}, g);
        S('rect', {x: 202, y: y - 11, width: 13, height: 13, rx: 3, fill: 'none', stroke: C.cyan, 'stroke-width': 1.3}, r);
        var ck = drawable(S('path', {d: 'M204.6 ' + (y - 4.5) + 'l3 3 5.5-6', fill: 'none', stroke: C.cyan, 'stroke-width': 1.8, 'stroke-linecap': 'round'}, r));
        T(r, 224, y, s, {size: 14}); return {g: r, ck: ck};
      });
      var ready = chip(g, 452, 78, x.ready, C.ok, {outline: true});
      var cur = cursor(g, C.po);
      // El cursor DIBUJA el borde: va en la punta del trazo durante toda la vuelta (0,25–1,0), no detrás.
      var OL = 0; try { OL = out.getTotalLength(); } catch (e) { OL = 0; }
      function tip(p) { try { var q = out.getPointAtLength(OL * cl(p)); return [q.x, q.y]; } catch (e) { return [192, 78]; } }
      var K = [[1.0, 192, 78], [1.1, 206, 142], [1.6, 206 + TITLE.length * 9.8, 142], [1.9, 210, 190], [2.4, 210, 246], [2.95, 500, 112]];
      return function (t) {
        op(po.g, sg(t, .2, .45));
        draw(out, sg(t, .25, 1.0, lin)); op(fill, sg(t, .7, 1.0) * .96);
        op(eb, sg(t, .8, 1.0));
        title.textContent = TITLE.slice(0, Math.round(TITLE.length * sg(t, 1.0, 1.6, lin)));
        op(dw, sg(t, 1.5, 1.7));
        rows.forEach(function (r, i) { var p = sg(t, 1.6 + i * .2, 1.9 + i * .2); op(r.g, p); tr(r.g, (1 - p) * -8, 0); draw(r.ck, sg(t, 1.95 + i * .17, 2.15 + i * .17, lin)); });
        var pr = sg(t, 2.5, 2.95); op(ready.g, pr); tr(ready.g, 452, 78 + (1 - pr) * 6);
        var c;
        if (t < .25) { var s0 = tip(0), a0 = sg(t, .2, .25); c = [L(120, s0[0], a0), L(64, s0[1], a0)]; }
        else if (t < 1.0 && OL) c = tip(sg(t, .25, 1.0, lin));
        else c = kf(t, K);
        tr(cur, c[0], c[1]); op(cur, sg(t, .2, .35));
      };
    }});

  // E2 · Orden y plan — 3,6 s. Cortex (0,2) · reordenamiento en bloque (0,5–1,3) · TL + ruta (1,4–2,0) · 3 nodos (2,0–2,6).
  SC.push({id: 'order', dur: 3.6, caps: [.2],
    build: function (g, x) {
      var cx = chip(g, 40, 36, x.cortex, C.cortex);
      T(g, 60, 96, x.next, {size: 11, fill: C.muted, w: 600, ls: '.12em'});
      for (var i = 0; i < 4; i++) {
        T(g, 46, 132 + i * 50, String(i + 1), {size: 14, fill: C.muted, anchor: 'middle', w: 600});
        S('rect', {x: 60, y: 106 + i * 50, width: 210, height: 40, rx: 8, fill: 'none', stroke: C.line, 'stroke-dasharray': '3 4'}, g);
      }
      function card(label, hl) {
        var c = S('g', {}, g);
        S('rect', {x: 0, y: 0, width: 210, height: 40, rx: 8, fill: C.sf, stroke: hl ? C.cyan : C.line, 'stroke-width': hl ? 1.5 : 1}, c);
        S('rect', {x: 0, y: 8, width: 3, height: 24, rx: 1.5, fill: hl ? C.cyan : C.muted}, c);
        T(c, 16, 25, label, {size: 14, w: hl ? 600 : 500}); return c;
      }
      var A = card(x.cards[0]), B = card(x.cards[1]), D = card(x.cards[2]), N = card(x.cards[3], true);
      tr(A, 60, 106);
      var tl = chip(g, 330, 96, x.tl, C.tl);
      var path = drawable(S('path', {d: 'M270 176 C 310 176, 330 176, 360 176 S 425 240, 460 240 S 530 176, 570 176', fill: 'none', stroke: C.cyan, 'stroke-width': 1.6}, g));
      var nodes = [[360, 176], [460, 240], [570, 176]].map(function (n, j) {
        var c = S('circle', {cx: n[0], cy: n[1], r: 8, fill: C.bg, stroke: C.cyan, 'stroke-width': 1.6}, g);
        var l = T(g, n[0], n[1] + 30, x.nodes[j], {size: 14, anchor: 'middle', w: 600});
        return {c: c, l: l, at: 2.0 + j * .2};
      });
      return function (t) {
        op(cx.g, sg(t, .2, .45));
        var p = sg(t, .5, 1.3);
        tr(B, 60, L(156, 206, p)); tr(D, 60, L(206, 256, p));
        tr(N, L(420, 60, p), L(110, 156, p)); op(N, sg(t, .2, .5));
        op(tl.g, sg(t, 1.4, 1.65));
        draw(path, sg(t, 1.45, 2.0, lin));
        nodes.forEach(function (n) { var on = sg(t, n.at, n.at + .2); n.c.setAttribute('fill', on > .5 ? C.cyan : C.bg); op(n.l, .25 + .75 * on); op(n.c, sg(t, 1.45, 1.65)); });
      };
    }});

  // E3 · Equipo y espacio — 3,9 s. Fichas ya presentes · 3 máquinas (0,2–0,9) · Dev 8 «working» (1,0) · PC 3 cian + píldora (1,3–2,3) · barra y margen (2,3–2,9).
  SC.push({id: 'room', dur: 3.9, caps: [.2],
    build: function (g, x) {
      var F = [['PO', 'free', C.po], ['TL', 'planning', C.tl], ['Dev 8', 'free', C.dev8], ['verif-5', 'waiting', C.v5]].map(function (a, i) {
        var f = S('g', {}, g);
        S('rect', {x: 0, y: 0, width: 136, height: 54, rx: 10, fill: C.sf, stroke: C.line}, f);
        S('circle', {cx: 24, cy: 27, r: 12, fill: a[2], opacity: .9}, f);
        T(f, 44, 24, a[0], {size: 14, w: 600});
        var dot = S('circle', {cx: 48, cy: 37.5, r: 3.5, fill: a[1] === 'free' ? C.ok : (a[1] === 'waiting' ? C.warn : C.cyan)}, f);
        var st = T(f, 56, 42, x.st[a[1]], {size: 12, fill: C.muted});
        tr(f, 40 + i * 148, 44);
        return {g: f, dot: dot, st: st};
      });
      var M = [['PC 1', 62, C.warn, x.last, 3], ['PC 2', 88, C.err, x.full, 5], ['PC 3', 41, C.ok, x.room3, 2]].map(function (m, i) {
        var g2 = S('g', {}, g), gx = 40 + i * 200;
        tr(g2, gx, 150);
        S('rect', {x: 0, y: 0, width: 176, height: 140, rx: 12, fill: C.sf, stroke: C.line}, g2);
        T(g2, 16, 30, m[0], {size: 16, w: 600});
        T(g2, 16, 58, 'RAM', {size: 11, fill: C.muted, w: 600, ls: '.1em'});
        var pct = T(g2, 160, 58, m[1] + ' %', {size: 12, fill: C.muted, anchor: 'end', w: 600});
        S('rect', {x: 16, y: 66, width: 144, height: 8, rx: 4, fill: C.sf2}, g2);
        var bar = S('rect', {x: 16, y: 66, width: 144 * m[1] / 100, height: 8, rx: 4, fill: m[2]}, g2);
        var mg = T(g2, 16, 100, m[3], {size: 13, fill: m[2], w: 600});
        var ses = [];
        for (var k = 0; k < 6; k++) ses.push(S('rect', {x: 16 + k * 18, y: 114, width: 12, height: 12, rx: 3, fill: k < m[4] ? C.muted : 'none', stroke: C.line, opacity: k < m[4] ? .55 : 1}, g2));
        var scan = S('rect', {x: -3, y: -3, width: 182, height: 146, rx: 14, fill: 'none', stroke: C.cyan, 'stroke-width': 2, opacity: 0}, g2);
        return {g: g2, pct: pct, bar: bar, mg: mg, ses: ses, scan: scan};
      });
      var pill = S('g', {}, g);
      S('rect', {x: -40, y: -12, width: 80, height: 24, rx: 12, fill: C.dev8}, pill);
      var pillT = T(pill, 0, 4.5, x.session, {size: 12, w: 600, fill: C.bg1, anchor: 'middle'});
      var nb = M[2];
      return function (t) {
        var on = t >= 1.0; F[2].st.textContent = on ? x.st.working : x.st.free; F[2].dot.setAttribute('fill', on ? C.cyan : C.ok);
        M.forEach(function (m, i) { var p = sg(t, .2 + i * .2, .5 + i * .2); op(m.g, p); tr(m.g, 40 + i * 200, 150 + (1 - p) * 8); });
        op(nb.scan, sg(t, 1.3, 1.45) * (1 - sg(t, 2.6, 2.9)));
        var p = sg(t, 1.35, 2.2, eio), px = L(404, 498, p), py = L(112, 270, p) - 50 * Math.sin(Math.PI * p);
        var s = 1 - .6 * sg(t, 2.1, 2.3); tr(pill, px, py, s); op(pill, sg(t, 1.3, 1.45) * (1 - sg(t, 2.2, 2.32)));
        if (PH) op(pillT, 1 - sg(t, 2.08, 2.14));   // [portafolio] el rótulo se apaga antes de achicarse (nunca se ve bajo 11 px)
        var land = sg(t, 2.3, 2.9), v = Math.round(L(41, 53, land));
        nb.bar.setAttribute('width', (144 * v / 100).toFixed(1)); nb.pct.textContent = v + ' %';
        nb.mg.textContent = t >= 2.6 ? x.room2 : x.room3;
        var s3 = nb.ses[2]; s3.setAttribute('fill', t >= 2.3 ? C.dev8 : 'none'); op(s3, t >= 2.3 ? sg(t, 2.3, 2.5) : 1);
      };
    }});

  /* Piezas compartidas por E4 y E7: el marco de entorno (Staging / Production), la pantalla de la plataforma y la tarjeta del sistema de diseño.
   * E7 dibuja el mismo marco y la misma pantalla que E4 (a escala) para cerrar el arco que E4 deja abierto. */
  function envFrame(p, x0, y0, w, h, label) {
    var g = S('g', {}, p);
    var box = S('rect', {x: x0, y: y0, width: w, height: h, rx: 12, fill: C.bg1, stroke: C.line, 'stroke-width': 1.4}, g);
    var dot = S('circle', {cx: x0 + 16, cy: y0 + 17.5, r: 4, fill: C.muted}, g);
    var lab = T(g, x0 + 27, y0 + 22, label, {size: 12, w: 600, fill: C.muted});
    return {g: g, box: box, dot: dot, lab: lab};
  }
  // Estado del marco: 'off' (gris, punteado: todavía no), 'idle' (gris, sólido), 'now' (cian: pasa ahora), 'ok' (verde: pasó / encendido)
  function envState(f, s) {
    var c = s === 'ok' ? C.ok : (s === 'now' ? C.cyan : C.line), lit = s === 'ok' || s === 'now';
    f.box.setAttribute('stroke', c); f.box.setAttribute('stroke-dasharray', s === 'off' ? '5 5' : 'none');
    f.dot.setAttribute('fill', lit ? c : C.muted); f.lab.setAttribute('fill', lit ? c : C.muted);
    f.box.setAttribute('data-on', s === 'ok' ? '1' : '0');
  }
  function cardComp(p) {   // 104 × 56: la tarjeta del sistema de diseño
    var g = S('g', {}, p);
    S('rect', {x: 0, y: 0, width: 104, height: 56, rx: 6, fill: C.sf2, stroke: C.muted, 'stroke-width': .9}, g);
    S('rect', {x: 6, y: 6, width: 92, height: 20, rx: 3, fill: C.line}, g);
    S('rect', {x: 6, y: 32, width: 58, height: 5, rx: 2.5, fill: C.text, opacity: .7}, g);
    S('rect', {x: 6, y: 42, width: 40, height: 4, rx: 2, fill: C.muted, opacity: .6}, g);
    S('rect', {x: 68, y: 39, width: 30, height: 11, rx: 5.5, fill: C.cyan}, g);
    return g;
  }
  function screenMock(p, withCard) {   // 120 × 200: una pantalla de la plataforma; el hueco de la tarjeta va en (8, 46)
    var g = S('g', {}, p);
    S('rect', {x: 0, y: 0, width: 120, height: 200, rx: 8, fill: C.sf, stroke: C.line}, g);
    S('path', {d: 'M0 16V8a8 8 0 0 1 8-8h104a8 8 0 0 1 8 8v8z', fill: C.sf2}, g);
    [9, 17, 25].forEach(function (cx) { S('circle', {cx: cx, cy: 8, r: 2.2, fill: C.line}, g); });
    S('rect', {x: 10, y: 26, width: 64, height: 7, rx: 3, fill: C.muted, opacity: .55}, g);
    S('rect', {x: 10, y: 37, width: 44, height: 4, rx: 2, fill: C.sf2}, g);
    var slot = S('rect', {x: 8, y: 46, width: 104, height: 56, rx: 6, fill: 'none', stroke: C.line, 'stroke-dasharray': '3 3'}, g);
    [[112, 96], [124, 76], [136, 88]].forEach(function (l) { S('rect', {x: 10, y: l[0], width: l[1], height: 5, rx: 2.5, fill: C.sf2}, g); });
    S('rect', {x: 10, y: 156, width: 100, height: 18, rx: 9, fill: 'none', stroke: C.muted, 'stroke-width': .9}, g);
    S('path', {d: 'M0 184H120', stroke: C.line}, g);
    if (withCard) { var c = cardComp(g); tr(c, 8, 46); slot.setAttribute('opacity', 0); }
    return {g: g, slot: slot};
  }

  // E4 · Sistema de diseño → Staging + sello — 6,2 s. Lámina (0,2–1,3) · foco en la tarjeta + cursor (1,5–1,9) · marco Staging (1,85–2,25) ·
  // viaje y encaje (2,3–3,05) · 3 controles uno a uno (3,15–4,1) · sello (4,15–4,75) · carril y Production apagados (4,8–5,2). Quieto desde 5,2.
  SC.push({id: 'build', dur: 6.2, caps: [.2],
    build: function (g, x) {
      var dsm = S('g', {'data-p': 'dsm'}, g);
      S('rect', {x: 22, y: 60, width: 130, height: 238, rx: 12, fill: C.sf, stroke: C.line}, dsm);
      T(dsm, PH ? 30 : 34, 84, x.ds, PH ? {size: 11, fill: C.muted, w: 600, ls: '.02em'} : {size: 10, fill: C.muted, w: 600, ls: '.08em'});   // [portafolio] teléfono: 11
      var tok = S('g', {}, g);
      [C.cyan, C.ok, C.warn, C.text].forEach(function (c, i) { S('circle', {cx: 41 + i * 18, cy: 106, r: 7, fill: c}, tok); });
      T(tok, 116, 111.5, 'Aa', {size: 15, w: 600});
      S('path', {d: 'M34 126H140', stroke: C.line}, tok);
      var cmp = [];
      var b1 = S('g', {}, g); S('rect', {x: 0, y: 0, width: 56, height: 16, rx: 8, fill: C.cyan}, b1); tr(b1, 34, 140); cmp.push(b1);
      var b2 = S('g', {}, g); S('rect', {x: 0, y: 0, width: 104, height: 16, rx: 4, fill: 'none', stroke: C.muted}, b2); S('rect', {x: 8, y: 6, width: 36, height: 4, rx: 2, fill: C.sf2}, b2); tr(b2, 34, 166); cmp.push(b2);
      var base = cardComp(g); tr(base, 34, 194); cmp.push(base);
      var b4 = S('g', {}, g); S('rect', {x: 0, y: 0, width: 28, height: 14, rx: 7, fill: C.ok, opacity: .85}, b4); S('circle', {cx: 21, cy: 7, r: 5, fill: C.bg1}, b4);
      S('rect', {x: 36, y: 0, width: 50, height: 14, rx: 7, fill: 'none', stroke: C.line}, b4); tr(b4, 34, 264); cmp.push(b4);
      var ring = drawable(S('rect', {x: 29, y: 189, width: 114, height: 66, rx: 9, fill: 'none', stroke: C.cyan, 'stroke-width': 1.8, 'data-p': 'focus'}, g));
      var stg = envFrame(g, 166, 60, 286, 238, x.stg);
      stg.g.setAttribute('data-p', 'stg');
      var scr = screenMock(stg.g, false); tr(scr.g, 178, 94);
      var flash = S('rect', {x: 186, y: 140, width: 104, height: 56, rx: 6, fill: 'none', stroke: C.cyan, 'stroke-width': 2, opacity: 0}, g);
      var ckh = S('g', {}, g);
      T(ckh, 312, 106, x.checks, {size: 11, fill: C.muted, w: 600, ls: '.1em'});
      var ck = x.ck.map(function (s, i) {
        var y = 134 + i * 32;
        S('circle', {cx: 322, cy: y - 5, r: 9, fill: 'none', stroke: C.line, 'stroke-width': 1}, ckh);
        var rr = drawable(S('circle', {cx: 322, cy: y - 5, r: 9, fill: 'none', stroke: C.ok, 'stroke-width': 1.6}, g));
        var m = drawable(S('path', {d: 'M317.5 ' + (y - 5) + 'l3 3 6-6.5', fill: 'none', stroke: C.ok, 'stroke-width': 2, 'stroke-linecap': 'round', 'data-p': 'ck' + i}, g));
        var tx = T(g, 338, y, s, {size: 13, w: 600}); return {ring: rr, m: m, tx: tx};
      });
      var seal = S('g', {}, g);
      S('circle', {cx: 0, cy: 0, r: 30, fill: C.ok, opacity: .1}, seal);
      var sr = drawable(S('circle', {cx: 0, cy: 0, r: 30, fill: 'none', stroke: C.ok, 'stroke-width': 2}, seal));
      var st = T(seal, 0, 6, x.sealed, {size: 16, fam: FX, w: 400, fill: C.ok, anchor: 'middle', ls: '.04em'});
      st.setAttribute('data-p', 'seal');
      tr(seal, 382, 250);
      // Carril apagado hacia Production: aquí NO se enciende (falta la revisión de E5 y la mía de E7)
      var lane = S('g', {}, g);
      S('path', {d: 'M455 179H479', stroke: C.line, 'stroke-width': 1.6, 'stroke-dasharray': '3 3'}, lane);
      S('path', {d: 'M476 174.5l5 4.5-5 4.5', fill: 'none', stroke: C.line, 'stroke-width': 1.6, 'stroke-linecap': 'round'}, lane);
      var prod = envFrame(g, 486, 60, 132, 238, x.prod);
      S('rect', {x: 492, y: 94, width: 120, height: 200, rx: 8, fill: 'none', stroke: C.line, 'stroke-dasharray': '4 4'}, prod.g);
      envState(prod, 'off'); prod.box.setAttribute('data-p', 'prod');
      var fly = cardComp(g); fly.setAttribute('data-p', 'fly');
      var cur = cursor(g, C.dev8);
      return function (t) {
        var a = sg(t, .2, .55); op(dsm, a); dsm.setAttribute('transform', 'translate(0 ' + ((1 - a) * 8).toFixed(2) + ')');
        op(tok, sg(t, .45, .85));
        var dim = .4 + .6 * (1 - sg(t, 1.5, 1.8));
        cmp.forEach(function (c, i) { var p = sg(t, .7 + i * .15, 1.0 + i * .15); op(c, p * (c === base ? (t < 2.3 ? 1 : dim) : dim)); });
        draw(ring, sg(t, 1.5, 1.9, lin)); op(ring, 1 - sg(t, 2.6, 2.9));
        var s1 = sg(t, 1.85, 2.25); op(stg.g, s1); stg.g.setAttribute('transform', 'translate(0 ' + ((1 - s1) * 8).toFixed(2) + ')');
        var p = sg(t, 2.3, 2.95, eio), arc = Math.sin(Math.PI * p);
        var fx = L(34, 186, p), fy = L(194, 140, p) - 38 * arc;
        tr(fly, fx, fy, 1 + .08 * arc); op(fly, t < 2.3 ? 0 : 1);
        op(scr.slot, 1 - sg(t, 2.85, 2.95));
        op(flash, sg(t, 2.95, 3.05) * (1 - sg(t, 3.2, 3.5)));
        envState(stg, t >= 4.5 ? 'ok' : (t >= 2.95 ? 'now' : 'idle'));
        var cx0 = t < 2.3 ? L(150, 92, sg(t, 1.5, 1.85)) : fx + 70, cy0 = t < 2.3 ? L(250, 226, sg(t, 1.5, 1.85)) : fy + 34;
        tr(cur, cx0, cy0); op(cur, sg(t, 1.5, 1.65) * (1 - sg(t, 3.0, 3.15)));
        op(ckh, sg(t, 3.1, 3.3));
        ck.forEach(function (c, i) { var a2 = 3.15 + i * .3; draw(c.ring, sg(t, a2, a2 + .25, lin)); draw(c.m, sg(t, a2 + .2, a2 + .35, lin)); op(c.tx, sg(t, a2, a2 + .2)); });
        draw(sr, sg(t, 4.15, 4.5, lin)); op(seal, t < 4.15 ? 0 : 1);
        var ps = sg(t, 4.45, 4.75); op(st, ps); st.setAttribute('transform', 'scale(' + L(1.15, 1, ps).toFixed(3) + ')');
        op(lane, sg(t, 4.8, 5.0)); op(prod.g, sg(t, 4.85, 5.2));
      };
    }});

  // E5 · Revisión y vuelta — 10,0 s. Rótulo 1 a 0,2: barrido y 4 marcas; «sin datos» falla en rojo (0,4–3,2).
  // Rótulo 2 a 3,5: la nota sale de la fila roja (3,5–4,1) y viaja hasta Dev 8 (4,1–4,9) · Dev 8 escribe el texto en su pantalla (4,9–6,2) ·
  // la marca «Round 2» sale de la pantalla y viaja hasta la fila que falló (6,2–7,4). Rótulo 3 a 7,4: re-medición, rojo → verde (7,4–8,2) · «VERIFIED» (8,3–8,7).
  // Bandeja: la nota, ya entregada, se aparta junto al hueco que arregló (5,95–6,25); la bandeja «Lección por aprender» se abre (7,5–7,8);
  // con la fila en verde la nota viaja a la bandeja y queda guardada (8,05–8,75, rodeando la pantalla y los chips) · la bandeja destella (8,75–9,0). Quieto desde 9,0.
  SC.push({id: 'verify', dur: 10.0, caps: [.2, 3.5, 7.4],
    build: function (g, x, ov) {
      chip(g, 40, 36, x.dev, C.dev8);
      var vf = chip(g, 330, 36, x.vf, C.v5);
      var card = mini(g);
      tr(card, 150, 110);
      // El hueco del estado vacío en la pantalla de Dev 8 (12, 84 · 116 × 15): falla, recibe su texto y se resalta
      var eBox = S('rect', {x: 12, y: 84, width: 116, height: 15, rx: 4, fill: 'none', stroke: C.err, 'stroke-width': 1.6, opacity: 0}, card);
      var eGlow = S('rect', {x: 8, y: 80, width: 124, height: 23, rx: 6, fill: C.warn, opacity: 0}, card);
      var EMPTY = x.empty, eTx = T(card, PH ? 16 : 18, PH ? 95.5 : 95, '', {size: PH ? 11 : 9.5, w: 600, fill: C.text}), CW = PH ? 6.3 : 5.6;   // [portafolio] teléfono: 11
      eTx.setAttribute('data-p', 'empty');
      var dcur = cursor(card, C.dev8);
      var pulse = S('rect', {x: -3, y: -3, width: 146, height: 156, rx: 12, fill: 'none', stroke: C.dev8, 'stroke-width': 2, opacity: 0}, card);
      var scan = S('g', {}, card);
      S('rect', {x: 0, y: -3, width: 140, height: 6, fill: C.v5, opacity: .22}, scan);
      S('rect', {x: 0, y: -.75, width: 140, height: 1.5, fill: C.v5}, scan);
      T(g, 346, 98, x.crit, {size: 11, fill: C.muted, w: 600, ls: '.12em'});
      T(g, 600, 98, x.evid, {size: 11, fill: C.muted, w: 600, ls: '.12em', anchor: 'end'});
      // Estelas detrás de las filas (no tachan los textos). Ida: la nota nace sobre la fila roja y viaja (con su estela ámbar) hasta quedar bajo la pantalla de Dev 8
      var nw = x.fix.length * 7.4 + 22, n0 = [346, 189], n1 = [220 - nw / 2, 268], nc = [330, 292];
      function qb(a, c, b, p) { var q = 1 - p; return [q * q * a[0] + 2 * q * p * c[0] + p * p * b[0], q * q * a[1] + 2 * q * p * c[1] + p * p * b[1]]; }
      var trailA = drawable(S('path', {d: 'M' + (n0[0] + nw / 2) + ' ' + (n0[1] + 13) + 'Q' + (nc[0] + nw / 2) + ' ' + (nc[1] + 13) + ' ' + (n1[0] + nw / 2) + ' ' + (n1[1] + 13), fill: 'none', stroke: C.warn, 'stroke-width': 1.6}, g));
      // Vuelta: «Round 2» sale del mismo lugar y vuelve hasta quedar junto al criterio que falló, antes de su marca
      var rw = x.round.length * 7.6 + 38, r0 = [220 - rw / 2, 268], r1 = [572 - rw, 188], rc = [300, 250];
      var trailB = drawable(S('path', {d: 'M' + (r0[0] + rw / 2) + ' ' + (r0[1] + 14) + 'Q' + (rc[0] + rw / 2) + ' ' + (rc[1] + 14) + ' ' + (r1[0] + rw / 2) + ' ' + (r1[1] + 14), fill: 'none', stroke: C.cyan, 'stroke-width': 1.6}, g));
      var R = x.rows.map(function (s, i) {
        var y = 132 + i * 38, r = S('g', {}, g);
        var bgr = S('rect', {x: 330, y: y - 22, width: 280, height: 32, rx: 6, fill: C.sf, stroke: C.line}, r);
        T(r, 346, y - 1, s, {size: 14});
        var pend = S('circle', {cx: 590, cy: y - 6, r: 7, fill: 'none', stroke: C.line, 'stroke-width': 1.5}, r);
        var ok = tick(r, 590, y - 6, C.ok), bad = i === 2 ? cross(r, 590, y - 6) : null;
        return {bgr: bgr, pend: pend, ok: ok, bad: bad, at: 1.9 + i * .35};
      });
      var hl = S('rect', {x: 328, y: 186, width: 284, height: 36, rx: 7, fill: 'none', stroke: C.v5, 'stroke-width': 2, opacity: 0}, g);
      var tb = lessonTray(ov);
      var nt = note(ov, x.fix); nt.setAttribute('data-p', 'fix');   // en ov: viaja por encima de todo y queda sobre la bandeja
      var pk = [Math.max(4, 144 - nw * TRAY_S), 194.7], tz = [tb.G.sx, tb.G.sy];
      // Ruta a la bandeja sin pasar por encima de nada: sube por la izquierda (antes de la pantalla), cruza bajo el chip de Dev 8,
      // sube por el hueco entre los dos chips y entra a la bandeja por arriba. Esquinas achaflanadas; velocidad pareja por largo de tramo.
      var RT = [pk, [pk[0], 92], [pk[0] + 14, 78], [186, 78], [200, 64], [200, 24], [186, tz[1]], tz];
      // [portafolio] teléfono: a escala 0,85 la nota no cabe a la izquierda de la pantalla; se aparta arriba de ella (libre entre el chip y la pantalla)
      // y de ahí sube derecho a la bandeja fija de la franja superior (la cámara ya volvió al borde izquierdo: ver CAM de E5)
      if (PH) { pk = [150, 77]; RT = [pk, [pk[0] - 20, 70], [tz[0] + 12, tz[1] + 12], tz]; }
      var RL = [0]; for (var ri = 1; ri < RT.length; ri++) RL.push(RL[ri - 1] + Math.hypot(RT[ri][0] - RT[ri - 1][0], RT[ri][1] - RT[ri - 1][1]));
      function along(p) { var d = p * RL[RL.length - 1], i = 1; while (i < RL.length - 1 && RL[i] < d) i++; var f = (d - RL[i - 1]) / ((RL[i] - RL[i - 1]) || 1); return [L(RT[i - 1][0], RT[i][0], f), L(RT[i - 1][1], RT[i][1], f)]; }
      var round = chip(g, r0[0], r0[1], x.round, C.cyan, {outline: true}); round.g.setAttribute('data-p', 'round');
      round.g.insertBefore(S('rect', {x: 0, y: 0, width: rw, height: 28, rx: 14, fill: C.bg1}), round.g.firstChild);
      var badge = S('g', {}, g), bw = Math.max(96, x.verified.length * 9 + 22);
      S('rect', {x: -bw / 2, y: -15, width: bw, height: 30, rx: 6, fill: '#062014', stroke: C.ok, 'stroke-width': 1.5}, badge);
      T(badge, 0, 7, x.verified, {size: 16, fam: FX, w: 400, fill: C.ok, anchor: 'middle', ls: '.05em'}).setAttribute('data-p', 'verified');
      return function (t) {
        op(vf.g, sg(t, .1, .4));
        // 1 · barrido y marcas; la fila 3 falla y el hueco de la pantalla se marca en rojo
        var sA = sg(t, .4, 1.8, lin), sB = sg(t, 7.4, 8.0, lin), inA = t > .35 && t < 1.85, inB = t > 7.35 && t < 8.05;
        tr(scan, 0, 150 * (inB ? sB : sA)); op(scan, inA || inB ? 1 : 0);
        R.forEach(function (r) {
          var done = t >= r.at; op(r.pend, done ? 0 : 1);
          if (r.bad) {
            op(r.bad, done ? sg(t, r.at, r.at + .2) * (1 - sg(t, 7.95, 8.1)) : 0); op(r.ok, sg(t, 8.0, 8.2));
            r.bgr.setAttribute('stroke', t >= 8.0 ? C.ok : (t >= r.at ? C.err : C.line)); r.bgr.setAttribute('stroke-width', t >= r.at ? 1.5 : 1);
          } else op(r.ok, done ? sg(t, r.at, r.at + .2) : 0);
        });
        var fail = R[2].at;
        eBox.setAttribute('stroke', t < 5.0 ? C.err : (t < 6.5 ? C.warn : C.ok));
        op(eBox, t < 6.2 ? sg(t, fail, fail + .25) : (1 - sg(t, 6.2, 6.5)) + sg(t, 8.0, 8.2));
        // 2 · la nota sale de la fila roja y viaja hasta Dev 8
        var pop = sg(t, 3.5, 3.8), mv = sg(t, 4.1, 4.9, eio), np = qb(n0, nc, n1, mv);
        if (t < 5.95) tr(nt, np[0], np[1], L(.85, 1, pop));
        else if (t < 8.05) { var pp = sg(t, 5.95, 6.25, eio); tr(nt, L(n1[0], pk[0], pp), L(n1[1], pk[1], pp), L(1, TRAY_S, pp)); }
        else { var tq = along(sg(t, 8.05, 8.75, eio)); tr(nt, tq[0], tq[1], TRAY_S); }
        op(nt, pop);
        // la bandeja se abre vacía, recibe la nota y destella
        op(tb.g, sg(t, 7.5, 7.8)); tb.held(t >= 8.75);
        op(tb.glow, sg(t, 8.75, 8.85) * (1 - sg(t, 8.85, 9.0)));
        draw(trailA, mv); op(trailA, (t > 4.1 ? .8 : 0) * (1 - sg(t, 6.0, 6.3)));
        op(pulse, t > 4.85 && t < 5.35 ? .3 + .7 * Math.abs(Math.sin((t - 4.85) * 6.3)) : 0);
        // 3 · Dev 8 escribe el texto del estado vacío; el hueco se resalta un instante
        eTx.textContent = EMPTY.slice(0, Math.round(EMPTY.length * sg(t, 5.15, 5.85, lin)));
        op(eGlow, sg(t, 5.85, 5.95) * .28 * (1 - sg(t, 6.0, 6.4)));
        var cxp = 22 + EMPTY.length * CW * sg(t, 5.15, 5.85, lin);
        tr(dcur, t < 5.15 ? L(120, 22, sg(t, 4.95, 5.15)) : cxp, t < 5.15 ? L(140, 96, sg(t, 4.95, 5.15)) : 96); op(dcur, sg(t, 4.95, 5.05) * (1 - sg(t, 5.95, 6.1)));
        // 4 · «Round 2» aparece bajo la pantalla y vuelve hasta la fila que falló
        var rp = sg(t, 6.2, 6.5), rm = sg(t, 6.6, 7.4, eio), rq = qb(r0, rc, r1, rm);
        tr(round.g, rq[0], rq[1] + (1 - rp) * 6); op(round.g, rp);
        draw(trailB, rm); op(trailB, (t > 6.6 ? .8 : 0) * (1 - sg(t, 8.0, 8.4)));
        // 5 · re-medición: la fila pasa a verde y entra «VERIFIED» bajo la pantalla
        op(hl, sg(t, 7.4, 7.55) * (1 - sg(t, 7.85, 8.05)));
        var b = sg(t, 8.3, 8.7); op(badge, b); badge.setAttribute('transform', 'translate(220 283) scale(' + L(1.2, 1, b).toFixed(3) + ')');
      };
    }});

  // E6 · ¿Cómo vamos? — 3,8 s. 3 indicadores con su cifra, escalonados 0,2 s (0,2–1,4) · barras en ola (1,4–2,1) · visor (2,1–2,4).
  SC.push({id: 'numbers', dur: 3.8, caps: [.2],
    build: function (g, x, ov) {
      trayHeld(ov);
      T(g, 40, 58, x.head, {size: 12, fill: C.muted, w: 600, ls: '.12em'});
      var sw = x.sample.length * 7.6 + 38;
      chip(g, Math.min(498, 620 - sw), 38, x.sample, C.muted, {outline: true});
      var H = [[30, 45, 20, 55, 35, 10, 60, 40, 70, 50, 42, 100], [60, 20, 40, 70, 30, 50, 45, 25, 60, 35, 55, 48], [80, 65, 72, 58, 60, 66, 50, 55, 48, 52, 44, 40]];
      var K = [[12, 0, ''], [1.4, 1, ''], [1.6, 1, ' h']].map(function (k, i) {
        var g2 = S('g', {}, g), gx = 40 + i * 196;
        S('rect', {x: 0, y: 0, width: 170, height: 200, rx: 12, fill: C.sf, stroke: C.line}, g2);
        T(g2, 16, 30, x.k[i], {size: 11, fill: C.muted, w: 600, ls: '.08em'});
        var v = T(g2, 16, 86, '0', {size: 46, w: 600});
        T(g2, 16, 110, x.sub[i], {size: 12, fill: C.muted});
        S('path', {d: 'M16 182h138', stroke: C.line}, g2);
        var bars = H[i].map(function (h, j) { return S('rect', {x: 16 + j * 11.6, y: 182, width: 8, height: 0, rx: 1.5, fill: C.cyan, opacity: j === 11 ? 1 : .42}, g2); });
        return {g: g2, x: gx, v: v, to: k[0], dec: k[1], suf: k[2], bars: bars, h: H[i]};
      });
      var br = S('g', {}, g), bx = 236 - 6, by = 84, bw = 182, bh = 212;
      [[0, 0, 1, 1], [bw, 0, -1, 1], [0, bh, 1, -1], [bw, bh, -1, -1]].forEach(function (c) { S('path', {d: 'M' + (c[0] + 14 * c[2]) + ' ' + c[1] + 'H' + c[0] + 'V' + (c[1] + 14 * c[3]), fill: 'none', stroke: C.cyan, 'stroke-width': 2}, br); });
      return function (t) {
        K.forEach(function (k, i) {
          var p = sg(t, .2 + i * .2, .55 + i * .2); op(k.g, p); tr(k.g, k.x, 90 + (1 - p) * 12);
          var c = sg(t, .3 + i * .2, 1.0 + i * .2); k.v.textContent = nf(k.to * c, k.dec) + k.suf;
          k.bars.forEach(function (b, j) { var a = 1.4 + j * .025 + i * .07, hh = 50 * k.h[j] / 100 * sg(t, a, a + .28); b.setAttribute('height', hh.toFixed(1)); b.setAttribute('y', (182 - hh).toFixed(1)); });
        });
        var q = sg(t, 2.1, 2.4); op(br, q); br.setAttribute('transform', 'translate(' + (bx - 8 * (1 - q)) + ' ' + (by - 8 * (1 - q)) + ') scale(' + L(1.09, 1, q).toFixed(3) + ')');
      };
    }});

  // E7 · Revisión y salida — 4,2 s. Cortex + globo + onda (0,2–1,4) · visto (1,5–1,8) · marco Staging → Production de E4 (1,7–1,95) ·
  // la pantalla sellada viaja por el carril (1,95–2,7) · Production se enciende (2,65–3,0). Quieto desde 3,0.
  SC.push({id: 'ship', dur: 4.2, caps: [.2],
    build: function (g, x, ov) {
      trayHeld(ov);
      var cx = S('g', {}, g);
      S('circle', {cx: 80, cy: 118, r: 26, fill: C.cortex, opacity: .2}, cx);
      S('circle', {cx: 80, cy: 118, r: 26, fill: 'none', stroke: C.cortex, 'stroke-width': 1.6}, cx);
      T(cx, 80, 124, 'C', {size: 18, fam: FX, w: 400, anchor: 'middle', fill: C.cortex});
      T(cx, 80, 166, 'Cortex', {size: 13, anchor: 'middle', w: 600});
      var bub = S('g', {}, g);
      S('rect', {x: 124, y: 88, width: 384, height: 60, rx: 14, fill: C.sf, stroke: C.line}, bub);
      S('path', {d: 'M124 110l-12 8 12 8', fill: C.sf, stroke: C.line}, bub);
      S('rect', {x: 125, y: 108, width: 3, height: 20, fill: C.sf}, bub);
      var wv = []; for (var k = 0; k < 15; k++) wv.push(S('rect', {x: 142 + k * 8.6, y: 116, width: 4.5, height: 4, rx: 2, fill: C.cortex}, bub));
      var say = T(bub, 282, 124, x.say, {size: 15, w: 600});
      var me = S('g', {}, g);
      S('circle', {cx: 572, cy: 118, r: 26, fill: C.sf, stroke: C.text, 'stroke-width': 1.4}, me);
      T(me, 572, 125, 'AG', {size: 18, fam: FX, w: 400, anchor: 'middle'});
      T(me, 572, 166, x.me, {size: 13, anchor: 'middle', w: 600});
      var ok = tick(g, 596, 96, C.ok);
      // El mismo marco Staging → Production de E4 (mismo dibujo, a escala): Staging sellada, Production apagada hasta mi visto
      var SS = .34, eg = S('g', {}, g);
      var stg = envFrame(eg, 120, 186, 180, 110, x.st[0]); envState(stg, 'ok');
      var s1 = screenMock(stg.g, true); tr(s1.g, 134, 222, SS);
      var seal = S('g', {}, stg.g);
      S('circle', {cx: 0, cy: 0, r: 17, fill: C.ok, opacity: .1}, seal);
      S('circle', {cx: 0, cy: 0, r: 17, fill: 'none', stroke: C.ok, 'stroke-width': 1.6}, seal);
      S('path', {d: 'M-6 0l4 4 8-8.5', fill: 'none', stroke: C.ok, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}, seal);
      tr(seal, 240, 256);
      var track = S('path', {d: 'M304 241H346', stroke: C.line, 'stroke-width': 1.6, 'stroke-dasharray': '3 3'}, eg);
      var prog = S('path', {d: 'M304 241H346', stroke: C.ok, 'stroke-width': 2, 'stroke-dasharray': '42 42', 'stroke-dashoffset': 42}, eg);
      var prod = envFrame(eg, 350, 186, 180, 110, x.st[1]); envState(prod, 'off'); prod.box.setAttribute('data-p', 'prod');
      var ghost = S('rect', {x: 364, y: 222, width: 120 * SS, height: 200 * SS, rx: 3, fill: 'none', stroke: C.line, 'stroke-dasharray': '3 3'}, prod.g);
      var s2 = screenMock(prod.g, true); tr(s2.g, 364, 222, SS);
      var live = S('g', {}, prod.g);
      S('circle', {cx: 0, cy: 0, r: 17, fill: C.ok, opacity: .1}, live);
      S('circle', {cx: 0, cy: 0, r: 17, fill: 'none', stroke: C.ok, 'stroke-width': 1.6}, live);
      S('path', {d: 'M-6 0l4 4 8-8.5', fill: 'none', stroke: C.ok, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'}, live);
      tr(live, 470, 256);
      var mov = screenMock(eg, true);
      return function (t) {
        op(cx, sg(t, .2, .45)); op(bub, sg(t, .25, .5)); op(me, sg(t, .3, .55));
        var env = sg(t, .3, .5) * (1 - sg(t, 1.2, 1.4));
        wv.forEach(function (b, k) { var h = 4 + 22 * env * Math.abs(Math.sin(t * 9 + k * .75)) * (.55 + .45 * Math.abs(Math.sin(k * 1.7))); b.setAttribute('height', h.toFixed(1)); b.setAttribute('y', (118 - h / 2).toFixed(1)); });
        op(say, sg(t, .45, .7));
        var oq = sg(t, 1.5, 1.8); op(ok, oq); tr(ok, 0, (1 - oq) * 4);
        op(eg, sg(t, 1.7, 1.95));
        // Tras mi visto, una copia de la pantalla sellada viaja por el carril y Production se enciende
        var p = sg(t, 1.95, 2.7, eio), mx = L(134, 364, p), my = 222 - 22 * Math.sin(Math.PI * p);
        tr(mov.g, mx, my, SS); op(mov.g, t > 1.95 && t < 2.75 ? 1 : 0);
        prog.setAttribute('stroke-dashoffset', (42 * (1 - sg(t, 2.1, 2.6, lin))).toFixed(1));
        var on = sg(t, 2.65, 3.0);
        envState(prod, t >= 2.7 ? 'ok' : 'off');
        op(s2.g, t >= 2.7 ? 1 : 0); op(ghost, 1 - on);
        op(live, on); live.setAttribute('transform', 'translate(470 256) scale(' + L(1.2, 1, on).toFixed(3) + ')');
      };
    }});

  // E8 · Lección — 5,8 s. La nota sale de la bandeja «Lección por aprender» y se pone frente a Cortex (0,35–1,0) ·
  // SE REVISA: Cortex la mira (enlace) y una lupa la barre (1,0–2,0) · SE APRENDE: la nota amarilla se encoge y se vuelve la línea cian «+ lección» (2,0–2,8) ·
  // ENTRA AL SKILL: la línea viaja a la ficha «Skill · Dev», se inserta, la ficha destella y sube de versión v4 → v5 (2,8–3,9) ·
  // «decision logged» (3,7–4,0) · lazo violeta + «next start loads it» (4,0–4,8). La bandeja queda vacía. Quieto desde 4,8.
  SC.push({id: 'lesson', dur: 5.8, caps: [.2],
    build: function (g, x, ov) {
      var ring = S('g', {}, g);
      S('circle', {cx: 0, cy: 0, r: 48, fill: C.cortex, opacity: .08}, ring);
      var dash = S('circle', {cx: 0, cy: 0, r: 48, fill: 'none', stroke: C.cortex, 'stroke-width': 2, 'stroke-dasharray': '7 6'}, ring);
      tr(ring, 320, 170);
      T(g, 320, 168, 'Cortex', {size: 15, w: 600, anchor: 'middle'});
      // Bajo «Cortex», lo que está haciendo: memoria → revisando → aprendiendo → memoria
      var sub = [x.mem, x.rev, x.learn].map(function (s, i) { var e = T(g, 320, 188, s, {size: 12, fill: i ? C.cortex : C.muted, anchor: 'middle', w: i ? 600 : 500}); e.setAttribute('data-p', 'sub' + i); return e; });
      // La ficha del skill: brillo breve y marca de versión cuando la lección entra
      var skBox = S('rect', {x: 466, y: 110, width: 146, height: 124, rx: 10, fill: C.sf, stroke: C.line}, g);
      var skGlow = S('rect', {x: 462, y: 106, width: 154, height: 132, rx: 13, fill: 'none', stroke: C.cyan, 'stroke-width': 2.2, opacity: 0}, g);
      T(g, 482, 136, x.skill, {size: 14, w: 600});
      var ver = S('g', {'data-p': 'ver'}, g);
      var verR = S('rect', {x: -14, y: -9, width: 28, height: 18, rx: 9, fill: C.sf2, stroke: C.line}, ver);
      var v4 = T(ver, 0, 4.2, 'v4', {size: 11, w: 600, fill: C.muted, anchor: 'middle'});
      var v5 = T(ver, 0, 4.2, 'v5', {size: 11, w: 600, fill: C.cyan, anchor: 'middle'});
      [152, 168, 184].forEach(function (y, i) { S('rect', {x: 482, y: y, width: [104, 86, 96][i], height: 6, rx: 3, fill: C.sf2}, g); });
      var nl = S('rect', {x: 482, y: 200, width: 0, height: 6, rx: 3, fill: C.cyan}, g);
      var ntx = T(g, 482, 224, x.lesson, {size: 12, fill: C.cyan, w: 600});
      var dec = chip(g, 258, 236, x.dec, C.cortex);
      var loop = drawable(S('path', {d: 'M540 236 C 540 290, 420 300, 300 300 S 80 296, 80 210', fill: 'none', stroke: '#A78BFA', 'stroke-width': 1.6, 'stroke-dasharray': '1'}, g));
      var lt = T(g, 330, 288, x.next, {size: 12, fill: C.muted});
      // Enlace Cortex → nota mientras la revisa
      var link = S('path', {d: 'M320 121V109', stroke: C.cortex, 'stroke-width': 1.6, 'stroke-dasharray': '2 3'}, g);
      // La bandeja y la nota que sale de ella (en ov: misma posición que en E5–E7, sin fundido al entrar)
      var tb = lessonTray(ov), G = tb.G, nw = G.nw;
      var nt = note(ov, G.fx); nt.setAttribute('data-p', 'fix'); var ntT = nt.lastChild;
      var EX = [320 - nw / 2, 80];   // frente a Cortex, sobre el anillo
      // Barrido de la revisión: banda + lupa (Cortex)
      var band = S('rect', {x: -5, y: 78, width: 10, height: 30, rx: 3, fill: C.cortex, opacity: 0}, ov);
      var lens = S('g', {'data-p': 'lens'}, ov);
      S('circle', {cx: 0, cy: 0, r: 12, fill: 'rgba(91,141,239,.14)', stroke: C.cortex, 'stroke-width': 2.2}, lens);
      S('path', {d: 'M8.5 8.5L17 17', stroke: C.cortex, 'stroke-width': 3, 'stroke-linecap': 'round'}, lens);
      // La lección: línea cian «+ lección» que nace de la nota
      var lw = x.lesson.length * 7.4 + 24, lp = S('g', {'data-p': 'lesson'}, ov);
      S('rect', {x: 0, y: 0, width: lw, height: 26, rx: 13, fill: '#062027', stroke: C.cyan, 'stroke-width': 1.4}, lp);
      T(lp, lw / 2, 17.5, x.lesson, {size: 13, w: 600, fill: C.cyan, anchor: 'middle'});
      var lpGlow = S('rect', {x: -4, y: -4, width: lw + 8, height: 34, rx: 17, fill: 'none', stroke: C.cyan, 'stroke-width': 1.6, opacity: 0}, lp);
      var LX = [320 - lw / 2, 80], LZ = [482, 194], LC = [440, 70];
      function qb(a, c, b, p) { var q = 1 - p; return [q * q * a[0] + 2 * q * p * c[0] + p * p * b[0], q * q * a[1] + 2 * q * p * c[1] + p * p * b[1]]; }
      return function (t) {
        dash.setAttribute('transform', 'rotate(' + (Math.min(t, 4.8) * 40 + 160 * sg(t, 1.0, 2.0, lin)).toFixed(1) + ')');
        ring.setAttribute('transform', 'translate(320 170) scale(' + (1 + .08 * Math.sin(Math.PI * sg(t, 2.3, 2.75, lin))).toFixed(3) + ')');
        // Bandeja: con la nota hasta que sale; después vacía
        tb.held(t < .4);
        // 1 · sale de la bandeja y se pone frente a Cortex
        var o = sg(t, .35, 1.0, eio), ox = L(G.sx, EX[0], o), oy = L(G.sy, EX[1], o) - 14 * Math.sin(Math.PI * o);
        var squash = sg(t, 2.05, 2.45, eio), kx = L(1, lw / nw, squash), sc = L(TRAY_S, 1, o);
        nt.setAttribute('transform', 'translate(' + (ox + nw * (1 - kx) / 2).toFixed(2) + ' ' + oy.toFixed(2) + ') scale(' + (sc * kx).toFixed(3) + ' ' + sc.toFixed(3) + ')');
        op(ntT, 1 - sg(t, 2.0, 2.2)); op(nt, 1 - sg(t, 2.4, 2.6));
        // 2 · se revisa: enlace con Cortex y lupa que barre la nota
        var sw = sg(t, 1.1, 1.9, eio), lx = EX[0] + 6 + (nw - 12) * sw, inR = t > 1.0 && t < 2.05;
        op(link, sg(t, 1.0, 1.15) * (1 - sg(t, 2.6, 2.8)));
        tr(lens, lx, 93); op(lens, inR ? sg(t, 1.0, 1.12) * (1 - sg(t, 1.9, 2.05)) : 0);
        tr(band, lx, 0); op(band, inR ? .22 * sg(t, 1.0, 1.12) * (1 - sg(t, 1.9, 2.05)) : 0);
        var s1 = t >= 1.0 && t < 2.0 ? 1 : 0, s2 = t >= 2.0 && t < 2.9 ? 1 : 0;
        op(sub[1], s1 * sg(t, 1.0, 1.15)); op(sub[2], s2 * sg(t, 2.0, 2.15)); op(sub[0], 1 - s1 - s2);
        // 3 · se aprende: la nota amarilla se vuelve la línea cian
        var a = sg(t, 2.35, 2.6), m = sg(t, 2.85, 3.4, eio), mp = qb(LX, LC, LZ, m);
        // [portafolio] teléfono: se achica menos (texto ≥ 11 px). El op(lp, …) va en su propia sentencia: al integrar quedó dentro de este
        // comentario y la píldora «+ lección» se veía desde el inicio de E8, encima de la ficha (regresión vista por el dueño el 14-11).
        tr(lp, mp[0], mp[1], L(1, PH ? .85 : .7, m)); op(lp, a * (1 - sg(t, 3.3, 3.45)));
        op(lpGlow, sg(t, 2.45, 2.6) * (1 - sg(t, 2.7, 2.95)));
        // 4 · entra al skill: la línea se inserta, la ficha destella y sube de versión
        nl.setAttribute('width', (100 * sg(t, 3.25, 3.6)).toFixed(1)); op(ntx, sg(t, 3.4, 3.6));
        op(skGlow, sg(t, 3.45, 3.6) * (1 - sg(t, 3.75, 4.2)));
        skBox.setAttribute('stroke', t >= 3.45 ? C.cyan : C.line);
        var vp = sg(t, 3.5, 3.75); op(v4, 1 - sg(t, 3.5, 3.6)); op(v5, vp);
        verR.setAttribute('stroke', t >= 3.5 ? C.cyan : C.line);
        ver.setAttribute('transform', 'translate(590 131) scale(' + (1 + .25 * Math.sin(Math.PI * vp)).toFixed(3) + ')');
        // 5 · cierre existente
        op(dec.g, sg(t, 3.7, 4.0));
        draw(loop, sg(t, 4.0, 4.8, lin)); op(loop, t > 4.0 ? 1 : 0); op(lt, sg(t, 4.4, 4.8));   // oculto hasta dibujarse: sin punto suelto en (80, 210)
      };
    }});

  /* ───────── Reproductor ───────── */
  function bg(svg) {
    var id = 'dots' + (++uid), d = S('defs', {}, svg), p = S('pattern', {id: id, width: 20, height: 20, patternUnits: 'userSpaceOnUse'}, d);
    S('circle', {cx: 1, cy: 1, r: .9, fill: '#1A222D'}, p);
    S('rect', {x: 0, y: -HB, width: 640, height: 360 + HB, fill: C.bg}, svg);   // [portafolio] cubre también la franja del teléfono (fuera de vista en escritorio)
    S('rect', {x: 0, y: -HB, width: 640, height: 360 + HB, fill: 'url(#' + id + ')'}, svg);
    [[14, 14, 1, 1], [626, 14, -1, 1], [14, 346, 1, -1], [626, 346, -1, -1]].forEach(function (c) { S('path', {d: 'M' + (c[0] + 12 * c[2]) + ' ' + c[1] + 'H' + c[0] + 'V' + (c[1] + 12 * c[3]), fill: 'none', stroke: C.cyan, 'stroke-width': 1.2, opacity: .45}, svg); });
  }

  /* [portafolio] Cámara del modo teléfono: por escena, [segundo local, centro x en el cuadro de 640]. Entre claves, ease in-out;
   * el centro se acota para que la vista nunca salga del cuadro (0 = borde izquierdo, 640 = borde derecho). La cámara va donde ocurre
   * la acción de cada tramo (los tiempos son los de update(t) de cada escena); en E5 vuelve al borde izquierdo antes de que el arreglo
   * suba a la bandeja (8,05 s) y en E8 sale de ahí cuando el arreglo deja la bandeja (0,35 s). */
  var CAM = [
    [[0, 200], [.9, 200], [1.4, 310], [2.4, 310], [2.9, 440]],                                   // E1 encargo · tarjeta · «completo»
    [[0, 170], [1.3, 170], [2.1, 465]],                                                          // E2 fila · plan del TL
    [[0, 172], [.5, 172], [1.2, 468]],                                                           // E3 PC 1 · Dev 8 + PC 3
    [[0, 172], [2.95, 172], [3.3, 300], [4.75, 300], [5.2, 468]],                                // E4 sistema de diseño · controles · Production
    [[0, 300], [1.6, 300], [2.0, 470], [3.9, 470], [4.9, 220], [6.6, 220], [7.4, 470], [8.0, 470], [8.55, 0]],   // E5
    [[0, 172], [.8, 172], [1.3, 468], [1.8, 468], [2.2, 321]],                                   // E6 tres cifras · visor en «vueltas»
    [[0, 172], [.45, 172], [1.2, 440], [1.7, 440], [2.0, 230], [2.7, 400]],                      // E7 Cortex · yo · Staging → Production
    [[0, 0], [.35, 0], [1.0, 320], [2.85, 320], [3.4, 468], [3.7, 468], [4.3, 360]]              // E8 bandeja · Cortex · skill · cierre
  ];
  function camAt(n, t) {
    var k = CAM[n] || [[0, 320]];
    if (t <= k[0][0]) return k[0][1];
    for (var i = 1; i < k.length; i++) if (t <= k[i][0]) return L(k[i - 1][1], k[i][1], eio((t - k[i - 1][0]) / (k[i][0] - k[i - 1][0])));
    return k[k.length - 1][1];
  }

  function Player(stage, idxs, o) {
    o = o || {};
    var svg = S('svg', {viewBox: '0 0 640 360', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid meet'});
    stage.insertBefore(svg, stage.firstChild);
    bg(svg);
    var layer = S('g', {}, svg);
    var cap = stage.querySelector('.cap__in'), tag = stage.querySelector('.sc-tag');
    if (cap) cap.style.opacity = 0;
    var acc = 0, Ls = idxs.map(function (i) { var st = acc; acc += SC[i].dur; return {sc: SC[i], st: st, n: i, g: null, up: null}; });
    var total = Math.round(acc * 1000) / 1000, T0 = 0, playing = false, raf = 0, last = 0, lastCap = null, shown = false;
    var EV = [];
    Ls.forEach(function (l) { l.sc.caps.forEach(function (ct, j) { EV.push({t: l.st + ct, n: l.n, j: j}); }); });
    function build() {
      while (layer.firstChild) layer.removeChild(layer.firstChild);
      // ov: capa de la escena que NO hace el fundido de entrada (la bandeja «Lección por aprender» se ve quieta al cambiar de escena)
      Ls.forEach(function (l) { l.g = S('g', {}, layer); l.ov = S('g', {}, layer); l.up = l.sc.build(l.g, X().sc[l.n], l.ov); });
      lastCap = null;
    }
    build();
    function sceneAt(Tm) { for (var i = 0; i < Ls.length; i++) if (Tm < Ls[i].st + Ls[i].sc.dur) return i; return Ls.length - 1; }
    function render(Tm) {
      shown = true;
      var k = sceneAt(Tm);
      Ls.forEach(function (l, i) { l.g.style.display = l.ov.style.display = i === k ? '' : 'none'; });
      var L0 = Ls[k], lt = cl(Tm - L0.st, 0, L0.sc.dur);
      L0.up(lt);
      op(L0.g, Ls.length > 1 && k > 0 ? sg(lt, 0, .25) : 1);
      // [portafolio] teléfono: la vista es una ventana de W unidades que la cámara mueve; la bandeja (data-hud) se queda fija en pantalla
      var camX = 0;
      if (PH) {
        var W = Math.min(640, Math.max(200, (stage.clientWidth || 360) / PS));
        camX = cl(camAt(L0.n, lt) - W / 2, 0, 640 - W);
        svg.setAttribute('viewBox', camX.toFixed(2) + ' ' + (-HB) + ' ' + W.toFixed(2) + ' ' + (360 + HB));
      } else svg.setAttribute('viewBox', '0 0 640 360');
      var hud = L0.ov.querySelectorAll('[data-hud]');
      for (var h = 0; h < hud.length; h++) hud[h].setAttribute('transform', 'translate(' + camX.toFixed(2) + ' 0)');
      // Rótulo vigente: el último que ya entró (aunque sea de la escena anterior: sin hueco entre escenas)
      var ev = null;
      for (var j = 0; j < EV.length; j++) if (EV[j].t <= Tm + 1e-9) ev = EV[j];
      if (cap) {
        if (!ev) { cap.style.opacity = 0; cap.removeAttribute('data-cap'); }
        else {
          var s = X().caps[ev.n][ev.j];
          if (lastCap !== s) { cap.textContent = s; lastCap = s; }
          var p = sg(Tm, ev.t, ev.t + .35);
          cap.style.transform = 'translateY(' + ((1 - p) * 110).toFixed(1) + '%)'; cap.style.opacity = p.toFixed(3);
          cap.setAttribute('data-cap', ev.n + '.' + ev.j);
        }
      }
      if (tag) tag.textContent = ('0' + (L0.n + 1)).slice(-2) + ' / 08 · ' + X().tag[L0.n];
      if (o.onframe) o.onframe(Tm, total, k, lt);
    }
    function stop() { playing = false; cancelAnimationFrame(raf); stage.classList.remove('is-playing'); }
    function frame(now) {
      var dt = Math.min(.1, (now - last) / 1000); last = now;
      var nt = T0 + dt;
      if (o.ontick) o.ontick(nt);   // solo en reproducción normal (seek, saltos y repetir no pasan por aquí: no disparan sonidos)
      if (o.isStep && o.isStep()) {
        var k = sceneAt(T0), end = Ls[k].st + Ls[k].sc.dur;
        if (k < Ls.length - 1 && nt >= end) { T0 = end - 1e-4; render(T0); stop(); if (o.onwait) o.onwait(k); return; }
      }
      if (nt >= total) { T0 = total; render(T0); stop(); if (o.onend) o.onend(); return; }
      T0 = nt; render(T0); raf = requestAnimationFrame(frame);
    }
    var api = {
      total: total,
      starts: Ls.map(function (l) { return l.st; }),
      durs: Ls.map(function (l) { return l.sc.dur; }),
      sceneAt: sceneAt,
      play: function () { if (playing) return; if (T0 >= total) T0 = 0; playing = true; stage.classList.add('is-run', 'is-playing'); last = performance.now(); if (o.onplay) o.onplay(T0); raf = requestAnimationFrame(frame); },
      pause: function () { if (!playing) return; stop(); if (o.onpause) o.onpause(); },
      restart: function () { api.pause(); T0 = 0; render(0); api.play(); },
      seek: function (x) { T0 = cl(x, 0, total); stage.classList.add('is-run'); render(T0); },
      relang: function () { build(); if (shown) render(T0); },
      get playing() { return playing; }, get t() { return T0; }, get shown() { return shown; }
    };
    return api;
  }

  /* ───────── Sonido: 100 % Web Audio sintetizado (sin archivos, sin librerías, sin descargas) ─────────
   * Cada voz es una función (ctx, salida, cuándo, opciones) y sirve igual para AudioContext y OfflineAudioContext.
   * Cadena: voces → bus (uno por reproducción: pausar lo mata y corta lo que suena) → maestro → compresor/limitador → salida. */
  var AMBIENTE = false;            // cama ambiental plana de antes (La grave sin armonía): la MÚSICA la vuelve redundante; true la suma de nuevo
  var MUSICA = true;               // música de fondo sintetizada (Do mayor, 72 bpm, pad + arpegio + bajo): false la apaga sin tocar nada más
  var VOZ = true;                  // voz que narra los rótulos (mp3 de edge-tts en audio/): false la apaga sin tocar nada más
  var VOZ_LVL = .55;               // ganancia de la voz antes del maestro (pico de los mp3 ≈ −6 dBFS; el compresor final suma su ganancia de compensación)
  var VOZ_EL = .6;                 // volumen de la voz por <audio> (solo con file://, donde Web Audio no puede leer los mp3): ≈ el nivel que deja la cadena
  var DUCK = .4;                   // mientras habla la voz, música y efectos bajan a × 0,4 (≈ −8 dB) y vuelven después
  var SND_MASTER = .55;            // volumen maestro moderado
  var SND_KEY = 'sbFabrica.sound'; // preferencia de mute (localStorage, con try/catch)
  var ACx = window.AudioContext || window.webkitAudioContext || null;
  var SYN = (function () {
    var Z = .0001;
    function noise(ctx) {
      if (ctx.__nz) return ctx.__nz;
      var n = Math.floor(ctx.sampleRate), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), s = 22222;
      for (var i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = s / 1073741823.5 - 1; }   // ruido determinista: en vivo y en el render suena igual
      ctx.__nz = b; return b;
    }
    // Congela una ganancia en su valor actual antes de un fundido (sin leer .value, que fuera de la cadena no es el valor sonando)
    function hold(p, at, fallback) { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(at); else { p.cancelScheduledValues(at); p.setValueAtTime(fallback, at); } }
    function env(p, w, a, peak, d) { p.setValueAtTime(Z, w); p.exponentialRampToValueAtTime(peak, w + a); p.exponentialRampToValueAtTime(Z, w + a + d); }
    function osc(ctx, type, f, w, dur) { var o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, w); o.start(w); o.stop(w + dur + .02); return o; }
    function nsrc(ctx, w, dur, off) { var s = ctx.createBufferSource(); s.buffer = noise(ctx); s.start(w, off || 0, dur + .02); return s; }
    function gain(ctx, out) { var g = ctx.createGain(); g.gain.value = Z; g.connect(out); return g; }
    function panTo(ctx, out, w, a, b, dur) {
      if (!ctx.createStereoPanner || a == null) return out;
      var p = ctx.createStereoPanner(); p.pan.setValueAtTime(a, w); p.pan.linearRampToValueAtTime(b == null ? a : b, w + dur); p.connect(out); return p;
    }
    var V = {
      // tecleo suave: chasquido de ruido en banda alta + golpecito grave (≈ 45 ms)
      key: function (ctx, out, w, o) {
        var r = o.r || .5, g = gain(ctx, out); env(g.gain, w, .002, .07 + .03 * r, .035);
        var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600 + 1600 * r; bp.Q.value = 1.4; bp.connect(g);
        nsrc(ctx, w, .05, r * .5).connect(bp);
        var g2 = gain(ctx, out); env(g2.gain, w, .002, .035, .03); osc(ctx, 'sine', 170 + 40 * r, w, .04).connect(g2);
      },
      // tic de visto ✓: campanita corta (≈ 110 ms)
      tic: function (ctx, out, w, o) {
        var f = o.f || 1568, g = gain(ctx, out); env(g.gain, w, .003, .11 * (o.g || 1), .1);
        var a = osc(ctx, 'sine', f, w, .11); a.frequency.exponentialRampToValueAtTime(f * 1.02, w + .02); a.connect(g);
        var g2 = gain(ctx, out); env(g2.gain, w, .003, .04 * (o.g || 1), .06); osc(ctx, 'sine', f * 2, w, .07).connect(g2);
      },
      // criterio que falla ✗: tono grave corto que cae (≈ 300 ms)
      fail: function (ctx, out, w) {
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; lp.connect(out);
        var g = gain(ctx, lp); env(g.gain, w, .006, .09, .28);
        [196, 199].forEach(function (f) { var a = osc(ctx, 'triangle', f, w, .3); a.frequency.exponentialRampToValueAtTime(f * .74, w + .26); a.connect(g); });
        var g2 = gain(ctx, out); env(g2.gain, w, .006, .045, .22); osc(ctx, 'sine', 98, w, .24).connect(g2);
      },
      // «whoosh» de viaje: ruido filtrado que barre, paneado en la dirección del viaje (≤ 340 ms)
      whoosh: function (ctx, out, w, o) {
        var d = Math.min(.34, o.d || .32), dest = panTo(ctx, out, w, o.pa, o.pb, d);
        var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = .9;
        bp.frequency.setValueAtTime(380, w); bp.frequency.exponentialRampToValueAtTime(2300, w + d * .55); bp.frequency.exponentialRampToValueAtTime(900, w + d);
        var g = gain(ctx, dest); env(g.gain, w, d * .45, .2 * (o.g || 1), d * .55); bp.connect(g);
        nsrc(ctx, w, d, (o.r || .3) * .4).connect(bp);
      },
      // golpe de sello («SELLADA» / «VERIFICADA»): bombo corto + chasquido apagado (≈ 230 ms)
      stamp: function (ctx, out, w) {
        var g = gain(ctx, out); env(g.gain, w, .003, .17, .2);
        var a = osc(ctx, 'sine', 120, w, .22); a.frequency.exponentialRampToValueAtTime(46, w + .16); a.connect(g);
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1000; var g2 = gain(ctx, out); lp.connect(g2);
        env(g2.gain, w, .001, .085, .06); nsrc(ctx, w, .08, .2).connect(lp);
        var g3 = gain(ctx, out); env(g3.gain, w + .004, .001, .04, .02); osc(ctx, 'triangle', 1400, w + .004, .03).connect(g3);
      },
      // acorde corto ascendente (Producción se enciende · skill v4 → v5): 4 notas escalonadas, total ≤ 880 ms
      chord: function (ctx, out, w, o) {
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200; lp.connect(out);
        (o.notes || [523.25, 659.25, 783.99, 1046.5]).forEach(function (f, i) {
          var s = w + i * .07, d = .86 - i * .07 - .01, g = gain(ctx, lp);
          env(g.gain, s, .012, .065, d - .012);
          osc(ctx, 'triangle', f, s, d).connect(g);
          var g2 = gain(ctx, lp); env(g2.gain, s, .012, .025, d * .6); osc(ctx, 'sine', f * 2, s, d * .6).connect(g2);
        });
      },
      // aparición / encaje / guardado: blip suave (≈ 100 ms)
      blip: function (ctx, out, w, o) {
        var f = o.f || 880, g = gain(ctx, out); env(g.gain, w, .005, .08 * (o.g || 1), .09);
        var a = osc(ctx, 'sine', f, w, .1); a.frequency.exponentialRampToValueAtTime(f * 1.12, w + .05); a.connect(g);
      },
      // cambio de escena: soplo de ruido grave muy suave (≈ 320 ms)
      trans: function (ctx, out, w) {
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(500, w); lp.frequency.linearRampToValueAtTime(900, w + .2); lp.Q.value = .5;
        var g = gain(ctx, out); env(g.gain, w, .12, .05, .2); lp.connect(g); nsrc(ctx, w, .32, .6).connect(lp);
      }
    };
    var PAD_LVL = .018;
    // Cama ambiental: pad cálido (La mayor grave, sin melodía), filtro que respira lento. Devuelve {stop(cuándo, fundido)}.
    function pad(ctx, out, w, fadeIn) {
      var g = ctx.createGain(); g.gain.setValueAtTime(Z, w); g.gain.exponentialRampToValueAtTime(PAD_LVL, w + fadeIn); g.connect(out);
      var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650; lp.Q.value = .4; lp.connect(g);
      var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = .07; lg.gain.value = 180; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(w);
      var os = [lfo];
      [[110, -4], [110, 4], [164.81, -3], [220, 3], [277.18, -5]].forEach(function (n, i) {
        var o = ctx.createOscillator(); o.type = i < 2 ? 'triangle' : 'sine'; o.frequency.value = n[0]; o.detune.value = n[1];
        var og = ctx.createGain(); og.gain.value = i < 2 ? .5 : .32; o.connect(og); og.connect(lp); o.start(w); os.push(o);
      });
      return {stop: function (at, fade) {
        hold(g.gain, at, PAD_LVL); g.gain.setTargetAtTime(0, at, fade / 4);
        os.forEach(function (o) { try { o.stop(at + fade + .05); } catch (e) {} });
      }};
    }
    // Fin de cadena: maestro → compresor como limitador
    function chain(ctx) {
      var m = ctx.createGain(); m.gain.value = SND_MASTER;
      var c = ctx.createDynamicsCompressor();
      c.threshold.value = -14; c.knee.value = 4; c.ratio.value = 12; c.attack.value = .002; c.release.value = .15;
      m.connect(c); c.connect(ctx.destination); m.__out = c; return m;
    }

    /* Música de fondo: Do mayor, 72 bpm (negra = 0,833 s). Progresión C(add9) – Am7 – Fmaj7 – G, un acorde por compás,
     * sobre una rejilla fija de la pieza (no por escena): pad cálido (triangulares desafinadas, filtro bajo), bajo de seno y un arpegio suave con eco.
     * E1 entra con fundido y arpegio en negras · E4 sube apenas (+2,6 dB, filtro más abierto, chispa una octava arriba) ·
     * E7 resuelve: Fmaj7 → Gsus4 → G → C justo cuando Producción se enciende (negra 41 = 34,17 s; el acorde de efecto cae a 34,15 s) ·
     * E8 cierra con un La abierto (La–Mi–Si, sin tercera: deja entrar el acorde La mayor del skill v4 → v5) y fundido hasta el final. */
    var BEAT = 60 / 72, MUS = {pad: .0016, bass: .009, arp: .009};
    function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
    var CH = {
      C: {b: 48, p: [52, 55, 60, 62], a: [60, 64, 67, 74]},
      Am: {b: 45, p: [52, 57, 60, 67], a: [57, 64, 67, 72]},
      F: {b: 41, p: [53, 57, 60, 64], a: [53, 60, 64, 69]},
      G: {b: 43, p: [50, 55, 59, 62], a: [55, 62, 67, 71]},
      Gs: {b: 43, p: [50, 55, 60, 62], a: [55, 62, 67, 72]},
      A5: {b: 45, p: [52, 57, 59, 64], a: [57, 64, 69, 71]}
    };
    // [negra de inicio, negra de fin, acorde]
    var PROG = [[0, 4, 'C'], [4, 8, 'Am'], [8, 12, 'F'], [12, 16, 'G'], [16, 20, 'C'], [20, 24, 'Am'], [24, 28, 'F'], [28, 32, 'G'],
      [32, 36, 'Am'], [36, 38, 'F'], [38, 40, 'Gs'], [40, 41, 'G'], [41, 45, 'C'], [45, 50, 'A5']];
    // Nivel de la música en el segundo t (st = inicio de cada escena): fundido de entrada, subida en E4, fundido de salida en E8
    function mlv(t, st) {
      var fin = cl(t / 3.0), up = sg(t, st[3], st[3] + 1.0, lin) * (1 - sg(t, st[4] - .4, st[4] + .8, lin)), out = 1 - sg(t, st[7] + 1.8, st[7] + 5.6, lin);
      return Math.sin(fin * Math.PI / 2) * (1 + .35 * up) * out;
    }
    function musSheet(st) {
      var c = [], E4a = st[3], E4b = st[4], E8 = st[7];
      PROG.forEach(function (p) {
        var ch = CH[p[2]], last = p[2] === 'A5';
        for (var b = p[0]; b < p[1]; b += 2) {   // pad y bajo: se re-articulan cada 2 negras (saltar de escena nunca deja más de 1,7 s sin cama)
          var t = Math.round((b * BEAT + .05) * 1000) / 1000, len = Math.min(2, p[1] - b) * BEAT, lv = mlv(t, st);
          if (lv < .03) continue;
          c.push({t: t, k: 'mpad', o: {n: ch.p.map(mtof), d: last ? 3.6 : len, g: lv, bright: t >= E4a && t < E4b, fade: last}, ev: 'música · pad ' + p[2]});
          c.push({t: t, k: 'mbass', o: {f: mtof(ch.b), d: last ? 3.4 : len, g: lv}, ev: 'música · bajo ' + p[2]});
          if (last) break;
        }
        for (var e = p[0] * 2; e < p[1] * 2; e++) {   // arpegio en corcheas (en negras en E1 y E8)
          var t2 = Math.round((e * BEAT / 2 + .05) * 1000) / 1000;
          if ((t2 < st[1] || t2 >= E8) && e % 2) continue;
          if (t2 < BEAT * .9 || t2 >= E8 + 4.2) continue;
          var lv2 = mlv(t2, st), idx = [0, 1, 2, 3, 2, 1, 2, 1][e % 8];
          c.push({t: t2, k: 'marp', o: {f: mtof(ch.a[idx]), g: lv2 * (e % 2 ? .7 : 1)}, ev: 'música · arpegio ' + p[2]});
          if (t2 >= E4a + .3 && t2 < E4b - .3 && e % 4 === 0) c.push({t: t2, k: 'marp', o: {f: mtof(ch.a[3] + 12), g: lv2 * .45}, ev: 'música · chispa E4'});
        }
      });
      return c;
    }
    var M = {
      mpad: function (ctx, out, w, o) {
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = o.bright ? 1500 : 950; lp.Q.value = .3;
        var g = ctx.createGain(), pk = MUS.pad * o.g; g.gain.setValueAtTime(0, w); g.gain.linearRampToValueAtTime(pk, w + Math.min(.7, o.d * .4));
        if (o.fade) g.gain.setTargetAtTime(0, w + .8, o.d / 3.5);
        else { g.gain.setValueAtTime(pk, w + o.d); g.gain.setTargetAtTime(0, w + o.d, .35); }
        lp.connect(g); g.connect(out);
        var end = w + o.d + 1.9;
        o.n.forEach(function (f) { [-6, 6].forEach(function (dt) { var s = ctx.createOscillator(); s.type = 'triangle'; s.frequency.value = f; s.detune.value = dt; s.connect(lp); s.start(w); s.stop(end); }); });
      },
      mbass: function (ctx, out, w, o) {
        var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.connect(out);
        var g = ctx.createGain(), pk = MUS.bass * o.g; g.connect(lp);
        g.gain.setValueAtTime(0, w); g.gain.linearRampToValueAtTime(pk, w + .06); g.gain.setTargetAtTime(pk * .55, w + .06, .5); g.gain.setTargetAtTime(0, w + o.d, .25);
        osc(ctx, 'sine', o.f, w, o.d + 1.4).connect(g);
        var g2 = ctx.createGain(); g2.gain.value = .3; g2.connect(g); osc(ctx, 'sine', o.f * 2, w, o.d + 1.4).connect(g2);
      },
      marp: function (ctx, out, w, o) {
        var g = ctx.createGain(), pk = MUS.arp * o.g; g.connect(out);
        g.gain.setValueAtTime(0, w); g.gain.linearRampToValueAtTime(pk, w + .012); g.gain.setTargetAtTime(0, w + .012, .22);
        osc(ctx, 'sine', o.f, w, 1.4).connect(g);
        var g2 = ctx.createGain(); g2.gain.value = .25; g2.connect(g); osc(ctx, 'triangle', o.f, w, 1.4).connect(g2);
      }
    };
    /* Grafo de una reproducción: bus (pausar lo mata) ← efectos (fxd), música (musIn → eco → musG → mduck) y voz.
     * fxd y mduck son los que bajan cuando habla la voz. Sirve igual para AudioContext y OfflineAudioContext. */
    function graph(ctx, out) {
      var bus = ctx.createGain(); bus.connect(out);
      var fxd = ctx.createGain(); fxd.connect(bus);
      var mduck = ctx.createGain(); mduck.connect(bus);
      var musG = ctx.createGain(); musG.connect(mduck);
      var musIn = ctx.createGain(); musIn.connect(musG);
      var dl = ctx.createDelay(1); dl.delayTime.value = BEAT * .75;
      var dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2200;
      var fb = ctx.createGain(); fb.gain.value = .3; var wet = ctx.createGain(); wet.gain.value = .25;
      musIn.connect(dl); dl.connect(dlp); dlp.connect(fb); fb.connect(dl); dlp.connect(wet); wet.connect(musG);
      return {bus: bus, fxd: fxd, mduck: mduck, musG: musG, musIn: musIn};
    }
    // Ducking suave: música y efectos bajan a DUCK justo antes de la frase y vuelven al terminar
    function duck(G, w, d) {
      [G.fxd.gain, G.mduck.gain].forEach(function (p) { p.setTargetAtTime(DUCK, Math.max(0, w - .08), .04); p.setTargetAtTime(1, w + d + .05, .18); });
    }
    return {V: V, M: M, pad: pad, chain: chain, hold: hold, graph: graph, duck: duck, musSheet: musSheet};
  })();

  /* ───────── Montaje ───────── */
  var ICON = {
    play: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z"/></svg>',
    pause: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1h2v8H2zM6 1h2v8H6z"/></svg>',
    prev: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 1h1.6v8H1.5zM9 1v8L3.6 5z"/></svg>',
    next: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M6.9 1h1.6v8H6.9zM1 1v8l5.4-4z"/></svg>',
    replay: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1a4 4 0 1 1-4 4h1.5A2.5 2.5 0 1 0 5 2.5V4L2.5 1.8 5 0z"/></svg>',
    step: '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1.5h1.6v7H1zM4 1.5l5 3.5-5 3.5z"/></svg>',
    sndOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
    sndOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>'
  };
  var players = [], langHooks = [];
  // [portafolio] al cruzar los 699 px (girar el teléfono, cambiar la ventana) se rehace el cuadro en el otro modo, en el mismo segundo
  if (MQ) {
    var onMQ = function () { var ph = !!MQ.matches; if (ph === PH) return; PH = ph; trayK(); players.forEach(function (p) { p.relang(); }); };
    if (MQ.addEventListener) MQ.addEventListener('change', onMQ); else if (MQ.addListener) MQ.addListener(onMQ);
  }
  if (EMB) window.addEventListener('resize', function () { players.forEach(function (p) { if (p.shown && !p.playing) p.seek(p.t); }); });

  function langToggle() {
    var w = document.createElement('span');
    w.className = 'lang-t'; w.setAttribute('role', 'group');
    ['en', 'es'].forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button'; b.lang = l; b.textContent = l.toUpperCase(); b.setAttribute('data-lang', l);
      b.setAttribute('aria-label', l === 'en' ? 'English' : 'Español');
      b.addEventListener('click', function () { setLang(l); });
      w.appendChild(b);
    });
    return w;
  }
  function syncToggles() {
    document.querySelectorAll('.lang-t').forEach(function (w) {
      w.setAttribute('aria-label', X().ui.lang);
      w.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === LANG)); });
    });
  }
  function setLang(l) {
    if (!TX[l] || l === LANG) { syncToggles(); return; }
    LANG = l;
    players.forEach(function (p) { p.relang(); });
    langHooks.forEach(function (f) { f(); });
    syncToggles();
    // [portafolio] un solo idioma: avisa al sitio (i18n.js) para que la página siga al video
    try { document.dispatchEvent(new CustomEvent('fabrica:lang', {detail: {lang: l}})); } catch (e) {}
  }

  // Demos por escena: en reposo muestran el último cuadro (el mismo estado que verá quien pide movimiento reducido)
  document.querySelectorAll('[data-scene]').forEach(function (st) {
    var i = +st.dataset.scene, pl = Player(st, [i]), demo = st.parentElement;
    players.push(pl);
    pl.seek(pl.total);
    var b = demo.querySelector('[data-play]');
    if (b) b.addEventListener('click', function () { pl.restart(); });
    var ctrl = demo.querySelector('.ctrl');
    if (ctrl) ctrl.appendChild(langToggle());
    demo.lang = LANG;
    langHooks.push(function () { demo.lang = LANG; });
  });

  // Secuencia completa
  var main = document.getElementById('seq');
  if (main) {
    var box = document.getElementById('seq-box');
    var bP = document.getElementById('seq-play'), bPrev = document.getElementById('seq-prev'), bNext = document.getElementById('seq-next'),
      bR = document.getElementById('seq-restart'), bStep = document.getElementById('seq-step'), bSnd = document.getElementById('seq-sound'),
      b8 = document.getElementById('seq-see8'), segBox = document.getElementById('seq-segs'), lbl = document.getElementById('seq-lbl'),
      tim = document.getElementById('seq-time'), live = document.getElementById('seq-live'), grp = document.getElementById('seq-ctrl'),
      langSlot = document.getElementById('seq-lang');
    var stepMode = RM, waiting = false, started = false, userPaused = false, autoPaused = false, inView = false, t0w = 0, sound = false;
    var segs = [], segFill = [], sndNote = document.getElementById('seq-sound-note');

    /* Banda de sonido: lista de eventos (segundo global → voz) sacada de los instantes de cada escena (ver update(t) de E1–E8).
     * Pan: posición x del objeto en el cuadro de 640 (−1 izquierda … +1 derecha, a 60 %). */
    function px(x) { return Math.round((x / 640 * 2 - 1) * 60) / 100; }
    function cueSheet() {
      var st = seq.starts, c = [];
      function A(n, lt, k, o, name) { c.push({t: Math.round((st[n] + lt) * 1000) / 1000, k: k, o: o || {}, ev: 'E' + (n + 1) + ' · ' + name}); }
      function typing(n, a, b, s, name) {   // una tecla por letra que aparece (misma regla que el texto: round(len·p)), máx. una cada 55 ms, sin espacios
        var last = -1;
        for (var i = 1; i <= s.length; i++) {
          if (s.charAt(i - 1) === ' ') continue;
          var lt = a + (b - a) * (i - .5) / s.length;
          if (lt - last >= .055) { A(n, lt, 'key', {}, name); last = lt; }
        }
      }
      for (var n = 1; n < 8; n++) A(n, 0, 'trans', {}, 'cambio de escena');
      var x = X().sc;
      // E1 · Encargo
      A(0, .2, 'blip', {f: 660, g: .6}, 'chip PO');
      typing(0, 1.0, 1.6, x[0].title, 'se escribe el título');
      [1.95, 2.12, 2.29].forEach(function (t, i) { A(0, t, 'tic', {f: 1568 * Math.pow(1.122, i)}, 'visto criterio ' + (i + 1)); });
      A(0, 2.5, 'tic', {f: 2093, g: .8}, 'chip «encargo completo»');
      // E2 · Orden y plan
      A(1, .2, 'blip', {f: 660, g: .6}, 'chip Cortex');
      A(1, .5, 'whoosh', {d: .3, g: .55, pa: px(420), pb: px(60)}, 'la tarjeta sube en la fila');
      A(1, 1.4, 'blip', {f: 740, g: .6}, 'chip TL');
      [2.04, 2.24, 2.44].forEach(function (t, i) { A(1, t, 'blip', {f: [784, 988, 1175][i], g: .8}, 'nodo del plan ' + (i + 1)); });
      // E3 · Equipo y espacio
      A(2, 1.0, 'blip', {f: 880, g: .7}, 'Dev 8 pasa a «trabaja»');
      A(2, 1.35, 'whoosh', {d: .32, g: .8, pa: px(404), pb: px(498)}, 'la sesión viaja al PC 3');
      A(2, 2.3, 'blip', {f: 990}, 'la sesión entra al PC 3');
      // E4 · Construcción y sello
      A(3, 1.5, 'blip', {f: 740, g: .5}, 'foco en la tarjeta');
      A(3, 2.3, 'whoosh', {d: .32, pa: px(34), pb: px(186)}, 'la tarjeta viaja a Staging');
      A(3, 2.95, 'blip', {f: 1046, g: .9}, 'la tarjeta encaja');
      [3.35, 3.65, 3.95].forEach(function (t, i) { A(3, t, 'tic', {f: 1568 * Math.pow(1.122, i)}, 'visto control ' + (i + 1)); });
      A(3, 4.45, 'stamp', {}, 'SELLADA');
      // E5 · Revisión y vuelta
      A(4, 1.9, 'tic', {f: 1568}, 'visto fila 1');
      A(4, 2.25, 'tic', {f: 1760}, 'visto fila 2');
      A(4, 2.6, 'fail', {}, 'falla «texto sin datos» ✗');
      A(4, 2.95, 'tic', {f: 1976}, 'visto fila 4');
      A(4, 3.5, 'blip', {f: 660, g: .7}, 'aparece «1 arreglo»');
      A(4, 4.1, 'whoosh', {d: .34, pa: px(346), pb: px(150)}, '«1 arreglo» viaja a Dev 8');
      A(4, 4.85, 'blip', {f: 880, g: .5}, 'Dev 8 recibe el arreglo');
      typing(4, 5.15, 5.85, x[4].empty, 'Dev 8 escribe el texto');
      A(4, 6.2, 'blip', {f: 990, g: .7}, 'aparece «Vuelta 2»');
      A(4, 6.6, 'whoosh', {d: .34, pa: px(190), pb: px(520)}, '«Vuelta 2» vuelve al criterio');
      A(4, 7.5, 'blip', {f: 587, g: .45}, 'se abre «Lección por aprender»');
      A(4, 8.0, 'tic', {f: 2093}, 'la fila pasa a verde ✓');
      A(4, 8.05, 'whoosh', {d: .34, g: .8, pa: px(110), pb: px(60)}, 'el arreglo viaja a la bandeja');
      A(4, 8.3, 'stamp', {}, 'VERIFICADA');
      A(4, 8.75, 'blip', {f: 784, g: .7}, 'el arreglo queda guardado');
      // E6 · ¿Cómo vamos?
      [.2, .4, .6].forEach(function (t, i) { A(5, t, 'blip', {f: [587, 659, 740][i], g: .45}, 'indicador ' + (i + 1)); });
      A(5, 2.1, 'blip', {f: 880, g: .6}, 'visor sobre «vueltas por tarea»');
      // E7 · Revisión y salida
      A(6, 1.5, 'tic', {f: 1760}, 'mi visto ✓');
      A(6, 1.95, 'whoosh', {d: .34, pa: px(134), pb: px(364)}, 'la pantalla viaja a Producción');
      A(6, 2.65, 'chord', {notes: [523.25, 659.25, 783.99, 1046.5]}, 'Producción se enciende');
      // E8 · Lección
      A(7, .35, 'whoosh', {d: .34, pa: px(90), pb: px(320)}, 'el arreglo sale de la bandeja');
      A(7, 1.0, 'blip', {f: 740, g: .5}, 'Cortex lo revisa (lupa)');
      A(7, 2.45, 'blip', {f: 1175, g: .7}, 'se vuelve «+ lección»');
      A(7, 2.85, 'whoosh', {d: .3, g: .6, pa: px(320), pb: px(482)}, 'la lección viaja al skill');
      A(7, 3.5, 'chord', {notes: [440, 554.37, 659.25, 880]}, 'skill v4 → v5');
      A(7, 3.7, 'blip', {f: 659, g: .55}, '«decisión anotada»');
      c.sort(function (a, b) { return a.t - b.t; });
      c.forEach(function (e, i) { var r = Math.sin((i + 1) * 12.9898) * 43758.5453; e.o.r = r - Math.floor(r); });
      return c;
    }

    /* Voz: un mp3 por rótulo y por idioma (audio/voz-es-01.mp3 …), dicho en el instante en que entra el rótulo.
     * Con http(s) se decodifica a AudioBuffer y entra a la cadena (bus → maestro → limitador): pausar, silenciar o saltar la corta igual que a los efectos.
     * Con file:// Web Audio no puede leer los mp3, así que suena por <audio> fuera de la cadena (mismo instante, mismo ducking).
     * Si un mp3 no carga, esa frase se omite en silencio: la pieza sigue con efectos y música. Nada se descarga antes del primer clic. */
    var VZ = {buf: {}, el: {}, asked: {}}, FILE = location.protocol === 'file:';
    function vozSrc(lang, i) { return ((EMB && EMB.base) || '') + 'audio/voz-' + lang + '-' + ('0' + i).slice(-2) + '.mp3'; }
    function vozCount() { var n = 0; SC.forEach(function (s) { n += s.caps.length; }); return n; }
    function decode(dc, ab) { return new Promise(function (ok, ko) { try { var p = dc.decodeAudioData(ab, ok, ko); if (p && p.catch) p.catch(ko); } catch (e) { ko(e); } }); }
    function loadVoz(lang, dc) {
      if (!VOZ) return Promise.resolve();
      var all = [];
      for (var i = 1; i <= vozCount(); i++) (function (i) {
        var key = lang + i;
        if (VZ.buf[key] || VZ.el[key]) return;
        if (FILE) {
          if (VZ.asked[key]) return; VZ.asked[key] = 1;
          try { var a = new Audio(); a.preload = 'auto'; a.addEventListener('error', function () { delete VZ.el[key]; }); a.src = vozSrc(lang, i); VZ.el[key] = a; } catch (e) {}
          return;
        }
        if (VZ.asked[key]) { all.push(VZ.asked[key]); return; }
        if (!window.fetch || !dc) return;
        var p = fetch(vozSrc(lang, i)).then(function (r) { if (!r.ok) throw new Error('voz ' + r.status); return r.arrayBuffer(); })
          .then(function (ab) { return decode(dc, ab); }).then(function (b) { VZ.buf[key] = b; }).catch(function () {});
        VZ.asked[key] = p; all.push(p);
      })(i);
      return Promise.all(all);
    }
    function vozSheet() {
      var c = [], i = 0;
      SC.forEach(function (s, n) { s.caps.forEach(function (ct, j) { i++; c.push({t: Math.round((seq.starts[n] + ct) * 1000) / 1000, k: 'voz', o: {i: i}, ev: 'E' + (n + 1) + ' · voz ' + i + ' · ' + X().caps[n][j]}); }); });
      return c;
    }

    var audio = (function () {
      var ctx = null, master = null, G = null, padV = null, H = 0, active = false, LA = .06, cues = null, cuesLang = null, log = [], an = null, aBuf = null;
      var vT = [], vE = [];   // voz por <audio> (file://): temporizadores pendientes y elementos sonando
      var pref = true;
      try { var sv = localStorage.getItem(SND_KEY); if (sv === '0') pref = false; } catch (e) {}
      function save() { try { localStorage.setItem(SND_KEY, pref ? '1' : '0'); } catch (e) {} }
      // Hoja completa: efectos (cueSheet) + música + voz, ordenada por segundo
      function sheet() {
        if (!cues || cuesLang !== LANG) {
          cues = cueSheet().concat(MUSICA ? SYN.musSheet(seq.starts) : [], VOZ ? vozSheet() : []);
          cues.sort(function (a, b) { return a.t - b.t; });
          cuesLang = LANG;
        }
        return cues;
      }
      function kindOf(e) { return e.k === 'voz' ? 'voice' : (SYN.M[e.k] ? 'music' : 'fx'); }
      // Solo se llama dentro de un clic del visitante
      function unlock() {
        if (!ACx) return false;
        try {
          if (!ctx) {
            ctx = (EMB && EMB.ctx) || new ACx(); if (EMB) EMB.ctx = null; master = SYN.chain(ctx);   // [portafolio] contexto nacido en el clic
            an = ctx.createAnalyser(); an.fftSize = 2048; master.__out.connect(an);   // medidor de la salida (solo lectura, para pruebas)
          }
          if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(function () {});
          loadVoz(LANG, ctx); loadVoz(LANG === 'es' ? 'en' : 'es', ctx);
          return true;
        } catch (e) { ctx = null; return false; }
      }
      function audible() { return !!ctx && pref; }
      function vozStop() {
        vT.forEach(function (t) { clearTimeout(t); }); vT = [];
        vE.forEach(function (el) { try { el.pause(); } catch (e) {} }); vE = [];
      }
      function halt(fade) {
        active = false;
        vozStop();
        if (!ctx) return;
        var now = ctx.currentTime;
        if (G) { var b = G.bus; SYN.hold(b.gain, now, 1); b.gain.setTargetAtTime(0, now, .012); setTimeout(function () { try { b.disconnect(); } catch (e) {} }, 250); G = null; }
        if (padV) { padV.stop(now, fade == null ? .35 : fade); padV = null; }
      }
      function padOff(fade) { if (ctx && padV) { padV.stop(ctx.currentTime, fade); padV = null; } }
      function musOff(fade) { if (ctx && G) { var p = G.musG.gain, now = ctx.currentTime; SYN.hold(p, now, 1); p.setTargetAtTime(0, now, fade / 4); } }
      function start(T) {
        halt(.2);
        if (!audible()) return;
        G = SYN.graph(ctx, master);
        var now = ctx.currentTime;
        if (T > .3) { G.musG.gain.setValueAtTime(0, now); G.musG.gain.linearRampToValueAtTime(1, now + .8); }   // al retomar a mitad de pieza, la música entra con fundido
        H = T; active = true;
        if (AMBIENTE) padV = SYN.pad(ctx, master, now + .02, 1.5);
      }
      // Voz en vivo: AudioBuffer en la cadena si está; si no, <audio> (file://); si no hay ninguno, se omite
      function voz(e, w) {
        var key = LANG + e.o.i, b = VZ.buf[key], pend = VZ.asked[key];
        function play(b, w) { var s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = b; g.gain.value = VOZ_LVL; s.connect(g); g.connect(G.bus); s.start(w); SYN.duck(G, w, b.duration); }
        if (b) { play(b, w); return 'buf'; }
        // Primer clic: el mp3 puede venir aún en camino. Si llega dentro de 0,5 s, la frase entra con ese retraso (todas tienen ≥ 0,7 s de margen); si no, se omite
        if (!FILE && pend && pend.then) {
          var g0 = G;
          pend.then(function () { var b2 = VZ.buf[key]; if (!b2 || !ctx || G !== g0) return; var n2 = ctx.currentTime; if (n2 > w + .5) return; play(b2, Math.max(w, n2 + .01)); });
          return 'late';
        }
        var el = VZ.el[key];
        if (el) {
          SYN.duck(G, w, isFinite(el.duration) && el.duration > 0 ? el.duration : 2.2);
          var tm = setTimeout(function () {
            var k = vT.indexOf(tm); if (k >= 0) vT.splice(k, 1);
            try { el.currentTime = 0; el.volume = VOZ_EL; var p = el.play(); if (p && p.catch) p.catch(function () {}); vE.push(el); } catch (er) {}
          }, Math.max(0, (w - ctx.currentTime) * 1000));
          vT.push(tm); return 'el';
        }
        return 'none';
      }
      // Reproducción normal: agenda los eventos que el reloj cruza (con 60 ms de adelanto para que el espaciado sea exacto)
      function tick(now) {
        if (!active || !G) return;
        var hi = now + LA, k = seq.sceneAt(Math.min(H, seq.total - 1e-6));   // escena donde va el agendado: en paso a paso no cruza a la siguiente
        hi = Math.min(hi, stepMode ? seq.starts[k] + seq.durs[k] - 1e-4 : seq.total);
        if (hi <= H) return;
        var cs = sheet(), base = ctx.currentTime;
        for (var i = 0; i < cs.length; i++) {
          var e = cs[i];
          if (e.t > H && e.t <= hi) {
            var w = base + Math.max(0, e.t - now), kd = kindOf(e), how = '';
            try {
              if (kd === 'voice') how = voz(e, w);
              else if (kd === 'music') SYN.M[e.k](ctx, G.musIn, w, e.o);
              else SYN.V[e.k](ctx, G.fxd, w, e.o);
            } catch (er) {}
            if (log.length < 2000) log.push({t: e.t, k: e.k, kind: kd, how: how, lang: LANG, ev: e.ev, at: Math.round((now + Math.max(0, e.t - now)) * 1000) / 1000});
          }
        }
        H = hi;
      }
      // Render fuera de línea de la banda entera (para medir y para el WAV de prueba). opt.fx / opt.music / opt.voice = false quitan esa capa
      // (el ducking se mantiene igual que en la mezcla, salvo opt.duck = false); opt.ambient fuerza la cama plana.
      function render(opt) {
        opt = opt || {};
        var OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!OAC) return Promise.reject(new Error('sin OfflineAudioContext'));
        var sr = 44100, tail = 1.5, oc = new OAC(2, Math.ceil(sr * (seq.total + tail)), sr), m = SYN.chain(oc), Gx = SYN.graph(oc, m), cs = sheet(), lang = LANG;
        return loadVoz(lang, oc).then(function () {
          var amb = opt.ambient == null ? AMBIENTE : opt.ambient;
          if (amb) { var pv = SYN.pad(oc, m, 0, 1.5); pv.stop(seq.total, 1.0); }
          cs.forEach(function (e) {
            var w = e.t + .001, kd = kindOf(e);
            if (kd === 'voice') {
              var b = VZ.buf[lang + e.o.i]; if (!b) return;
              if (opt.duck !== false) SYN.duck(Gx, w, b.duration);
              if (opt.voice === false) return;
              var s = oc.createBufferSource(), g = oc.createGain(); s.buffer = b; g.gain.value = VOZ_LVL; s.connect(g); g.connect(Gx.bus); s.start(w);
            } else if (kd === 'music') { if (opt.music !== false) SYN.M[e.k](oc, Gx.musIn, w, e.o); }
            else if (opt.fx !== false && (!opt.only || opt.only === e.k)) SYN.V[e.k](oc, Gx.fxd, w, e.o);
          });
          return oc.startRendering();
        });
      }
      // Medidor: RMS de la salida en dBFS en este instante (para pruebas sin oír)
      function meter() {
        if (!an) return null;
        if (!aBuf) aBuf = new Float32Array(an.fftSize);
        an.getFloatTimeDomainData(aBuf);
        var s = 0; for (var i = 0; i < aBuf.length; i++) s += aBuf[i] * aBuf[i];
        var r = Math.sqrt(s / aBuf.length); return r > 0 ? 20 * Math.log(r) / Math.LN10 : -Infinity;
      }
      return {
        unlock: unlock, start: start, tick: tick, halt: halt, render: render, meter: meter,
        trans: function () { if (active && G) SYN.V.trans(ctx, G.fxd, ctx.currentTime + .01, {}); },
        end: function () { active = false; padOff(1.0); },
        wait: function () { active = false; padOff(.6); musOff(.6); },
        on: function () { return audible(); },
        toggle: function () {
          if (!ctx) { unlock(); pref = true; }   // primer clic: enciende (crea el contexto dentro del gesto)
          else pref = !pref;
          save();
          if (pref && seq.playing) start(seq.t); else if (!pref) halt(.15);
        },
        get ctx() { return ctx; }, get log() { return log; }, cues: function () { return sheet(); }, get pref() { return pref; },
        voz: VZ, vozSrc: vozSrc
      };
    })();

    var seq = Player(main, [0, 1, 2, 3, 4, 5, 6, 7], {
      isStep: function () { return stepMode; },
      onframe: function (Tm, total, k, lt) { ui(Tm, k, lt); },
      ontick: function (nt) { audio.tick(nt); },
      onplay: function (T) { if (EMB) { try { document.dispatchEvent(new CustomEvent('fabrica:play')); } catch (e) {} } started = true; waiting = false; if (T === 0) t0w = performance.now(); if (b8) b8.hidden = true; audio.start(T); ui(seq.t); },
      onpause: function () { audio.halt(); ui(seq.t); },
      onwait: function (k) { waiting = true; audio.wait(); ui(seq.t); say(fmt(X().ui.done, {n: k + 1})); },
      onend: function () { waiting = false; audio.end(); window.__seqMeasure = {wall: (performance.now() - t0w) / 1000, total: seq.total}; ui(seq.t); }
    });
    window.__snd = audio;
    players.push(seq);
    window.__seq = seq;

    seq.durs.forEach(function (d, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.style.flex = d + ' 1 0'; b.setAttribute('data-k', i);
      var f = document.createElement('i'); f.setAttribute('aria-hidden', 'true'); b.appendChild(f);
      b.addEventListener('click', function () { goTo(i); });
      segBox.appendChild(b); segs.push(b); segFill.push(f);
    });
    if (langSlot) langSlot.appendChild(langToggle());

    function sceneName(k) { return X().bar[k]; }
    function say(s) { if (live) live.textContent = s; }
    function slideMode() { return RM && !seq.playing && !waiting; }
    function ui(Tm, k, lt) {
      if (k == null) { k = seq.sceneAt(Tm); lt = Tm - seq.starts[k]; }
      var u = X().ui, fullSeg = RM && !seq.playing;
      segs.forEach(function (b, i) {
        var p = i < k ? 1 : (i > k ? 0 : (fullSeg ? 1 : cl(lt / seq.durs[i])));
        if (!seq.shown) p = 0;
        segFill[i].style.transform = 'scaleX(' + p.toFixed(4) + ')';
        if (i === k && seq.shown) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        b.setAttribute('aria-label', fmt(u.go, {n: i + 1, name: sceneName(i)}));
      });
      lbl.textContent = fmt(u.scene, {n: k + 1, name: sceneName(k)});
      tim.textContent = nf(Math.min(Tm, seq.total), 1) + ' s / ' + nf(seq.total, 1) + ' s';
      var pl = seq.playing, pk = (pl ? 'p' : 's') + LANG;
      // [portafolio] el botón se reescribe SOLO cuando cambia su estado: reescribirlo en cada cuadro cambiaba el nodo bajo el puntero
      // entre mousedown y mouseup y el clic se perdía (pausar «no respondía» mientras corría la pieza)
      if (bP.__k !== pk) {
        bP.__k = pk;
        bP.innerHTML = (pl ? ICON.pause : ICON.play) + '<span>' + (pl ? u.pause : u.play) + '</span>';
        bP.setAttribute('aria-label', pl ? u.pause : u.play);
        bP.setAttribute('data-state', pl ? 'playing' : 'paused');
      }
      bNext.disabled = k >= 7 && seq.shown;
      bNext.classList.toggle('is-next', waiting);
      bPrev.disabled = !seq.shown || (k === 0 && (slideMode() || lt <= 1.5));
    }
    function labels() {
      var u = X().ui;
      bPrev.innerHTML = ICON.prev; bPrev.setAttribute('aria-label', u.prev); bPrev.title = u.prev;
      bNext.innerHTML = ICON.next; bNext.setAttribute('aria-label', u.next); bNext.title = u.next;
      bR.innerHTML = ICON.replay + '<span>' + u.replay + '</span>';
      bStep.innerHTML = ICON.step + '<span>' + u.step + '</span>'; bStep.setAttribute('aria-pressed', String(stepMode));
      bSnd.setAttribute('aria-label', u.sound); bSnd.title = u.sound;
      if (b8) b8.innerHTML = ICON.next + '<span>' + u.see8 + '</span>';
      grp.setAttribute('aria-label', u.group);
      segBox.setAttribute('aria-label', u.bar);
      main.setAttribute('aria-label', X().aria);
      box.lang = LANG;
      document.querySelectorAll('#seq .poster [data-k]').forEach(function (e) { var v = X().poster[e.getAttribute('data-k')]; if (v != null) e.textContent = v; });
      ui(seq.t);
    }
    langHooks.push(labels);

    function goTo(k) {
      k = cl(k, 0, 7);
      var resume = seq.playing || waiting;
      seq.pause(); waiting = false;
      if (RM && !resume) seq.seek(seq.starts[k] + seq.durs[k] - 1e-4);   // lámina quieta: último cuadro, rótulo completo
      else { seq.seek(seq.starts[k] + 1e-3); if (resume) { userPaused = false; seq.play(); if (k > 0) audio.trans(); } }   // un solo soplo de transición, nunca los eventos saltados
      if (b8) b8.hidden = true;
      ui(seq.t);
      say(fmt(X().ui.scene, {n: k + 1, name: sceneName(k)}));
    }
    function next() {
      if (!seq.shown) { goTo(0); return; }
      var k = seq.sceneAt(seq.t);
      if (k < 7) goTo(k + 1);
    }
    function prev() {
      if (!seq.shown) return;
      var k = seq.sceneAt(seq.t), lt = seq.t - seq.starts[k];
      if (!slideMode() && !waiting && lt > 1.5) goTo(k); else goTo(k - 1);
    }
    function togglePlay() {
      audio.unlock();   // gesto del visitante: aquí, y solo aquí (o en Repetir / Sonido), nace o se reanuda el AudioContext
      if (seq.playing) { seq.pause(); userPaused = true; autoPaused = false; }
      else if (waiting) next();
      else { userPaused = false; autoPaused = false; seq.play(); }
    }
    bP.addEventListener('click', function () { togglePlay(); sndUI(); });
    bNext.addEventListener('click', next);
    bPrev.addEventListener('click', prev);
    bR.addEventListener('click', function () { audio.unlock(); sndUI(); waiting = false; userPaused = false; seq.restart(); });
    if (b8) { b8.hidden = !RM; b8.addEventListener('click', function () { goTo(0); }); }
    bStep.addEventListener('click', function () {
      stepMode = !stepMode; bStep.setAttribute('aria-pressed', String(stepMode));
      if (!stepMode && waiting) next();   // al apagar el modo, la pieza sigue sola desde donde está
    });
    // Sonido: el botón es un mute real. Suena solo si hay AudioContext (se crea dentro de un clic: Reproducir, Repetir o Sonido)
    // y la preferencia no es «mudo». La preferencia se recuerda; por defecto, encendido.
    function sndUI() {
      var on = audio.on();
      bSnd.innerHTML = ICON[on ? 'sndOn' : 'sndOff']; bSnd.setAttribute('aria-pressed', String(on)); bSnd.classList.toggle('is-on', on);
      if (!ACx) bSnd.disabled = true;
      if (sndNote) { sndNote.textContent = on ? X().ui.sndOn : X().ui.sndOff; sndNote.lang = LANG; }
    }
    bSnd.addEventListener('click', function () { audio.toggle(); sndUI(); });
    langHooks.push(sndUI);
    sndUI();

    // Teclado: Espacio pausa / reanuda (fuera de un botón, que ya responde a Espacio); ← → Inicio Fin cambian de escena.
    box.addEventListener('keydown', function (e) {
      var tg = e.target, isBtn = tg && (tg.tagName === 'BUTTON' || tg.tagName === 'INPUT');
      if ((e.key === ' ' || e.key === 'Spacebar') && !isBtn) { e.preventDefault(); togglePlay(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(7); }
    });

    // Arranque: al entrar en vista (60 %), nunca al cargar fuera de pantalla; se pausa al salir de vista o al ocultar la pestaña.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          inView = e.isIntersecting && e.intersectionRatio >= .6;
          if (!e.isIntersecting) { if (seq.playing) { seq.pause(); autoPaused = true; } return; }
          if (!inView || RM || EMB) return;   // [portafolio] nunca arranca sola
          if (!started && !userPaused) seq.play();
          else if (autoPaused && !userPaused) { autoPaused = false; seq.play(); }
        });
      }, {threshold: [0, .6]}).observe(main);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { if (seq.playing) { seq.pause(); autoPaused = true; } }
      else if (autoPaused && inView && !userPaused) { autoPaused = false; seq.play(); }
    });

    labels();
    window.__sb = {setLang: setLang, get lang() { return LANG; }, get waiting() { return waiting; }, get step() { return stepMode; }, next: next, prev: prev, goTo: goTo,
      start: function () { if (!seq.playing) { togglePlay(); sndUI(); } }, pause: function () { if (seq.playing) { seq.pause(); userPaused = true; sndUI(); } }, get playing() { return seq.playing; }};   // [portafolio]
  }
  syncToggles();
})();
