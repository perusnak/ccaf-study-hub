/* store.js — localStorage helpers + shared UI utilities (global: window.Store, window.UI) */
(function () {
  'use strict';

  var KEY = 'ccaf.v1';

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* storage full / disabled — ignore, app still works in-memory */
    }
  }

  function defaults() {
    return {
      answered: {},   // questionId -> { correct: bool, choice: idx, ts }
      flagged: {},    // questionId -> true
      cards: {},      // "front" -> "known" | "review"
      exams: [],      // [{ ts, score, passed, total, correct }]
    };
  }

  var state = Object.assign(defaults(), load());

  var Store = {
    get: function () { return state; },

    recordAnswer: function (qId, choice, correct) {
      state.answered[qId] = { correct: !!correct, choice: choice, ts: Date.now() };
      save(state);
    },
    isAnswered: function (qId) { return !!state.answered[qId]; },

    toggleFlag: function (qId) {
      if (state.flagged[qId]) delete state.flagged[qId];
      else state.flagged[qId] = true;
      save(state);
      return !!state.flagged[qId];
    },
    isFlagged: function (qId) { return !!state.flagged[qId]; },

    setCard: function (front, status) { state.cards[front] = status; save(state); },
    getCard: function (front) { return state.cards[front] || null; },

    recordExam: function (rec) {
      state.exams.unshift(rec);
      state.exams = state.exams.slice(0, 25);
      save(state);
    },

    stats: function () {
      var ids = Object.keys(state.answered);
      var correct = ids.filter(function (k) { return state.answered[k].correct; }).length;
      return {
        answered: ids.length,
        correct: correct,
        accuracy: ids.length ? Math.round((correct / ids.length) * 100) : 0,
        flagged: Object.keys(state.flagged).length,
        exams: state.exams.length,
        lastExam: state.exams[0] || null,
      };
    },

    reset: function () { state = defaults(); save(state); },
  };

  /* ---- tiny DOM helpers ---- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] != null) {
          node.setAttribute(k, attrs[k]);
        }
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  window.Store = Store;
  window.UI = { el: el, shuffle: shuffle };
})();
