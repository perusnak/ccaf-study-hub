/* theory.js — theory reader with sticky TOC + live filter (global: window.Theory) */
(function () {
  'use strict';
  var el = window.UI.el;
  var T = window.CCAF_THEORY;

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  window.Theory = {
    render: function (root) {
      // group sections by part, preserving order
      var parts = [];
      var byPart = {};
      T.forEach(function (sec) {
        if (!byPart[sec.part]) { byPart[sec.part] = []; parts.push(sec.part); }
        byPart[sec.part].push(sec);
      });

      // ---- TOC ----
      var search = el('input', { class: 'toc-search', type: 'search', placeholder: 'Filter sections…' });
      var tocLinks = [];
      var tocInner = el('div', {}, []);
      parts.forEach(function (p) {
        tocInner.appendChild(el('div', { class: 'part-label', text: p }));
        byPart[p].forEach(function (sec) {
          var a = el('a', { href: '#/theory/' + sec.id, text: sec.title, 'data-title': sec.title.toLowerCase() });
          tocLinks.push(a);
          tocInner.appendChild(a);
        });
      });
      var toc = el('aside', { class: 'toc' }, [search, tocInner]);

      // ---- content ----
      var content = el('div', { class: 'theory-content' }, []);
      T.forEach(function (sec) {
        var art = el('article', { id: sec.id }, [
          el('div', { class: 'eyebrow', text: sec.part }),
          el('h2', { text: sec.title }),
          el('div', { html: sec.html }),
        ]);
        content.appendChild(art);
      });

      // ---- filter behaviour ----
      search.addEventListener('input', function () {
        var q = search.value.trim().toLowerCase();
        tocLinks.forEach(function (a) {
          var hit = !q || a.getAttribute('data-title').indexOf(q) !== -1;
          a.classList.toggle('hidden', !hit);
        });
      });

      // ---- active link on scroll + deep-link ----
      root.appendChild(el('div', { class: 'theory-layout' }, [toc, content]));

      function setActive(id) {
        tocLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#/theory/' + id);
        });
      }

      // scroll to deep-linked section
      var hashParts = (location.hash || '').split('/');
      var target = hashParts[2];
      if (target && document.getElementById(target)) {
        setTimeout(function () {
          document.getElementById(target).scrollIntoView({ behavior: 'auto', block: 'start' });
          setActive(target);
        }, 0);
      } else if (T[0]) {
        setActive(T[0].id);
      }

      // observer to highlight current section
      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) setActive(e.target.id);
          });
        }, { rootMargin: '-15% 0px -75% 0px' });
        content.querySelectorAll('article').forEach(function (a) { obs.observe(a); });
      }
    },
  };
})();
