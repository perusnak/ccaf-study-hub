/* resources.js — curated hub of external study materials (global: window.Resources) */
(function () {
  'use strict';
  var el = window.UI.el;
  var META = window.CCAF_META;

  function groupTag(group) {
    if (/official anthropic|engineering blog/i.test(group)) return { cls: 'd3', text: 'Anthropic' };
    if (/third-party/i.test(group)) return { cls: 'd1', text: 'third-party' };
    return { cls: '', text: 'community' };
  }

  window.Resources = {
    render: function (root) {
      root.appendChild(el('div', { class: 'eyebrow', text: 'Beyond this site' }));
      root.appendChild(el('h1', { text: 'Resources & further study' }));
      root.appendChild(el('p', { class: 'lead', text:
        'A hub of official documentation, recommended reading, open-source guides, articles, and ' +
        'practice resources for the CCA-F exam. Only the items tagged “Anthropic” are official — ' +
        'everything else is independent (and some are paid). Verify exam specifics against official Anthropic sources.' }));

      (META.resources || []).forEach(function (grp) {
        var tag = groupTag(grp.group);
        var card = el('div', { class: 'card', style: 'margin-top:1.2rem' }, [
          el('div', { style: 'display:flex;align-items:center;gap:.6rem;margin-bottom:.6rem;flex-wrap:wrap' }, [
            el('h3', { style: 'margin:0', text: grp.group }),
            el('span', { class: 'pill ' + tag.cls, text: tag.text }),
          ]),
        ]);
        grp.items.forEach(function (it) {
          card.appendChild(el('div', { style: 'padding:.6rem 0;border-top:1px solid var(--border)' }, [
            el('a', { href: it.url, target: '_blank', rel: 'noopener',
              style: 'font-family:var(--font-head);font-weight:600', text: it.label }),
            it.note ? el('div', { class: 'muted', style: 'font-size:.88rem;margin-top:.2rem', text: it.note }) : null,
          ]));
        });
        root.appendChild(card);
      });

      // also surface the full official documentation index from the guide
      root.appendChild(el('div', { class: 'card', style: 'margin-top:1.2rem' }, [
        el('h3', { text: 'Official documentation index' }),
        el('p', { class: 'muted', style: 'font-size:.88rem', text:
          'Every doc page referenced throughout the study guide.' }),
        el('div', { class: 'link-list' }, META.officialLinks.map(function (l) {
          return el('a', { href: l.url, target: '_blank', rel: 'noopener', text: l.label });
        })),
      ]));

      root.appendChild(el('div', { class: 'disclaimer-box', style: 'margin-top:1.4rem' }, [
        el('strong', { text: 'Note. ' }),
        el('span', { text: 'External links are provided for convenience and may include paid products. ' +
          'Listing is not endorsement. This project does not control and is not responsible for third-party ' +
          'content; community guides are unofficial and may vary in accuracy — cross-check important details.' }),
      ]));
    },
  };
})();
