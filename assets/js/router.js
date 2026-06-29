/* router.js — hash routing between views (global views: Overview, Theory, Quiz, Flashcards, About) */
(function () {
  'use strict';

  var routes = {
    overview: window.Overview,
    theory: window.Theory,
    quiz: window.Quiz,
    flashcards: window.Flashcards,
    resources: window.Resources,
    about: window.About,
  };

  function currentRoute() {
    var h = (location.hash || '#/overview').replace(/^#\/?/, '');
    var name = h.split('/')[0] || 'overview';
    return routes[name] ? name : 'overview';
  }

  function render() {
    var name = currentRoute();
    var view = document.getElementById('view');

    // highlight active tab
    var tabs = document.querySelectorAll('.nav a.tab');
    Array.prototype.forEach.call(tabs, function (t) {
      t.classList.toggle('active', t.getAttribute('data-route') === name);
    });

    view.innerHTML = '';
    try {
      routes[name].render(view, location.hash);
    } catch (e) {
      view.appendChild(window.UI.el('div', { class: 'card', html:
        '<h2>Something went wrong</h2><p class="muted">' + (e && e.message) + '</p>' }));
      console.error(e);
    }
    window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', render);
  window.addEventListener('DOMContentLoaded', function () {
    if (!location.hash) location.replace('#/overview');
    render();
  });
})();
