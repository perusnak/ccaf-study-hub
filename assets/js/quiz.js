/* quiz.js — practice mode + exam simulation (global: window.Quiz) */
(function () {
  'use strict';
  var el = window.UI.el;
  var shuffle = window.UI.shuffle;
  var Q = window.CCAF_QUESTIONS;
  var META = window.CCAF_META;
  var LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

  // module-level session so re-renders keep state
  var root = null;
  var session = null; // { mode, questions, idx, answers:{qId:idx}, reveal:bool, timer }

  function domainPill(q) {
    if (!q.domain) return el('span', { class: 'pill', text: q.scenario });
    return el('span', { class: 'pill d' + q.domain, text: 'D' + q.domain + ' · ' + q.scenario });
  }

  function scenarios() {
    var seen = {}, out = [];
    Q.forEach(function (q) { if (!seen[q.scenario]) { seen[q.scenario] = 1; out.push(q.scenario); } });
    return out;
  }

  /* ============================ entry / mode picker ============================ */
  function renderHome() {
    var st = window.Store.stats();
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'eyebrow', text: 'Practice & exam' }));
    root.appendChild(el('h1', { text: 'Train with exam-style questions' }));
    root.appendChild(el('p', { class: 'lead', text:
      'Choose a mode. Practice gives instant feedback; the exam simulation mirrors the real format and scores you against the 720 passing line.' }));

    var modes = el('div', { class: 'mode-grid', style: 'margin-top:1.2rem' }, [
      el('div', { class: 'card mode-card', onClick: startPracticeSetup }, [
        el('h3', { text: '📚 Practice mode' }),
        el('p', { class: 'muted', text:
          'Filter by domain or scenario. One question at a time with immediate feedback and the full explanation. Flag tricky ones for review.' }),
        el('div', { style: 'margin-top:.8rem' }, [el('span', { class: 'btn accent', text: 'Practice →' })]),
      ]),
      el('div', { class: 'card mode-card', onClick: startExamSetup }, [
        el('h3', { text: '⏱️ Exam simulation' }),
        el('p', { class: 'muted', text:
          'Timed, exam-style. Answer a set drawn across scenarios, submit, then get a 100–1000 score, pass/fail vs 720, and a per-domain breakdown.' }),
        el('div', { style: 'margin-top:.8rem' }, [el('span', { class: 'btn', text: 'Simulate →' })]),
      ]),
    ]);
    root.appendChild(modes);

    if (st.answered) {
      root.appendChild(el('div', { class: 'notice', style: 'margin-top:1.2rem' }, [
        el('span', { html: 'So far: <strong>' + st.answered + '</strong> answered · <strong>' +
          st.accuracy + '%</strong> accuracy · <strong>' + st.flagged + '</strong> flagged.' }),
      ]));
    }
  }

  /* ============================ practice setup ============================ */
  function startPracticeSetup() {
    root.innerHTML = '';
    backBtnTo(renderHome);
    root.appendChild(el('h2', { text: 'Practice mode' }));

    var domainSel = el('select', {}, [optionEl('all', 'All domains')].concat(
      META.domains.map(function (d) { return optionEl('d' + d.n, 'Domain ' + d.n + ' — ' + d.name); })));

    var scenSel = el('select', {}, [optionEl('all', 'All scenarios')].concat(
      scenarios().map(function (s) { return optionEl(s, s); })));

    var setSel = el('select', {}, [
      optionEl('all', 'All questions'),
      optionEl('examples', 'Worked examples only'),
      optionEl('practice', 'Practice test only'),
    ]);

    var onlyUnseen = el('input', { type: 'checkbox' });
    var onlyFlagged = el('input', { type: 'checkbox' });

    var toolbar = el('div', { class: 'card' }, [
      el('div', { class: 'grid cols-3' }, [
        labeled('Domain', domainSel),
        labeled('Scenario', scenSel),
        labeled('Question set', setSel),
      ]),
      el('div', { style: 'display:flex;gap:1.4rem;margin-top:1rem;flex-wrap:wrap' }, [
        el('label', { style: 'display:flex;gap:.4rem;align-items:center;font-size:.9rem' }, [onlyUnseen, 'Only unseen']),
        el('label', { style: 'display:flex;gap:.4rem;align-items:center;font-size:.9rem' }, [onlyFlagged, 'Only flagged']),
      ]),
      el('div', { style: 'margin-top:1.1rem' }, [
        el('button', { class: 'btn accent', onClick: function () {
          var pool = filterPool({
            domain: domainSel.value, scenario: scenSel.value, set: setSel.value,
            unseen: onlyUnseen.checked, flagged: onlyFlagged.checked,
          });
          if (!pool.length) { showFilterNotice(); return; }
          session = { mode: 'practice', questions: shuffle(pool), idx: 0, answers: {}, reveal: true };
          renderQuestion();
        } }, ['Start practising']),
      ]),
    ]);
    root.appendChild(toolbar);

    function showFilterNotice() {
      var old = toolbar.querySelector('.filter-notice');
      if (old) old.parentNode.removeChild(old);
      toolbar.appendChild(el('div', { class: 'notice filter-notice', style: 'margin-top:1rem' }, [
        el('span', { html: 'No questions match those filters. Try widening them — or browse more ' +
          'practice sets on the ' }),
        el('a', { href: '#/resources', text: 'Resources page' }),
        el('span', { text: '.' }),
      ]));
    }
  }

  function filterPool(f) {
    return Q.filter(function (q) {
      if (f.domain && f.domain !== 'all' && ('d' + q.domain) !== f.domain) return false;
      if (f.scenario && f.scenario !== 'all' && q.scenario !== f.scenario) return false;
      if (f.set && f.set !== 'all' && q.set !== f.set) return false;
      if (f.unseen && window.Store.isAnswered(q.id)) return false;
      if (f.flagged && !window.Store.isFlagged(q.id)) return false;
      return true;
    });
  }

  /* ============================ exam setup ============================ */
  function startExamSetup() {
    root.innerHTML = '';
    backBtnTo(renderHome);
    root.appendChild(el('h2', { text: 'Exam simulation' }));

    var lenSel = el('select', {}, [
      optionEl('20', '20 questions (quick)'),
      optionEl('40', '40 questions (half mock)'),
      optionEl('60', '60 questions (full mock — real exam length)'),
    ]);
    lenSel.value = '60';

    var scopeSel = el('select', {}, [
      optionEl('exam', '4 random scenarios (exam-like)'),
      optionEl('all', 'All scenarios'),
    ]);

    var timed = el('input', { type: 'checkbox' });
    timed.checked = true;

    root.appendChild(el('div', { class: 'card' }, [
      el('div', { class: 'grid cols-2' }, [
        labeled('Length', lenSel),
        labeled('Scope', scopeSel),
      ]),
      el('label', { style: 'display:flex;gap:.4rem;align-items:center;font-size:.9rem;margin-top:1rem' },
        [timed, 'Timed (2 min / question — matches real exam pace)']),
      el('div', { class: 'notice', style: 'margin-top:1rem', html:
        'No feedback until you submit — just like the real exam. The 4-scenario scope mirrors the “4 of 8” exam format.' }),
      el('div', { style: 'margin-top:1.1rem' }, [
        el('button', { class: 'btn accent', onClick: function () {
          var pool = buildExamPool(scopeSel.value, parseInt(lenSel.value, 10));
          var minutes = timed.checked ? Math.round(pool.length * 2) : 0;
          session = {
            mode: 'exam', questions: pool, idx: 0, answers: {}, reveal: false,
            endTs: minutes ? Date.now() + minutes * 60000 : 0,
          };
          renderQuestion();
        } }, ['Begin exam']),
      ]),
    ]));
  }

  function buildExamPool(scope, n) {
    var pool = Q.slice();
    if (scope === 'exam') {
      var all = scenarios();
      var pick = shuffle(all).slice(0, Math.min(4, all.length));
      pool = Q.filter(function (q) { return pick.indexOf(q.scenario) !== -1; });
    }
    return shuffle(pool).slice(0, Math.min(n, pool.length));
  }

  /* ============================ question rendering ============================ */
  function renderQuestion() {
    var s = session;
    var q = s.questions[s.idx];
    root.innerHTML = '';

    var wrap = el('div', { class: 'quiz-wrap' }, []);

    // top toolbar
    var top = el('div', { class: 'quiz-toolbar' }, [
      el('button', { class: 'btn ghost', onClick: confirmQuit }, ['← Exit']),
      el('span', { class: 'muted', text: (s.mode === 'exam' ? 'Exam' : 'Practice') + ' · Question ' +
        (s.idx + 1) + ' of ' + s.questions.length }),
    ]);
    if (s.mode === 'exam' && s.endTs) {
      var timerEl = el('span', { class: 'pill', style: 'margin-left:auto' }, ['']);
      top.appendChild(timerEl);
      startTimer(timerEl);
    } else {
      top.appendChild(el('span', { class: 'muted', style: 'margin-left:auto', html:
        'Score so far: <strong>' + practiceScore() + '</strong>' }));
    }
    wrap.appendChild(top);

    // progress
    wrap.appendChild(el('div', { class: 'progress-line' }, [
      el('div', { class: 'fill', style: 'width:' + ((s.idx) / s.questions.length * 100) + '%' }),
    ]));

    // meta + flag
    var flagged = window.Store.isFlagged(q.id);
    var meta = el('div', { class: 'q-meta' }, [
      domainPill(q),
      el('span', { class: 'pill', text: q.set === 'examples' ? 'Worked example' : 'Practice' }),
      el('button', { class: 'btn ghost', style: 'margin-left:auto;padding:.3rem .7rem;font-size:.82rem',
        onClick: function (e) {
          var on = window.Store.toggleFlag(q.id);
          e.target.textContent = on ? '★ Flagged' : '☆ Flag';
        } }, [flagged ? '★ Flagged' : '☆ Flag']),
    ]);
    wrap.appendChild(meta);

    // situation + prompt
    if (q.situation) wrap.appendChild(el('div', { class: 'q-situation', html: q.situation }));
    if (q.prompt) wrap.appendChild(el('div', { class: 'q-prompt', html: q.prompt }));

    // options
    var chosen = s.answers[q.id];
    var answeredNow = (chosen != null);
    var list = el('ul', { class: 'options' }, q.options.map(function (opt, i) {
      var li = el('li', { class: 'option' + (chosen === i ? ' selected' : '') }, [
        el('span', { class: 'key', text: LETTERS[i] }),
        el('span', { html: opt }),
      ]);
      if (s.reveal && answeredNow) {
        li.classList.add('disabled');
        if (i === q.correctIndex) li.classList.add('correct');
        else if (i === chosen) li.classList.add('wrong');
      }
      li.addEventListener('click', function () { choose(q, i); });
      return li;
    }));
    wrap.appendChild(list);

    // explanation (practice, after answering)
    if (s.reveal && answeredNow) {
      var correct = chosen === q.correctIndex;
      wrap.appendChild(el('div', { class: 'explanation' + (correct ? '' : ' bad') }, [
        el('b', { text: (correct ? '✓ Correct. ' : '✗ Not quite. ') +
          'Answer: ' + LETTERS[q.correctIndex] + '. ' }),
        el('span', { html: q.explanation || '' }),
      ]));
    }

    // nav
    var nav = el('div', { class: 'quiz-nav' }, []);
    nav.appendChild(el('button', { class: 'btn ghost', disabled: s.idx === 0 ? 'disabled' : null,
      onClick: function () { if (s.idx > 0) { s.idx--; renderQuestion(); } } }, ['← Previous']));

    if (s.idx < s.questions.length - 1) {
      nav.appendChild(el('button', { class: 'btn', onClick: function () { s.idx++; renderQuestion(); } }, ['Next →']));
    } else if (s.mode === 'exam') {
      nav.appendChild(el('button', { class: 'btn accent', onClick: finishExam }, ['Submit exam']));
    } else {
      nav.appendChild(el('button', { class: 'btn accent', onClick: renderPracticeSummary }, ['Finish']));
    }
    wrap.appendChild(nav);

    root.appendChild(wrap);
  }

  function choose(q, i) {
    var s = session;
    if (s.reveal && s.answers[q.id] != null) return; // locked after reveal in practice
    s.answers[q.id] = i;
    if (s.mode === 'practice') {
      window.Store.recordAnswer(q.id, i, i === q.correctIndex);
    }
    renderQuestion();
  }

  function practiceScore() {
    var s = session, ok = 0, tot = 0;
    s.questions.forEach(function (q) {
      if (s.answers[q.id] != null) { tot++; if (s.answers[q.id] === q.correctIndex) ok++; }
    });
    return ok + '/' + tot;
  }

  /* ============================ timer ============================ */
  function startTimer(node) {
    function tick() {
      if (!session || session.mode !== 'exam' || !session.endTs) return;
      var left = session.endTs - Date.now();
      if (left <= 0) { node.textContent = '00:00'; finishExam(); return; }
      var m = Math.floor(left / 60000), sec = Math.floor((left % 60000) / 1000);
      node.textContent = (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
      if (left < 60000) node.style.color = 'var(--orange)';
      session._timer = setTimeout(tick, 1000);
    }
    if (session._timer) clearTimeout(session._timer);
    tick();
  }

  /* ============================ results ============================ */
  function renderPracticeSummary() {
    var s = session;
    s._finished = true; // so re-opening the Practice tab returns to the mode picker
    var answered = s.questions.filter(function (q) { return s.answers[q.id] != null; });
    var ok = answered.filter(function (q) { return s.answers[q.id] === q.correctIndex; }).length;
    root.innerHTML = '';
    root.appendChild(el('h2', { text: 'Practice session complete' }));
    root.appendChild(el('div', { class: 'grid cols-3', style: 'margin:1rem 0' }, [
      kpiCard(answered.length + '/' + s.questions.length, 'answered'),
      kpiCard(ok, 'correct'),
      kpiCard((answered.length ? Math.round(ok / answered.length * 100) : 0) + '%', 'accuracy'),
    ]));
    root.appendChild(el('div', { style: 'display:flex;gap:.6rem' }, [
      el('button', { class: 'btn accent', onClick: startPracticeSetup }, ['New practice set']),
      el('button', { class: 'btn ghost', onClick: renderHome }, ['Back to modes']),
    ]));
  }

  function finishExam() {
    var s = session;
    if (s._timer) clearTimeout(s._timer);
    if (s._finished) return;
    s._finished = true;

    var total = s.questions.length;
    var correct = 0;
    var byDomain = {};
    s.questions.forEach(function (q) {
      var c = s.answers[q.id] === q.correctIndex;
      if (c) correct++;
      // also persist exam answers into long-term stats
      if (s.answers[q.id] != null) window.Store.recordAnswer(q.id, s.answers[q.id], c);
      var d = q.domain || 0;
      byDomain[d] = byDomain[d] || { ok: 0, n: 0 };
      byDomain[d].n++; if (c) byDomain[d].ok++;
    });

    var ratio = total ? correct / total : 0;
    var score = Math.round(100 + 900 * ratio); // 100–1000 scale
    var passed = score >= 720;

    window.Store.recordExam({ ts: Date.now(), score: score, passed: passed, total: total, correct: correct });

    root.innerHTML = '';
    root.appendChild(el('h2', { text: 'Exam results' }));

    var deg = Math.round(ratio * 360);
    var ringColor = passed ? 'var(--green)' : 'var(--orange)';
    var ring = el('div', { class: 'score-ring', style: '--ring-deg:' + deg + 'deg;--ring-color:' + ringColor }, [
      el('div', { class: 'inner' }, [
        el('div', {}, [el('b', { text: String(score) }), el('span', { class: 'muted', text: '/ 1000' })]),
      ]),
    ]);
    root.appendChild(ring);
    root.appendChild(el('div', { class: 'verdict ' + (passed ? 'pass' : 'fail'),
      text: passed ? 'PASS — above the 720 line' : 'Below 720 — keep practising' }));
    root.appendChild(el('p', { class: 'muted', style: 'text-align:center',
      text: correct + ' / ' + total + ' correct (' + Math.round(ratio * 100) + '%). ' +
      'Note: this is an approximate scaled score for study purposes.' }));

    // per-domain breakdown
    var rows = Object.keys(byDomain).sort().map(function (d) {
      var b = byDomain[d];
      var name = d === '0' ? 'Unclassified' :
        ('D' + d + ' — ' + (META.domains[d - 1] ? META.domains[d - 1].name : ''));
      var pct = Math.round(b.ok / b.n * 100);
      return el('tr', {}, [
        el('td', { text: name }),
        el('td', { text: b.ok + '/' + b.n }),
        el('td', { html: '<strong>' + pct + '%</strong>' }),
      ]);
    });
    root.appendChild(el('div', { class: 'card', style: 'margin:1.4rem 0' }, [
      el('h3', { text: 'By domain' }),
      el('div', { class: 'table-wrap' }, [
        el('table', {}, [
          el('thead', {}, [el('tr', {}, [el('th', { text: 'Domain' }), el('th', { text: 'Correct' }), el('th', { text: 'Score' })])]),
          el('tbody', {}, rows),
        ]),
      ]),
    ]));

    // review missed
    var missed = s.questions.filter(function (q) { return s.answers[q.id] !== q.correctIndex; });
    if (missed.length) {
      var reviewWrap = el('div', { class: 'card' }, [el('h3', { text: 'Review (' + missed.length + ' to revisit)' })]);
      missed.forEach(function (q) {
        var your = s.answers[q.id];
        reviewWrap.appendChild(el('div', { style: 'border-top:1px solid var(--border);padding:.9rem 0' }, [
          el('div', { class: 'q-meta' }, [domainPill(q)]),
          el('div', { html: (q.prompt || q.situation || '') }),
          el('div', { class: 'muted', style: 'font-size:.88rem;margin:.3rem 0', html:
            'Your answer: ' + (your != null ? LETTERS[your] : '—') +
            ' · Correct: <strong>' + LETTERS[q.correctIndex] + '</strong> — ' + q.options[q.correctIndex] }),
          el('div', { class: 'explanation', html: q.explanation || '' }),
        ]));
      });
      root.appendChild(reviewWrap);
    }

    root.appendChild(el('div', { style: 'display:flex;gap:.6rem;margin-top:1.2rem' }, [
      el('button', { class: 'btn accent', onClick: startExamSetup }, ['New exam']),
      el('button', { class: 'btn ghost', onClick: renderHome }, ['Back to modes']),
    ]));
  }

  /* ============================ helpers ============================ */
  function confirmQuit() {
    if (session && session.mode === 'exam' && !session._finished) {
      if (!confirm('Quit the exam? Your progress in this attempt will be lost.')) return;
      if (session._timer) clearTimeout(session._timer);
    }
    session = null;
    renderHome();
  }
  function backBtnTo(fn) {
    root.appendChild(el('button', { class: 'btn ghost', style: 'margin-bottom:1rem', onClick: fn }, ['← Back']));
  }
  function optionEl(value, label) { return el('option', { value: value, text: label }); }
  function labeled(label, control) {
    return el('div', { class: 'field' }, [el('div', { class: 'field-label', text: label }), control]);
  }
  function kpiCard(v, l) { return el('div', { class: 'card kpi' }, [el('b', { text: String(v) }), el('span', { text: l })]); }

  window.Quiz = {
    render: function (container) {
      root = container;
      // returning to #/quiz resets to home unless a session is mid-flight
      if (session && !session._finished) renderQuestion();
      else { session = null; renderHome(); }
    },
  };
})();
