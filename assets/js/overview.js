/* overview.js — dashboard + about page (globals: window.Overview, window.About) */
(function () {
  'use strict';
  var el = window.UI.el;
  var META = window.CCAF_META;
  var Q = window.CCAF_QUESTIONS;

  var ACCENTS = ['var(--orange)', 'var(--blue)', 'var(--green)'];

  function domainBar(d, i) {
    return el('div', { class: 'domain-bar' }, [
      el('div', { class: 'label' }, [
        el('span', { text: 'D' + d.n + ' · ' + d.name }),
        el('strong', { text: d.weight + '%' }),
      ]),
      el('div', { class: 'track' }, [
        el('div', { class: 'fill', style: 'width:' + d.weight + '%;background:' + ACCENTS[i % 3] }),
      ]),
    ]);
  }

  function scenarioCard(s, i) {
    return el('div', { class: 'card scenario-card', style: 'border-left-color:' + ACCENTS[i % 3] }, [
      el('h4', { text: 'Scenario ' + s.n + ': ' + s.name }),
      el('p', { html: s.desc || '' }),
    ]);
  }

  window.Overview = {
    render: function (root) {
      var st = window.Store.stats();

      // hero
      var factRows = META.examFacts.map(function (f) {
        return el('tr', {}, [el('td', { text: f[0] }), el('td', { html: '<strong>' + f[1] + '</strong>' })]);
      });

      var hero = el('div', { class: 'hero' }, [
        el('div', {}, [
          el('div', { class: 'eyebrow', text: 'Exam preparation hub' }),
          el('h1', { text: META.title }),
          el('p', { class: 'lead', text:
            'Everything you need in one place: the full theory, ' + Q.length +
            ' exam-style practice questions, a timed exam simulation, and flashcards.' }),
          el('div', { style: 'display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem' }, [
            el('a', { class: 'btn accent', href: '#/quiz' }, ['Start practising']),
            el('a', { class: 'btn ghost', href: '#/theory' }, ['Read the theory']),
          ]),
        ]),
        el('div', { class: 'card' }, [
          el('h3', { text: 'Exam at a glance' }),
          el('div', { class: 'table-wrap' }, [
            el('table', { class: 'fact-table' }, [el('tbody', {}, factRows)]),
          ]),
        ]),
      ]);

      // progress KPIs
      var kpis = el('div', { class: 'grid cols-4', style: 'margin-top:1.4rem' }, [
        kpi(st.answered, 'questions answered'),
        kpi(st.accuracy + '%', 'overall accuracy'),
        kpi(st.flagged, 'flagged for review'),
        kpi(st.exams, 'exam sims taken'),
      ]);

      var resume = null;
      if (st.lastExam) {
        var le = st.lastExam;
        resume = el('div', { class: 'notice', style: 'margin-top:1rem' }, [
          el('span', { html: 'Last exam simulation: <strong>' + le.score + '/1000</strong> · ' +
            (le.passed ? '<span style="color:var(--green)">passed</span>' : '<span style="color:var(--orange)">below 720</span>') +
            ' (' + le.correct + '/' + le.total + ' correct). ' }),
          el('a', { href: '#/quiz' }, ['Try again →']),
        ]);
      }

      // domains
      var domains = el('div', { class: 'card' }, [
        el('h3', { text: 'The 5 exam domains' }),
        el('div', {}, META.domains.map(domainBar)),
      ]);

      // scenarios
      var scen = el('div', {}, [
        el('div', { class: 'section-title' }, [el('h2', { text: 'Exam scenarios' }),
          el('span', { class: 'muted', text: '4 of these 8 are randomly selected on the real exam' })]),
        el('div', { class: 'grid cols-2' }, META.scenarios.map(scenarioCard)),
      ]);

      // official docs
      var links = el('div', { class: 'card' }, [
        el('h3', { text: 'Official documentation' }),
        el('div', { class: 'link-list' }, META.officialLinks.map(function (l) {
          return el('a', { href: l.url, target: '_blank', rel: 'noopener', text: l.label });
        })),
      ]);

      var disc = el('div', { class: 'disclaimer-box', style: 'margin-top:1.4rem' }, [
        el('strong', { text: 'Disclaimer. ' }),
        el('span', { text: META.disclaimer }),
      ]);

      var topNotice = el('div', { class: 'disclaimer-box', style: 'margin-bottom:1.2rem;font-size:.85rem' }, [
        el('strong', { text: 'Unofficial study aid. ' }),
        el('span', { text: 'Independent project — not affiliated with, endorsed by, or sponsored by Anthropic. ' +
          'Practice questions are community-sourced approximations, not real exam content.' }),
        el('span', { text: ' ' }),
        el('a', { href: '#/about', text: 'Details →' }),
      ]);

      root.appendChild(topNotice);
      root.appendChild(hero);
      root.appendChild(kpis);
      if (resume) root.appendChild(resume);
      root.appendChild(el('div', { class: 'grid cols-2', style: 'margin-top:1.4rem' }, [domains, links]));
      root.appendChild(scen);
      root.appendChild(disc);
    },
  };

  function kpi(value, label) {
    return el('div', { class: 'card kpi' }, [
      el('b', { text: String(value) }),
      el('span', { text: label }),
    ]);
  }

  /* ---------------- About page ---------------- */
  window.About = {
    render: function (root) {
      root.appendChild(el('div', { class: 'eyebrow', text: 'About this project' }));
      root.appendChild(el('h1', { text: 'About & attribution' }));

      root.appendChild(el('div', { class: 'disclaimer-box', style: 'margin:1rem 0' }, [
        el('strong', { text: 'Important disclaimer. ' }),
        el('span', { text: META.disclaimer }),
      ]));

      root.appendChild(el('div', { class: 'card', style: 'margin-bottom:1rem' }, [
        el('h3', { text: 'What this is' }),
        el('p', { html:
          'A free, open, local-first study hub for the <strong>Claude Certified Architect — Foundations (CCA-F)</strong> ' +
          'exam. It compiles publicly available study material into one browsable site with ' +
          'practice questions, an exam simulation, and flashcards. It runs entirely in your browser — ' +
          'no account, no tracking, no server. Your progress is stored only in this browser (localStorage).' }),
        el('p', { html:
          '<strong>About the exam itself:</strong> The CCA-F is a <strong>60-question, 120-minute</strong>, ' +
          'online-proctored, closed-book exam. Passing score is 720/1000. ' +
          'As of 2026, registration is <strong>limited to employees of official Anthropic partner companies</strong> — ' +
          'the Partner Network is free to join and the exam is free for the first 5,000 eligible participants. ' +
          'Register at <a href="https://anthropic.skilljar.com/claude-certified-architect-foundations-access-request" ' +
          'target="_blank" rel="noopener">anthropic.skilljar.com</a>.' }),
      ]));

      root.appendChild(el('div', { class: 'card', style: 'margin-bottom:1rem' }, [
        el('h3', { text: 'Content source & attribution' }),
        el('p', { html:
          'This site is built on a stack of sources:' }),
        el('ol', { style: 'margin:.4rem 0 .8rem 1.2rem;line-height:1.7' }, [
          el('li', { html:
            '<strong>Anthropic</strong> publishes the official CCA-F exam guide, which defines the domains, ' +
            'scenarios, and learning objectives.' }),
          el('li', { html:
            '<strong><a href="https://github.com/paullarionov/claude-certified-architect" target="_blank" rel="noopener">' +
            'paullarionov/claude-certified-architect</a></strong> — a community project that turned the official exam guide ' +
            'into a detailed study guide with theory chapters and practice questions. This is the primary content source for this site.' }),
          el('li', { html:
            '<strong>This site</strong> parses that community guide into a navigable web app with quizzes, ' +
            'flashcards, and an exam simulation. No content was independently authored here.' }),
        ]),
        el('p', { class: 'muted', html:
          'Practice questions are community-sourced study approximations — <strong>not</strong> real exam questions. ' +
          'Always verify exam format, scoring, and policies against official Anthropic sources. ' +
          'If you are a rights holder and want content adjusted or removed, please ' +
          '<a href="https://github.com/paullarionov/claude-certified-architect/issues" target="_blank" rel="noopener">open an issue</a>.' }),
      ]));

      root.appendChild(el('div', { class: 'card', style: 'margin-bottom:1rem' }, [
        el('h3', { text: 'Official resources' }),
        el('div', { class: 'link-list' }, META.officialLinks.map(function (l) {
          return el('a', { href: l.url, target: '_blank', rel: 'noopener', text: l.label });
        })),
      ]));

      root.appendChild(el('div', { class: 'card' }, [
        el('h3', { text: 'Your data' }),
        el('p', { html: 'Progress (answered questions, flags, flashcard status, exam scores) is saved in ' +
          'your browser only. You can wipe it any time:' }),
        el('button', { class: 'btn ghost', onClick: function () {
          if (confirm('Reset all saved progress on this device?')) { window.Store.reset(); location.hash = '#/overview'; }
        } }, ['Reset my progress']),
      ]));
    },
  };
})();
