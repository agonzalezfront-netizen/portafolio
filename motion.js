/* Motion: movimiento que actúa DESPUÉS del rebuild (enganche «built» de swarm.js) o en interacciones.
   Storyboard aprobado: _revision/storyboard-motion.html. Reglas: solo transform, opacity y clip-path; con
   prefers-reduced-motion, Skip/Escape o llegada a mitad de página, todo queda directo en su estado final;
   lo que entra animado sale animado; nada cambia medidas (sin saltos de layout).
   Este archivo carga ANTES que swarm.js (los dos con defer) para escuchar «swarm:init» desde la primera corrida. */
(function () {
  'use strict';
  var root = document.documentElement;
  // [portafolio] textos que este archivo escribe: salen del diccionario del sitio (i18n.js) en el idioma vigente
  function T(k, en) { try { return window.__i18n ? window.__i18n.t(k) : en; } catch (e) { return en; } }
  var mqRM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  function RM() { return mqRM.matches; }
  var E_OUT = 'cubic-bezier(.16,.84,.44,1)', E_STD = 'cubic-bezier(.4,0,.2,1)';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function anim(el, kf, o) {
    if (!el || !el.animate) return Promise.resolve();
    var a = el.animate(kf, o);
    return a.finished.then(function () {}, function () {});
  }
  // próximo cuadro; si el navegador frena requestAnimationFrame (ventana tapada), un temporizador corto lo reemplaza
  function frame(fn) {
    var ran = false, tm = 0, run = function () { if (ran) return; ran = true; clearTimeout(tm); fn(performance.now()); };
    requestAnimationFrame(run); tm = setTimeout(run, 40);
  }
  function easeOut3(p) { return 1 - Math.pow(1 - p, 3); }
  function inView(el, f) { var r = el.getBoundingClientRect(), h = window.innerHeight; f = f || 0; return r.bottom > h * f && r.top < h * (1 - f); }
  function busy() { return root.classList.contains('sw-stage') || root.classList.contains('swarm'); } // etapa o intro del rebuild

  /* Registro de lo que está animando: Skip/Escape lo lleva a su estado final al instante */
  var running = [];
  function track(fin) { var t = { fin: fin }; running.push(t); return function () { var i = running.indexOf(t); if (i >= 0) running.splice(i, 1); }; }
  document.addEventListener('swarm:skip', function () { running.splice(0).forEach(function (t) { try { t.fin(); } catch (e) {} }); });

  // Espera a que el elemento entre en vista (fracción f visible) y llama una vez
  // gone: si el lector ya lo dejó atrás (quedó por encima de la pantalla) sin llegar a verlo, se llama en su lugar
  function whenSeen(el, ratio, fn, gone) {
    if (typeof IntersectionObserver !== 'function') { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting && e.intersectionRatio >= ratio; })) { io.disconnect(); fn(); return; }
      if (gone && es.some(function (e) { return e.boundingClientRect.top < 0; })) { io.disconnect(); gone(); }
    }, { threshold: [0, ratio, 1] });
    io.observe(el);
  }
  // Espera a que todas las unidades pendientes dentro de un bloque queden armadas; quiet si alguna llegó sin animar
  function whenBuilt(units, fn) {
    var left = units.length, quiet = false;
    if (!left) { fn(true); return; }
    units.forEach(function (u) {
      u.addEventListener('built', function on(e) {
        if (e.target !== u) return;
        u.removeEventListener('built', on);
        if (e.detail && e.detail.quiet) quiet = true;
        if (--left === 0) fn(quiet);
      });
    });
  }

  /* ===================== P6 · KPIs que cuentan y minigráficos que crecen ===================== */
  function prepKpis() {
    $$('.kpis > .kpi.sw-wait').forEach(function (k) {
      var v = $('.kpi__v', k), tn = v && v.firstChild;
      if (!tn || tn.nodeType !== 3 || k._mo) return;
      // [portafolio] la cifra puede venir con coma decimal (español): se cuenta igual y se muestra con el mismo separador
      var txt = tn.nodeValue, sep = txt.indexOf(',') >= 0 ? ',' : '.', to = parseFloat(txt.replace(',', '.')), dec = (txt.replace(',', '.').split('.')[1] || '').length;
      if (isNaN(to)) return;
      // el lector de pantalla lee el valor real desde el inicio; la cifra que cuenta es solo visual
      var sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = txt;
      var vis = document.createElement('span'); vis.setAttribute('aria-hidden', 'true'); vis.textContent = (0).toFixed(dec).replace('.', sep);
      v.replaceChild(vis, tn); v.insertBefore(sr, vis);
      k._mo = { v: v, sr: sr, vis: vis, txt: txt, to: to, dec: dec, sep: sep };
      k.classList.add('mo-pre');
      k.addEventListener('built', function on(e) {
        if (e.target !== k) return;
        k.removeEventListener('built', on);
        if (RM() || (e.detail && e.detail.quiet)) { kpiFinal(k); return; }
        kpiRun(k);
      });
    });
  }
  function kpiFinal(k) {
    var m = k._mo; if (!m) return;
    k._mo = null;
    $$('.spark i', k).forEach(function (b) { b.getAnimations().forEach(function (a) { a.cancel(); }); });
    k.classList.remove('mo-pre');
    var tn = document.createTextNode(m.txt); // DOM final idéntico al original
    m.v.replaceChild(tn, m.vis); m.sr.remove();
    if (window.__i18n) window.__i18n.apply(m.v); // [portafolio] si el idioma cambió mientras contaba
  }
  function kpiRun(k) {
    var m = k._mo, untrack = track(function () { kpiFinal(k); });
    var bars = $$('.spark i', k);
    bars.forEach(function (b, j) {
      b.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 600, delay: j * 30, easing: E_STD, fill: 'backwards' });
    });
    k.classList.remove('mo-pre');
    var t0 = performance.now(), dur = 800;
    (function f(now) {
      if (k._mo !== m) return;
      var p = Math.min(1, (now - t0) / dur);
      m.vis.textContent = (m.to * easeOut3(p)).toFixed(m.dec).replace('.', m.sep);
      if (p < 1) { frame(f); return; }
      setTimeout(function () { if (k._mo === m) { kpiFinal(k); } untrack(); }, 600 + bars.length * 30 - dur + 20);
    })(t0);
  }

  /* ===================== P9 · Raíl Spec → Build → Verified y «pass» en cadena =====================
     Estado real: el raíl NO lo arma el rebuild (es estático) y su diseño final ya tiene «Verified/Shipped» en verde.
     Adaptación: al quedar armada la tarjeta, una línea cian recorre el borde del raíl tramo a tramo y enciende cada
     etapa; en el caso principal los tres «pass» aparecen en cadena; luego línea y luces se apagan con fundido,
     así el estado final es el diseño estático exacto. */
  /* Las tarjetas son más altas que la pantalla: el raíl arranca cuando queda armado el primer bloque de la tarjeta
     (el título, justo bajo el raíl) y el raíl está en vista; los «pass», cuando queda armada la ficha y su matriz se ve. */
  function prepCards() {
    $$('.card').forEach(function (card) {
      var first = $('.card__text > .sw-wait', card);
      if (!first || card._mo) return;
      card._mo = true;
      // etapas en reposo: las tres grises hasta que el recorrido llegue a la tarjeta (nunca nace una en verde)
      var railEl = $('.rail', card), pend = railEl ? $$('li', railEl) : [];
      function clearPend() { pend.forEach(function (li) { li.classList.remove('is-pend'); }); }
      if (!RM()) { pend.forEach(function (li) { li.classList.add('is-pend'); }); track(clearPend); }
      whenBuilt([first], function (quiet) {
        if (RM() || quiet) { clearPend(); card._mo = false; return; }
        whenSeen($('.rail', card), 0.9, function () { railRun(card); }, function () { clearPend(); card._mo = false; });
      });
      var ticket = $('.ticket.sw-wait', card), chips = $$('.matrix .chip', card);
      if (!ticket || !chips.length) return;
      ticket.classList.add('mo-pre');
      whenBuilt([ticket], function (quiet) {
        if (RM() || quiet) { ticket.classList.remove('mo-pre'); return; }
        whenSeen($('.matrix', card), 0.6, function () { chipsRun(ticket, chips); }, function () { ticket.classList.remove('mo-pre'); });
      });
    });
  }
  function chipsRun(ticket, chips) {
    var done = false, untrack = track(function () { done = true; chips.forEach(function (c) { c.getAnimations().forEach(function (a) { a.cancel(); }); }); ticket.classList.remove('mo-pre'); });
    (async function () {
      await wait(250);
      if (done) return;
      ticket.classList.remove('mo-pre');
      for (var j = 0; j < chips.length; j++) {
        if (done) return;
        chips[j].animate([{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'none' }], { duration: 200, delay: j * 100, easing: E_STD, fill: 'backwards' });
      }
      await wait(200 + chips.length * 100);
      untrack();
    })();
  }
  function railRun(card) {
    var rail = $('.rail', card), lis = $$('li', rail);
    var line = document.createElement('span'); line.className = 'mo-rail'; line.setAttribute('aria-hidden', 'true');
    rail.insertBefore(line, rail.firstChild); // al principio: li:last-child (etapa final en verde) no cambia
    var lits = lis.slice(0, -1).map(function (li) {
      var s = document.createElement('span'); s.className = 'mo-lit'; s.setAttribute('aria-hidden', 'true'); s.textContent = li.textContent;
      li.appendChild(s); return s;
    });
    var done = false;
    function fin() {
      if (done) return; done = true;
      lis.forEach(function (li) { li.classList.remove('is-pend'); }); // final: tres etapas activas, la última en verde
      line.remove(); lits.forEach(function (s) { s.remove(); });
      card._mo = false;
    }
    var untrack = track(fin);
    (async function () {
      for (var i = 0; i < 3; i++) {
        if (done) return;
        await anim(line, [{ transform: 'scaleX(' + (i / 3) + ')' }, { transform: 'scaleX(' + ((i + 1) / 3) + ')' }], { duration: 260, easing: E_STD, fill: 'forwards' });
        if (done) return;
        lis[i].classList.remove('is-pend'); // cada etapa se activa cuando la barra la alcanza; la tercera (verde) solo al completar
        if (lits[i]) anim(lits[i], [{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: 'forwards' });
        await wait(120);
      }
      await wait(1100);
      if (done) return;
      // salida animada: línea y luces se apagan juntas
      await Promise.all([line].concat(lits).map(function (el) { return anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: E_STD, fill: 'forwards' }); }));
      fin(); untrack();
    })();
  }

  /* ===================== P2 · «PORTFOLIO» sube letra a letra desde la máscara =====================
     swarm.js, en el paso de contenido de la palabra (data-rise), pone .is-rising en vez del fundido de 120 ms:
     es la misma entrada, no una segunda. Al terminar, la palabra vuelve a ser un solo texto (diseño estático exacto). */
  var WORD = 'PORTFOLIO';
  function prepWord() {
    var w = $('.hero__word.sw-wait[data-rise]');
    if (!w || w.classList.contains('is-split')) return;
    WORD = w.textContent;
    w.innerHTML = WORD.split('').map(function (ch, i) { return '<span class="l"><i style="--i:' + i + '">' + ch + '</i></span>'; }).join('');
    w.classList.add('is-split');
    var untrack = track(function () { unsplit(w); });
    function unsplit() { if (!w.classList.contains('is-split')) return; w.textContent = T('hero.word', WORD); w.classList.remove('is-split', 'is-rising'); untrack(); }
    var last = w.querySelectorAll('.l i')[WORD.length - 1];
    last.addEventListener('animationend', function () { unsplit(); });
    w.addEventListener('built', function on(e) {
      if (e.target !== w) return;
      w.removeEventListener('built', on);
      if ((e.detail && e.detail.quiet) || !w.classList.contains('is-rising')) unsplit();
    });
  }

  /* ===================== P3 · Retrato que se asienta + parallax de puntero (muy sutil) ===================== */
  function prepPortrait() {
    var fig = $('.hero__portrait.sw-wait'), pic = fig && $('picture', fig);
    if (!pic || fig.classList.contains('mo-pre')) return;
    fig.classList.add('mo-pre');
    fig.addEventListener('built', function on(e) {
      if (e.target !== fig) return;
      fig.removeEventListener('built', on);
      if (RM() || (e.detail && e.detail.quiet)) { fig.classList.remove('mo-pre'); return; }
      var a = pic.animate([{ scale: '1.04' }, { scale: '1' }], { duration: 1600, easing: E_OUT });
      fig.classList.remove('mo-pre');
      var untrack = track(function () { a.cancel(); });
      a.finished.then(untrack, untrack);
    });
  }
  // Parallax: palabra ±4 px y retrato ±1,5 px en sentido contrario; solo escritorio con puntero fino, con el hero
  // armado y en vista; suavizado por cuadro. Mueve variables en .hero (CSS usa la propiedad translate).
  function initParallax() {
    var hero = $('.hero'), mq = window.matchMedia && window.matchMedia('(pointer: fine) and (min-width: 900px)');
    if (!hero || !mq) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, looping = false, seen = true;
    if (typeof IntersectionObserver === 'function') new IntersectionObserver(function (es) { seen = es[0].isIntersecting; if (!seen) { tx = ty = 0; loop(); } }).observe(hero);
    function ready() { return mq.matches && !RM() && !busy() && !$('.hero .sw-wait') && seen; }
    function loop() {
      if (looping) return;
      looping = true;
      frame(function step() {
        cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
        if (Math.abs(tx - cx) < 0.002 && Math.abs(ty - cy) < 0.002) { cx = tx; cy = ty; looping = false; }
        hero.style.setProperty('--px', cx.toFixed(3)); hero.style.setProperty('--py', cy.toFixed(3));
        if (cx === 0 && cy === 0 && !looping) { hero.style.removeProperty('--px'); hero.style.removeProperty('--py'); }
        if (looping) frame(step);
      });
    }
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!ready()) { if (tx || ty) { tx = ty = 0; loop(); } return; }
      tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight - 0.5) * 2));
      loop();
    }, { passive: true });
    document.addEventListener('pointerleave', function () { tx = ty = 0; loop(); });
    document.documentElement.addEventListener('mouseleave', function () { tx = ty = 0; loop(); });
  }

  /* ===================== P5 · Línea de sección al entrar a «The Command Room» =====================
     Solo la línea cian con sus cruces (la transición de fondo de 1.200/1.100 px ya existe y no se toca). */
  function initSeam() {
    var rest = $('.rest'), room = $('#room');
    if (!rest || !room) return;
    var played = false, raf = 0;
    function check() {
      raf = 0;
      if (played || busy()) return;
      var r = room.getBoundingClientRect(), h = window.innerHeight;
      if (r.top <= 0) { played = true; return; }       // llegada más abajo: ya pasó
      if (r.top < h * 0.9) { played = true; if (!RM()) seamRun(rest); }
    }
    function sched() { if (!raf && !played) raf = requestAnimationFrame(check); }
    window.addEventListener('scroll', sched, { passive: true });
    document.addEventListener('built', sched);
    setTimeout(sched, 0);
  }
  function seamRun(rest) {
    var s = document.createElement('div');
    s.className = 'mo-seam'; s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<i></i><b style="left:0"></b><b style="left:50%"></b><b style="left:100%"></b>';
    rest.insertBefore(s, rest.firstChild);
    var line = $('i', s), xs = $$('b', s), done = false;
    var untrack = track(function () { done = true; s.remove(); });
    (async function () {
      await anim(line, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 300, easing: E_STD, fill: 'forwards' });
      if (done) return;
      await Promise.all(xs.map(function (x) { return anim(x, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 150, easing: E_OUT, fill: 'forwards' }); }));
      await wait(220);
      if (done) return;
      await anim(s, [{ opacity: 1 }, { opacity: 0 }], { duration: 250, easing: E_STD, fill: 'forwards' }); // sale animada
      s.remove(); untrack();
    })();
  }

  /* ===================== P7 · Latido «en vivo» (lento y tenue; dos puntos como máximo) ===================== */
  function initPulse() {
    if (RM()) return;
    [[$('.top__status .dot'), $('.top')], [$('.rb--live .switch'), $('.app__rail')]].forEach(function (p) {
      var el = p[0], unit = p[1];
      if (!el) return;
      function start() {
        el.classList.add('mo-pulse');
        if (typeof IntersectionObserver === 'function') new IntersectionObserver(function (es) { el.classList.toggle('is-vis', es[0].isIntersecting); }).observe(el);
        else el.classList.add('is-vis');
      }
      if (unit && unit.classList.contains('sw-wait')) unit.addEventListener('built', function on(e) { if (e.target !== unit) return; unit.removeEventListener('built', on); start(); });
      else start();
    });
  }

  /* ===================== P14 · Barra superior: se oculta al bajar y vuelve al subir =====================
     Estados: top (en su lugar, como parte del hero) · hidden (se desliza arriba) · float (fija arriba con fondo y
     la sección activa marcada). Es sticky: no empuja nada. Durante la etapa, la intro y el Tour no reaparece. */
  function initHeadroom() {
    var hdr = $('.top'), hero = $('.hero'), nav = $('.top__nav');
    if (!hdr || !hero) return;
    hdr.classList.add('mo-hr');
    var links = nav ? $$('a', nav) : [];
    var ind = document.createElement('span'); ind.className = 'top__ind'; ind.setAttribute('aria-hidden', 'true');
    if (nav) nav.appendChild(ind);
    var map = [['room', -1], ['cases', 0], ['more', 0], ['how', 1], ['background', -1], ['contact', 2]].map(function (m) { return [document.getElementById(m[0]), m[1]]; }).filter(function (m) { return m[0]; });
    var st = 'top', acc = 0, lastY = window.scrollY, raf = 0, active = -2, indOn = false;
    function set(s) {
      if (s === st) return;
      st = s;
      hdr.classList.toggle('is-hidden', s === 'hidden');
      hdr.classList.toggle('is-float', s === 'float');
      paintInd();
    }
    function section() {
      var line = hdr.offsetHeight + 48, a = -1;
      map.forEach(function (m) { if (m[0].getBoundingClientRect().top <= line) a = m[1]; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) a = 2;
      return a;
    }
    function paintInd() {
      var a = section();
      if (a !== active) {
        active = a;
        links.forEach(function (l, i) { if (i === a) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
      }
      var show = st === 'float' && a >= 0 && links[a];
      if (show) {
        var l = links[a], tf = 'translateX(' + l.offsetLeft + 'px) scaleX(' + (l.offsetWidth / 100) + ')';
        if (!indOn) { ind.style.transition = 'none'; ind.style.transform = tf; void ind.offsetWidth; ind.style.transition = ''; }
        else ind.style.transform = tf;
      }
      if (!!show !== indOn) { indOn = !!show; ind.classList.toggle('is-on', indOn); }
    }
    function upd() {
      raf = 0;
      var y = window.scrollY, dy = y - lastY;
      lastY = y;
      if (busy()) { set('top'); acc = 0; return; }
      var margin = Math.max(200, hero.offsetHeight / 2);
      if (y < 8) { set('top'); acc = 0; paintInd(); return; }
      if (dy > 0) acc = acc > 0 ? acc + dy : dy; else if (dy < 0) acc = acc < 0 ? acc + dy : dy;
      var focusIn = hdr.contains(document.activeElement);
      if (root.classList.contains('sw-touring')) { if (y > margin || st === 'float') set('hidden'); }
      else if (focusIn) { if (st === 'hidden') set('float'); }
      else if (acc >= 10 && y > margin) set('hidden');
      else if (acc <= -10 && st === 'hidden') set('float');
      paintInd();
    }
    function sched() { if (!raf) raf = requestAnimationFrame(upd); }
    window.addEventListener('scroll', sched, { passive: true });
    window.addEventListener('resize', sched, { passive: true });
    hdr.addEventListener('focusin', function () { if (st === 'hidden') set('float'); });
    window.__hdr = function () { return st; }; // sonda para la verificación
  }

  /* ===================== P11 · Un punto recorre los 4 pasos y vuelve una vez =====================
     Como la demo del storyboard: el punto va 1 → 2 → 3, vuelve a 2 («returned»), sigue 3 → 4; el tramo de línea se
     llena (y se vacía al volver) con scale; cada nodo se enciende con una capa en opacity. El estado de base del CSS es
     el estado final (todo encendido); «mo-pre» en .flow lo apaga solo mientras el bloque se arma. Horizontal en
     escritorio, vertical en teléfono y tableta: las posiciones se miden en el momento. */
  function prepSteps() {
    var box = $('.steps'), flow = box && box.parentNode, steps = $$('.steps > .step.sw-wait');
    if (!box || !flow.classList.contains('flow') || steps.length !== 4 || box._mo) return;
    box._mo = true;
    flow.classList.add('mo-pre');
    // estado final; avisa «motion:done» (el Tour de swarm.js cruza este bloque lento hasta recibir este aviso)
    function final() {
      flow.classList.remove('mo-pre', 'mo-run'); box._mo = false;
      try { flow.dispatchEvent(new CustomEvent('motion:done', { bubbles: true })); } catch (e) {}
    }
    whenBuilt(steps, function (quiet) {
      if (RM() || quiet) { final(); return; }
      whenSeen(flow, Math.min(0.5, (window.innerHeight * 0.8) / flow.offsetHeight), function () { stepsRun(box, flow, final); }, final);
    });
  }
  function stepsRun(box, flow, final) {
    var lis = $$('.step', box), nums = lis.map(function (li) { return $('.step__n', li); });
    var lit = nums.map(function (n) { return $('b', n); }), fills = $$('.step__seg i', box);
    if (lit.some(function (b) { return !b; }) || fills.length !== 3) { final(); return; }
    var f0 = flow.getBoundingClientRect();
    var pos = nums.map(function (n) { var r = n.getBoundingClientRect(); return [r.left + r.width / 2 - f0.left, r.top + r.height / 2 - f0.top]; });
    var row = pos.every(function (p) { return Math.abs(p[1] - pos[0][1]) < 2; });
    var ax = row ? 'scaleX' : 'scaleY';
    // durante el Tour a 2x la animación se acorta en proporción (el tramo lento del Tour se acelera igual)
    var sp = root.classList.contains('sw-touring') ? Math.max(1, +root.getAttribute('data-tour-speed') || 1) : 1;
    function D(ms) { return ms / sp; }
    flow.classList.add('mo-run');
    var tok = document.createElement('span'); tok.className = 'mo-tok'; tok.setAttribute('aria-hidden', 'true');
    var back = document.createElement('span'); back.className = 'mo-back'; back.setAttribute('aria-hidden', 'true'); back.textContent = T('motion.returned', '↩ returned');
    // desde aquí controla el JS: estilos en línea idénticos a «mo-pre», en el mismo cuadro
    fills.forEach(function (f) { f.style.transform = ax + '(0)'; });
    lit.forEach(function (b) { b.style.opacity = '0'; });
    flow.classList.remove('mo-pre');
    flow.appendChild(tok); flow.appendChild(back);
    if (row) { // sobre la línea, a mitad de camino entre 2 y 3
      back.style.transform = 'translate(' + (pos[1][0] + pos[2][0]) / 2 + 'px,' + (pos[1][1] - 30) + 'px) translate(-50%,-50%)';
    } else { // en el hueco entre el paso 2 y el 3, junto a la línea, alineado con el texto
      var r1 = lis[1].getBoundingClientRect(), r2 = lis[2].getBoundingClientRect(), h = $('h3', lis[1]).getBoundingClientRect();
      back.style.transform = 'translate(' + (h.left - f0.left) + 'px,' + ((r1.bottom + r2.top) / 2 - f0.top) + 'px) translateY(-50%)';
    }
    var done = false, cur = 0;
    function clean(el) { el.getAnimations().forEach(function (a) { a.cancel(); }); }
    function fin() {
      if (done) return; done = true;
      flow.removeChild(tok); flow.removeChild(back);
      fills.concat(lit).forEach(function (el) { clean(el); el.style.transform = ''; el.style.opacity = ''; });
      final();
    }
    var untrack = track(fin);
    function at(i) { return 'translate(' + pos[i][0] + 'px,' + pos[i][1] + 'px)'; }
    function light(i, o) {
      var b = lit[i], from = +getComputedStyle(b).opacity;
      return anim(b, [{ opacity: from }, { opacity: o }], { duration: D(150), fill: 'forwards' }).then(function () { if (!done) { b.style.opacity = String(o); clean(b); } });
    }
    async function go(i, mark) {
      var s = fills[Math.min(cur, i)], a = i > cur ? 0 : 1, z = 1 - a;
      await Promise.all([
        anim(tok, [{ transform: at(cur) }, { transform: at(i) }], { duration: D(380), easing: E_OUT, fill: 'forwards' }),
        anim(s, [{ transform: ax + '(' + a + ')' }, { transform: ax + '(' + z + ')' }], { duration: D(380), easing: E_OUT, fill: 'forwards' })
      ]);
      if (done) return;
      tok.style.transform = at(i);
      s.style.transform = ax + '(' + z + ')'; clean(s);
      cur = i;
      if (mark !== false) light(i, 1);
      await wait(D(150));
    }
    (async function () {
      tok.style.transform = at(0);
      await Promise.all([anim(tok, [{ opacity: 0 }, { opacity: 1 }], { duration: D(150), fill: 'forwards' }), light(0, 1)]);
      await wait(D(200)); if (done) return;
      await go(1); if (done) return;
      await go(2); if (done) return;
      anim(back, [{ opacity: 0 }, { opacity: 1 }], { duration: D(150), fill: 'forwards' }); light(2, 0.35);
      await go(1, false); await wait(D(250)); if (done) return;
      anim(back, [{ opacity: 1 }, { opacity: 0 }], { duration: D(150), fill: 'forwards' });
      await go(2); if (done) return;
      await go(3); await wait(D(600)); if (done) return;
      // el punto se funde en el nodo 4: queda el estado final del CSS (línea entera en cian, 4 nodos encendidos)
      await anim(tok, [{ opacity: 1 }, { opacity: 0 }], { duration: D(300), easing: E_STD, fill: 'forwards' });
      fin(); untrack();
    })();
  }

  /* ===================== P8 · El tablero cambia un estado y suma un evento =====================
     Una vez, 1,5 s después de quedar armados el Board y «What happened» con el Board en vista. La tarjeta no cambia de
     tamaño: la fila pasa de «in check» a «verified» con color y etiqueta cruzados; la lista de eventos tiene alto fijo,
     el evento nuevo entra por arriba y el más antiguo se desvanece por abajo. */
  var OK_SVG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>';
  function prepBoard() {
    var board = $('.board.sw-wait'), hap = $('.happened');
    if (!board || !hap || board._mo) return;
    board._mo = true;
    var units = [board].concat(hap.classList.contains('sw-wait') ? [hap] : []);
    whenBuilt(units, function (quiet) {
      if (RM() || quiet) return;
      whenSeen(board, 0.4, function () {
        var t = setTimeout(function () { boardRun(board, hap); }, 1500);
        var untrack = track(function () { clearTimeout(t); });
        setTimeout(untrack, 1600);
      });
    });
  }
  function boardRun(board, hap) {
    var row = $('.row[data-state=check]', board), list = $('.events', hap);
    if (!row || !list || $('#view-board', board).hidden) return;
    var st = $('.st', row), lab = $('.row__s', row), oldSvg = $('svg', st);
    var ok = document.createElement('span'); ok.className = 'mo-ok'; ok.innerHTML = OK_SVG;
    st.appendChild(ok);
    var labOld = document.createElement('span'); labOld.textContent = lab.textContent; lab.textContent = ''; lab.appendChild(labOld);
    var labNew = document.createElement('span'); labNew.className = 'mo-lab'; labNew.textContent = T('board.row.verified', 'verified'); lab.appendChild(labNew);
    var counts = $$('.board__count b', board);
    var done = false, evDone = false, li = null, last = null;
    function finRow() {
      st.innerHTML = OK_SVG; lab.setAttribute('data-i18n', 'board.row.verified'); lab.textContent = T('board.row.verified', 'verified');
      row.style.borderLeftColor = ''; row.setAttribute('data-state', 'verified');
      if (counts[0]) counts[0].textContent = '4';
      if (counts[1]) counts[1].textContent = '0';
    }
    function finEv() {
      if (evDone) return; evDone = true;
      if (!li) { lockList(list); li = newEvent(); list.insertBefore(li, list.firstChild); last = list.lastElementChild; }
      [li].concat($$('li', list)).forEach(function (e) { e.getAnimations().forEach(function (a) { a.cancel(); }); });
      if (last && last !== li) last.remove();
    }
    var untrack = track(function () { done = true; finRow(); finEv(); });
    (async function () {
      row.style.borderLeftColor = 'var(--ok)'; // transición de color del borde (300 ms, en CSS)
      await Promise.all([
        anim(oldSvg, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }),
        anim(ok, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 300, easing: E_STD, fill: 'forwards' })
      ]);
      if (done) return;
      await Promise.all([
        anim(labOld, [{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: 'forwards' }),
        anim(labNew, [{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: 'forwards' })
      ].concat(counts.slice(0, 2).map(function (c, i) {
        return anim(c, [{ opacity: 1 }, { opacity: 0 }], { duration: 75, fill: 'forwards' }).then(function () {
          c.textContent = i ? '0' : '4'; return anim(c, [{ opacity: 0 }, { opacity: 1 }], { duration: 75, fill: 'forwards' });
        }).then(function () { c.getAnimations().forEach(function (a) { a.cancel(); }); });
      })));
      if (done) return;
      finRow();
      await wait(350); if (done) return;
      // Evento nuevo: la lista guarda su alto; el más antiguo se va por abajo, el nuevo entra por arriba
      lockList(list);
      last = list.lastElementChild;
      await anim(last, [{ opacity: 1 }, { opacity: 0 }], { duration: 250, easing: E_STD, fill: 'forwards' });
      if (done) return;
      var olds = $$('li', list), first = olds.map(function (e) { return e.getBoundingClientRect().top; });
      li = newEvent();
      list.insertBefore(li, list.firstChild);
      var ps = olds.map(function (e, i) { var d = first[i] - e.getBoundingClientRect().top; return anim(e, [{ transform: 'translateY(' + d + 'px)' }, { transform: 'none' }], { duration: 300, easing: E_OUT }); });
      ps.push(anim(li, [{ transform: 'translateY(-100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: E_OUT }));
      await Promise.all(ps);
      if (done) return;
      finEv(); untrack();
    })();
  }
  function newEvent() {
    var li = document.createElement('li');
    li.innerHTML = '<span class="dot dot--ok"></span><span class="events__t"><span data-i18n="room.ev.passed8">' + T('room.ev.passed8', 'verif-8 passed 3/3 checks') +
      '</span><small><time>18:14</time> · <span data-i18n="room.ev.verified">' + T('room.ev.verified', 'Verified') + '</span></small></span>';
    return li;
  }
  function lockList(list) {
    if (list.classList.contains('mo-fixed')) return;
    list.style.height = list.offsetHeight + 'px'; // alto fijo: nada de lo que está debajo se mueve
    list.classList.add('mo-fixed');
    window.addEventListener('resize', function () { list.style.height = ''; list.classList.remove('mo-fixed'); }, { once: true });
  }

  /* ===================== Arranque ===================== */
  function prepAll() {
    if (RM()) return;
    prepWord();
    prepPortrait();
    prepKpis();
    prepBoard();
    prepCards();
    prepSteps();
  }
  document.addEventListener('swarm:init', prepAll);
  // lo demás, cuando swarm.js ya marcó sus unidades (DOMContentLoaded llega después de los scripts defer)
  function boot() { initParallax(); initSeam(); initPulse(); initHeadroom(); }
  if (document.readyState === 'complete') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
