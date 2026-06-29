/* flashcards.js — flip cards with shuffle + known/review tracking (global: window.Flashcards) */
(function () {
  'use strict';
  var el = window.UI.el;
  var shuffle = window.UI.shuffle;
  var FC = window.CCAF_FLASHCARDS;

  var root = null;
  var deck = null;
  var idx = 0;
  var flipped = false;

  function categories() {
    var seen = {}, out = ['All'];
    FC.forEach(function (c) { if (!seen[c.category]) { seen[c.category] = 1; out.push(c.category); } });
    return out;
  }

  function buildDeck(cat, mode) {
    var d = FC.filter(function (c) { return cat === 'All' || c.category === cat; });
    if (mode === 'review') d = d.filter(function (c) { return window.Store.getCard(c.front) === 'review' || !window.Store.getCard(c.front); });
    return shuffle(d);
  }

  function render() {
    root.innerHTML = '';
    root.appendChild(el('div', { class: 'eyebrow', text: 'Spaced repetition' }));
    root.appendChild(el('h1', { text: 'Flashcards' }));
    root.appendChild(el('p', { class: 'lead', text:
      'Quick recall of the high-yield facts. Click a card to flip it; mark each one “Known” or “Review”.' }));

    var catSel = el('select', {}, categories().map(function (c) { return el('option', { value: c, text: c }); }));
    var modeSel = el('select', {}, [
      el('option', { value: 'all', text: 'All cards' }),
      el('option', { value: 'review', text: 'Only “to review” / unseen' }),
    ]);

    function restart() {
      deck = buildDeck(catSel.value, modeSel.value);
      idx = 0; flipped = false;
      draw();
    }
    catSel.addEventListener('change', restart);
    modeSel.addEventListener('change', restart);

    root.appendChild(el('div', { class: 'quiz-toolbar', style: 'justify-content:center' }, [
      catSel, modeSel,
      el('button', { class: 'btn ghost', onClick: restart }, ['🔀 Shuffle']),
    ]));

    var stage = el('div', { class: 'fc-wrap' }, []);
    root.appendChild(stage);

    function draw() {
      stage.innerHTML = '';
      if (!deck.length) {
        stage.appendChild(el('div', { class: 'card', text: 'No cards match — try “All cards”.' }));
        return;
      }
      var card = deck[idx];
      var status = window.Store.getCard(card.front);

      stage.appendChild(el('div', { class: 'muted', text: 'Card ' + (idx + 1) + ' of ' + deck.length +
        (status ? ' · marked ' + status : '') }));

      var fc = el('div', { class: 'flashcard' + (flipped ? ' flipped' : '') }, [
        el('div', { class: 'inner' }, [
          el('div', { class: 'face front' }, [el('div', {}, [
            el('span', { class: 'pill', text: card.category }),
            el('div', { class: 'term', style: 'margin-top:.8rem', html: card.front }),
            el('div', { class: 'fc-hint', style: 'margin-top:1rem', text: 'click to reveal' }),
          ])]),
          el('div', { class: 'face back' }, [el('div', { html: card.back })]),
        ]),
      ]);
      fc.addEventListener('click', function () { flipped = !flipped; fc.classList.toggle('flipped'); });
      stage.appendChild(fc);

      var controls = el('div', { class: 'fc-controls' }, [
        el('button', { class: 'btn ghost', disabled: idx === 0 ? 'disabled' : null,
          onClick: function () { if (idx > 0) { idx--; flipped = false; draw(); } } }, ['← Prev']),
        el('button', { class: 'btn', onClick: function () {
          window.Store.setCard(card.front, 'review'); next();
        } }, ['↻ Review']),
        el('button', { class: 'btn accent', onClick: function () {
          window.Store.setCard(card.front, 'known'); next();
        } }, ['✓ Known']),
        el('button', { class: 'btn ghost', disabled: idx >= deck.length - 1 ? 'disabled' : null,
          onClick: next }, ['Next →']),
      ]);
      stage.appendChild(controls);

      function next() {
        if (idx < deck.length - 1) { idx++; flipped = false; draw(); }
        else summary();
      }
    }

    function summary() {
      stage.innerHTML = '';
      var known = deck.filter(function (c) { return window.Store.getCard(c.front) === 'known'; }).length;
      stage.appendChild(el('div', { class: 'card' }, [
        el('h3', { text: 'Deck complete' }),
        el('p', { html: '<strong>' + known + '</strong> of ' + deck.length + ' marked “Known”.' }),
        el('button', { class: 'btn accent', onClick: restart }, ['Go again']),
      ]));
    }

    restart();
  }

  window.Flashcards = {
    render: function (container) { root = container; render(); },
  };
})();
