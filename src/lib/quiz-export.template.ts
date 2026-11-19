/**
 * Builds a fully self-contained, offline-capable HTML file of the KI-Quiz.
 * No React, no build step, no external requests: styles, script, questions and
 * images (as data URIs) are inlined.
 *
 * The markup/CSS/JS below is the fixed, approved layout. Only the injected
 * QUESTIONS array and the SHUFFLE flag change from export to export.
 */

export type ExportQuestion = {
  question: string;
  answers: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
  source: string | null;
  image: string | null;
  question_en: string | null;
  answers_en: [string, string, string, string] | null;
  explanation_en: string | null;
  source_en: string | null;
};

function safeJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function buildQuizHtml(
  questions: ExportQuestion[],
  opts: { shuffle: boolean },
): string {
  const questionsJson = safeJson(questions);
  const shuffleJson = opts.shuffle ? "true" : "false";
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>signals KI Quiz</title>
<style>
:root {
  --yellow: #FAF05C;
  --black: #0A0A0A;
  --gray-light: #E6E6E6;
  --gray-mid: #808080;
  --white: #FFFFFF;
  --green: #34D17A;
  --red: #C4304A;
  --col: 720px;
  --pad: 1.1rem;
  --gap: .8rem;
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html { -webkit-text-size-adjust: 100%; }
body {
  min-height: 100%;
  background: var(--black);
  color: var(--white);
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 500;
  transition: background-color .35s ease;
}
#app { width: 100%; }

/* Fixed portrait column: same proportions on every screen, page scrolls if needed. */
.screen { min-height: 100dvh; width: 100%; padding: var(--pad); display: flex; flex-direction: column; }
.wrap { width: 100%; max-width: var(--col); margin: 0 auto; display: flex; flex-direction: column; gap: var(--gap); flex: 1; }
.center .wrap { justify-content: center; align-items: center; text-align: center; }
body.has-fs .screen { padding-top: calc(var(--pad) + 2.6rem); }
.bg-black { background: var(--black); }
h1 { font-weight: 700; letter-spacing: -0.03em; line-height: 0.95; }
strong { font-weight: 800; }
button { font-family: inherit; border: none; cursor: pointer; font-weight: 700; }
.press { transition: transform .08s ease, background-color .15s ease; }
.press:active { transform: translateY(3px); }

/* language screen */
.lang-title { color: var(--white); font-size: 2.4rem; }
.lang-sub { color: var(--gray-mid); font-size: 1.05rem; margin-top: .5rem; font-weight: 600; }
.lang-grid { display: flex; flex-direction: column; gap: var(--gap); width: 100%; margin-top: 1.5rem; }
.lang-btn { border: 4px solid var(--black); padding: 1.2rem; display: flex; align-items: center; justify-content: center; gap: 1rem; background: var(--gray-light); }
.lang-btn.de { background: var(--yellow); }
.lang-flag { font-size: 2rem; line-height: 1; }
.lang-name { color: var(--black); font-size: 1.3rem; font-weight: 700; }

/* question header */
.q-head, .rv-head { display: flex; align-items: center; gap: .8rem; flex-shrink: 0; min-height: 2.8rem; }
.q-head .meta { flex: 1; min-width: 0; }
.q-label { color: var(--yellow); font-weight: 700; text-transform: uppercase; letter-spacing: .08em; font-size: .8rem; margin-bottom: .4rem; }
.bar { height: 10px; background: rgba(128,128,128,.3); border: 2px solid var(--yellow); }
.bar > div { height: 100%; background: var(--yellow); transition: width .4s ease; }
.score-pill { background: var(--yellow); color: var(--black); font-weight: 700; font-size: 1rem; padding: .35em .6em; border: 2px solid var(--yellow); white-space: nowrap; }

/* question box */
.q-box { background: var(--white); color: var(--black); padding: 1rem; border: 4px solid var(--yellow); flex-shrink: 0; }
.q-box p { font-size: 1.15rem; font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; }

/* answers — identical geometry on the question screen and on the reveal screen */
.answers { display: flex; flex-direction: column; gap: var(--gap); }
.answer {
  background: var(--gray-light); color: var(--black); border: 4px solid var(--white);
  padding: .7rem; text-align: left; display: flex; align-items: center; gap: .8rem;
  width: 100%; font-family: inherit;
}
.answer .letter { background: var(--black); color: var(--yellow); width: 2.4rem; height: 2.4rem; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; flex-shrink: 0; }
.answer .txt { font-size: 1.05rem; font-weight: 700; line-height: 1.2; }
@media (hover: hover) {
  button.answer:hover { background: var(--yellow); border-color: var(--yellow); }
}

/* reveal states */
.answer.rv { cursor: default; transition: background-color .6s ease, border-color .6s ease, color .6s ease; }
.answer.rv.is-chosen { background: var(--yellow); border-color: var(--black); }
.answer.rv.is-correct { background: var(--green); border-color: var(--green); }
.answer .badge { margin-left: auto; flex-shrink: 0; color: var(--red); font-weight: 800; text-transform: uppercase; letter-spacing: .07em; font-size: .72rem; white-space: nowrap; }
.answer .tick { margin-left: auto; flex-shrink: 0; font-size: 1.3rem; font-weight: 800; opacity: 0; transition: opacity .4s ease .3s; }
.answer.rv.is-correct .tick { opacity: 1; }

/* reveal head */
.rv-icon { width: 2.2rem; height: 2.2rem; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 800; flex-shrink: 0; }
.rv-title { font-size: 1.6rem; }

/* explanation box — heading, text, image and source in one white block */
.rv-expl { background: var(--white); color: var(--black); padding: 1rem; margin-top: 1.6rem; display: flex; flex-direction: column; gap: .6rem; animation: rise .5s ease .55s both; }
.cta-row { animation: rise .4s ease .8s both; }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.rv-expl-label { font-size: 1.2rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; line-height: 1; }
.rv-expl p { font-size: .9rem; font-weight: 500; line-height: 1.45; white-space: pre-line; }
.rv-img { width: 100%; }
.rv-img .imgwrap { width: 100%; display: block; cursor: zoom-in; background: none; border: none; padding: 0; }
.rv-img img { width: 100%; height: auto; display: block; border: 2px solid rgba(10,10,10,.15); }
.rv-src { font-size: .65rem; color: rgba(10,10,10,.55); word-break: break-word; padding-top: .6rem; border-top: 2px solid rgba(10,10,10,.12); }
.rv-src a { color: inherit; }

.cta-row { display: flex; flex-shrink: 0; margin-top: auto; padding-top: var(--gap); }
.cta { font-size: 1.1rem; padding: .8rem 1.4rem; width: 100%; text-align: center; }
.cta.on-black { background: var(--yellow); color: var(--black); }

/* score screen */
.score-label { color: rgba(255,255,255,.65); font-weight: 700; text-transform: uppercase; letter-spacing: .12em; font-size: 1rem; }
.score-big { display: flex; align-items: baseline; justify-content: center; gap: .5rem; line-height: 1; }
.score-big .n { color: var(--yellow); font-weight: 700; font-size: 7rem; letter-spacing: -0.05em; font-variant-numeric: tabular-nums; }
.score-big .d { color: rgba(255,255,255,.5); font-weight: 700; font-size: 3rem; letter-spacing: -0.04em; }
.score-msg { color: var(--white); font-size: 1.3rem; font-weight: 700; margin-top: 1rem; max-width: 30ch; }
.fs-btn { position: fixed; top: .6rem; right: .6rem; z-index: 20; background: rgba(10,10,10,.85); color: var(--yellow); border: 1px solid rgba(250,240,92,.4); width: 2.2rem; height: 2.2rem; font-size: 1rem; display: none; }

/* lightbox */
#lightbox { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.94); display: none; align-items: center; justify-content: center; padding: 1rem; touch-action: pinch-zoom; }
#lightbox.open { display: flex; }
#lightbox img { max-width: 100%; max-height: 100%; object-fit: contain; }
#lightboxClose { position: absolute; top: .6rem; right: .6rem; width: 3rem; height: 3rem; font-size: 1.5rem; background: var(--yellow); color: var(--black); border: none; }

/* no-js hint */
#nojs { position: fixed; inset: 0; z-index: 80; background: var(--yellow); color: var(--black); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1.5rem; gap: .75rem; }
#nojs h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -.02em; }
#nojs p { font-size: 1rem; font-weight: 600; max-width: 34ch; line-height: 1.35; }

@media (prefers-reduced-motion: reduce) {
  .answer.rv, .bar > div, .answer .tick { transition: none; }
  .rv-expl, .cta-row { animation: none; }
}
</style>
</head>
<body>
<div id="app">
  <!-- Static start screen: visible even when JavaScript is disabled (e.g. iOS Quick Look). -->
  <div class="screen bg-black center">
    <div class="wrap">
      <div>
        <h1 class="lang-title">Sprache wählen</h1>
        <p class="lang-sub">Choose your language</p>
      </div>
      <div class="lang-grid">
        <button class="lang-btn de press" data-lang="de"><span class="lang-flag">🇩🇪</span><span class="lang-name">Deutsch</span></button>
        <button class="lang-btn press" data-lang="en"><span class="lang-flag">🇬🇧</span><span class="lang-name">English</span></button>
      </div>
    </div>
  </div>
</div>
<div id="nojs">
  <h2>Bitte in einem Browser öffnen</h2>
  <p>Diese Datei braucht JavaScript. Die Vorschau der Dateien- und Mail-App führt kein JavaScript aus – deshalb reagiert hier nichts.</p>
  <p><strong>Computer:</strong> Datei doppelklicken oder ins Browserfenster ziehen.</p>
  <p><strong>iPhone / iPad:</strong> lokale HTML-Dateien lassen sich in Safari nicht starten. Bitte den geteilten <strong>Link</strong> verwenden – oder die Datei in einer App mit eigenem Browser öffnen (z.&nbsp;B. „Documents“ von Readdle).</p>
</div>
<div id="lightbox"><button id="lightboxClose" aria-label="Schließen">✕</button><img id="lightboxImg" src="" alt="" /></div>
<button class="fs-btn" id="fsBtn" title="Vollbild">⛶</button>

<script>
(function () {
  // JavaScript works: hide the "open in Safari" hint immediately.
  var nojs = document.getElementById("nojs");
  if (nojs && nojs.parentNode) nojs.parentNode.removeChild(nojs);

  var QUESTIONS = ${questionsJson};
  var SHUFFLE = ${shuffleJson};

  var I18N = {
    de: { question: "Frage", points: "Punkte", correct: "Richtig!", wrong: "Leider falsch.",
      source: "Quelle", nextQuestion: "Nächste Frage →", viewResult: "Ergebnis ansehen →",
      yourResult: "dein Ergebnis", newGame: "Neues Spiel →", langTitle: "Sprache wählen",
      langSubtitle: "Choose your language", german: "Deutsch", english: "English", you: "Du",
      zoom: "Zum Vergrößern tippen", explanation: "Erläuterung", yourAnswer: "Deine Antwort" },
    en: { question: "Question", points: "Points", correct: "Correct!", wrong: "Wrong answer.",
      source: "Source", nextQuestion: "Next question →", viewResult: "View result →",
      yourResult: "your result", newGame: "New game →", langTitle: "Choose language",
      langSubtitle: "Sprache wählen", german: "Deutsch", english: "English", you: "You",
      zoom: "Tap to enlarge", explanation: "Explanation", yourAnswer: "Your answer" }
  };


  function message(score, total, lang) {
    var pct = total ? score / total : 0;
    if (lang === "en") {
      if (pct === 1) return "Legend. You are the AI.";
      if (pct >= 0.8) return "Impressive. A true AI pro.";
      if (pct >= 0.6) return "Solid performance. Well done!";
      if (pct >= 0.4) return "Room to grow — but respectable.";
      return "Time for an Innovation Briefing!";
    }
    if (pct === 1) return "Legende. Du bist die KI.";
    if (pct >= 0.8) return "Beeindruckend. Echter KI-Profi.";
    if (pct >= 0.6) return "Solide Performance. Gut gemacht!";
    if (pct >= 0.4) return "Da geht noch was – aber respektabel.";
    return "Zeit für ein Innovation Briefing!";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  // **bold** -> <strong>
  function rich(s) {
    return esc(s).replace(/\\*\\*([^*]+)\\*\\*/g, "<strong>$1</strong>");
  }

  function shuffleArr(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function localize(q, lang) {
    var o = {
      question: q.question, answers: q.answers.slice(), correct: q.correct,
      explanation: q.explanation, source: q.source, image: q.image
    };
    if (lang === "en") {
      if (q.question_en && q.question_en.trim()) o.question = q.question_en;
      if (q.explanation_en && q.explanation_en.trim()) o.explanation = q.explanation_en;
      if (q.source_en && q.source_en.trim()) o.source = q.source_en;
      var ae = q.answers_en;
      if (ae && ae.length === 4) {
        var allSet = true;
        for (var i = 0; i < 4; i++) if (!ae[i] || !String(ae[i]).trim()) allSet = false;
        if (allSet) o.answers = ae.slice();
      }
    }
    return o;
  }

  function shuffleAnswers(q) {
    var idx = shuffleArr([0, 1, 2, 3]);
    var answers = idx.map(function (i) { return q.answers[i]; });
    var correct = idx.indexOf(q.correct);
    return { question: q.question, answers: answers, correct: correct,
      explanation: q.explanation, source: q.source, image: q.image };
  }

  var state = { phase: "language", lang: "de", list: [], index: 0, score: 0, selected: null };
  var app = document.getElementById("app");

  function startQuiz(lang) {
    state.lang = lang;
    var base = QUESTIONS.map(function (q) { return localize(q, lang); });
    if (SHUFFLE) base = shuffleArr(base).map(shuffleAnswers);
    state.list = base;
    state.index = 0; state.score = 0; state.selected = null;
    state.phase = base.length ? "question" : "score";
    render();
  }

  function paint() {
    window.scrollTo(0, 0);
  }

  function render() {
    var L = I18N[state.lang] || I18N.de;
    if (state.phase === "language") return renderLanguage();
    if (state.phase === "question") return renderQuestion(L);
    if (state.phase === "reveal") return renderReveal(L);
    return renderScore(L);
  }

  function renderLanguage() {
    var L = I18N.de;
    paint();
    app.innerHTML =
      '<div class="screen bg-black center">' +
        '<div class="wrap">' +
          '<div>' +
            '<h1 class="lang-title">' + esc(L.langTitle) + '</h1>' +
            '<p class="lang-sub">' + esc(L.langSubtitle) + '</p>' +
          '</div>' +
          '<div class="lang-grid">' +
            '<button class="lang-btn de press" data-lang="de"><span class="lang-flag">🇩🇪</span><span class="lang-name">Deutsch</span></button>' +
            '<button class="lang-btn press" data-lang="en"><span class="lang-flag">🇬🇧</span><span class="lang-name">English</span></button>' +
          '</div>' +
        '</div>' +
      '</div>';
    Array.prototype.forEach.call(app.querySelectorAll("[data-lang]"), function (b) {
      b.addEventListener("click", function () { startQuiz(b.getAttribute("data-lang")); });
    });
  }

  function renderQuestion(L) {
    var q = state.list[state.index];
    var total = state.list.length;
    var progress = (state.index / total) * 100;
    var html =
      '<div class="screen bg-black"><div class="wrap">' +
        '<div class="q-head">' +
          '<div class="meta">' +
            '<div class="q-label">' + esc(L.question) + ' ' + (state.index + 1) + ' / ' + total + '</div>' +
            '<div class="bar"><div style="width:' + progress + '%"></div></div>' +
          '</div>' +
          '<div class="score-pill">' + state.score + ' ' + esc(L.points) + '</div>' +
        '</div>' +
        '<div class="q-box"><p>' + rich(q.question) + '</p></div>' +
        '<div class="answers">';
    for (var i = 0; i < q.answers.length; i++) {
      html += '<button class="answer press" data-i="' + i + '">' +
        '<span class="letter">' + String.fromCharCode(65 + i) + '</span>' +
        '<span class="txt">' + esc(q.answers[i]) + '</span></button>';
    }
    html += '</div></div></div>';
    paint("black");
    app.innerHTML = html;
    Array.prototype.forEach.call(app.querySelectorAll("[data-i]"), function (b) {
      b.addEventListener("click", function () {
        var i = Number(b.getAttribute("data-i"));
        state.selected = i;
        if (i === q.correct) state.score++;
        state.phase = "reveal";
        render();
      });
    });
  }

  function renderReveal(L) {
    var q = state.list[state.index];
    var ok = state.selected === q.correct;
    var isLast = state.index === state.list.length - 1;
    var src = q.source ? String(q.source).trim() : "";
    var isUrl = /^https?:\\/\\//i.test(src);
    var html =
      '<div class="screen bg-black"><div class="wrap">' +
        '<div class="rv-head">' +
          '<div class="rv-icon" style="background:' + (ok ? "var(--green)" : "var(--yellow)") + ';color:var(--black)">' +
            (ok ? "\\u2713" : "\\u2715") + '</div>' +
          '<h1 class="rv-title" style="color:' + (ok ? "var(--green)" : "var(--yellow)") + '">' +
            esc(ok ? L.correct : L.wrong) + '</h1>' +
        '</div>' +
        '<div class="q-box"><p>' + rich(q.question) + '</p></div>' +
        '<div class="answers">';
    for (var i = 0; i < q.answers.length; i++) {
      var isCorrect = i === q.correct;
      var isChosen = i === state.selected;
      // The correct row starts in its "before" state and turns green a moment later.
      var cls = "answer rv" + (isChosen ? " is-chosen" : "");
      html += '<div class="' + cls + '"' + (isCorrect ? ' id="correctRow"' : '') + '>' +
        '<span class="letter">' + String.fromCharCode(65 + i) + '</span>' +
        '<span class="txt">' + esc(q.answers[i]) + '</span>' +
        (isCorrect ? '<span class="tick">\\u2713</span>' : '') +
        '</div>';
    }
    html += '</div>' +
      '<div class="rv-expl">' +
        '<div class="rv-expl-label">' + esc(L.explanation) + '</div>' +
        '<p>' + rich(q.explanation) + '</p>' +
        (q.image
          ? '<div class="rv-img">' +
              '<button type="button" class="imgwrap" id="zoomBtn" aria-label="' + esc(L.zoom) + '">' +
                '<img src="' + esc(q.image) + '" alt="" />' +
              '</button>' +
            '</div>'
          : '') +
        (src ? '<p class="rv-src">' + esc(L.source) + ': ' +
            (isUrl ? '<a href="' + esc(src) + '" target="_blank" rel="noopener noreferrer">' + esc(src) + '</a>' : esc(src)) +
          '</p>' : '') +
      '</div>' +
      '<div class="cta-row">' +
        '<button class="cta press on-black" id="nextBtn">' +
          esc(isLast ? L.viewResult : L.nextQuestion) + '</button>' +
      '</div>' +
    '</div></div>';
    paint();
    app.innerHTML = html;

    // Reveal animation: grey (or yellow, if it was the pick) fades into green.
    var correctRow = document.getElementById("correctRow");
    if (correctRow) {
      setTimeout(function () {
        if (!correctRow.parentNode) return;
        correctRow.className = "answer rv is-correct";
      }, 650);
    }

    var zoomBtn = document.getElementById("zoomBtn");
    if (zoomBtn) {
      zoomBtn.addEventListener("click", function () { openLightbox(q.image); });
    }
    document.getElementById("nextBtn").addEventListener("click", function () {
      if (isLast) { state.phase = "score"; }
      else { state.index++; state.selected = null; state.phase = "question"; }
      render();
    });
  }

  function renderScore(L) {
    var total = state.list.length;
    paint();
    app.innerHTML =
      '<div class="screen bg-black center"><div class="wrap">' +
        '<div>' +
          '<p class="score-label">' + esc(L.yourResult) + '</p>' +
          '<div class="score-big"><span class="n" id="scoreNum">0</span><span class="d">/ ' + total + '</span></div>' +
          '<p class="score-msg">' + esc(message(state.score, total, state.lang)) + '</p>' +
        '</div>' +
        '<button class="cta press on-black" id="restartBtn" style="margin-top:1.5rem;width:auto">' + esc(L.newGame) + '</button>' +
      '</div></div>';
    var el = document.getElementById("scoreNum");
    var target = state.score, start = null;
    function step(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / 1000, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    document.getElementById("restartBtn").addEventListener("click", function () {
      state.phase = "language";
      render();
    });
  }

  // Lightbox
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  function openLightbox(srcUrl) {
    lightboxImg.setAttribute("src", srcUrl);
    lightbox.className = "open";
  }
  function closeLightbox() {
    lightbox.className = "";
    lightboxImg.setAttribute("src", "");
  }
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightboxImg) return;
    closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.keyCode === 27) closeLightbox();
  });

  // Fullscreen button only where the API actually exists (not on iPhone).
  var fsBtn = document.getElementById("fsBtn");
  if (document.documentElement.requestFullscreen) {
    fsBtn.style.display = "block";
    document.body.className = "has-fs";
    fsBtn.addEventListener("click", function () {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else { document.documentElement.requestFullscreen(); }
    });
  } else if (fsBtn && fsBtn.parentNode) {
    fsBtn.parentNode.removeChild(fsBtn);
  }

  render();

})();
</script>
</body>
</html>`;
}
