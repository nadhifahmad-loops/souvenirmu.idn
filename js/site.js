/* ==========================================================================
   SOUVENIRMU.IDN — Perilaku halaman

   Script ini dipakai bersama oleh ketiga halaman:
   - menerapkan peta gambar dan nomor WhatsApp dari config.js
   - menu seluler (Escape, klik di luar, klik tautan)
   - filter katalog dan tautan kategori
   - galeri thumbnail dan opsi pada halaman detail produk
   - penyusunan pesan WhatsApp pada halaman detail dan form custom
   ========================================================================== */

(function () {
  'use strict';

  var config = window.SOUVENIRMU;
  if (!config) return;

  function byId(id) {
    return document.getElementById(id);
  }

  function queryAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /* Gambar dan tautan WhatsApp ------------------------------------------- */

  function applyImages() {
    queryAll('[data-img]').forEach(function (element) {
      var key = element.getAttribute('data-img');
      var source = config.images[key];
      if (source && element.getAttribute('src') !== source) {
        element.setAttribute('src', source);
      }
    });
  }

  function applyWhatsAppLinks() {
    queryAll('[data-wa-text]').forEach(function (link) {
      link.setAttribute('href', config.waLink(link.getAttribute('data-wa-text')));
    });

    queryAll('[data-wa-plain]').forEach(function (link) {
      link.setAttribute('href', config.waPlainLink());
    });

    queryAll('[data-instagram]').forEach(function (link) {
      if (config.instagram) link.setAttribute('href', config.instagram);
    });
  }

  /* Menu seluler ---------------------------------------------------------- */

  function initMenu() {
    var button = byId('mobile-menu-btn');
    var menu = byId('mobile-menu');
    if (!button || !menu) return;

    var icon = button.querySelector('.material-symbols-outlined');

    function setState(isOpen) {
      menu.hidden = !isOpen;
      button.setAttribute('aria-expanded', String(isOpen));
      button.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
      if (icon) icon.textContent = isOpen ? 'close' : 'menu';
    }

    button.addEventListener('click', function () {
      setState(menu.hidden);
    });

    queryAll('a', menu).forEach(function (link) {
      link.addEventListener('click', function () {
        setState(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) {
        setState(false);
        button.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (menu.hidden) return;
      if (!menu.contains(event.target) && !button.contains(event.target)) {
        setState(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1024 && !menu.hidden) setState(false);
    });
  }

  /* Navbar aktif mengikuti posisi halaman -------------------------------- */

  function initScrollSpy() {
    var links = queryAll('.nav__link[href^="#"], .mobile-nav__link[href^="#"]');
    if (!links.length) return;

    var targets = links
      .map(function (link) { return link.getAttribute('href').slice(1); })
      .filter(function (id) { return !!byId(id); })
      .filter(function (id, index, all) { return all.indexOf(id) === index; });

    if (!targets.length) return;

    function setActive(id) {
      links.forEach(function (link) {
        if (link.getAttribute('href') === '#' + id) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        var id = link.getAttribute('href').slice(1);
        if (byId(id)) setActive(id);
      });
    });

    var scheduled = false;

    function sync() {
      scheduled = false;
      var header = parseFloat(window.getComputedStyle(document.documentElement)
        .getPropertyValue('--header-height')) || 80;
      var marker = window.scrollY + header + 24;
      var current = targets[0];

      targets.forEach(function (id) {
        var section = byId(id);
        if (section && section.getBoundingClientRect().top + window.scrollY <= marker) {
          current = id;
        }
      });

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = targets[targets.length - 1];
      }

      setActive(current);
    }

    function onScroll() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(sync);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    sync();
  }

  /* Filter katalog -------------------------------------------------------- */

  function initCatalog() {
    var chips = queryAll('.chip[data-filter]');
    var cards = queryAll('.product-card[data-category]');
    if (!chips.length || !cards.length) return;

    function setFilter(category) {
      chips.forEach(function (chip) {
        chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === category));
      });

      cards.forEach(function (card) {
        var matches = category === 'all' || card.getAttribute('data-category') === category;
        card.hidden = !matches;
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        setFilter(chip.getAttribute('data-filter'));
      });
    });

    queryAll('[data-filter-link]').forEach(function (link) {
      link.addEventListener('click', function () {
        setFilter(link.getAttribute('data-filter-link'));
      });
    });
  }

  /* Halaman detail produk ------------------------------------------------- */

  function initProductGallery() {
    var mainImage = byId('main-product-img');
    var thumbs = queryAll('.thumb[data-image]');
    if (!mainImage || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var source = config.images[thumb.getAttribute('data-image')];
        if (source) mainImage.setAttribute('src', source);
        thumbs.forEach(function (item) {
          item.setAttribute('aria-pressed', String(item === thumb));
        });
      });
    });
  }

  function initProductOrder() {
    var link = byId('wa-order-link');
    if (!link) return;

    var note = byId('card-note');
    var productName = document.body.getAttribute('data-product-name') || 'Produk';
    var noteLabel = document.body.getAttribute('data-note-label') || 'Catatan';

    function selected(group) {
      var active = document.querySelector(group + '[aria-pressed="true"]');
      var list = active ? active.closest('.option-list') : null;
      var label = list ? list.getAttribute('data-option-label') : '';
      return {
        label: label || '',
        value: active ? active.getAttribute('data-value') : ''
      };
    }

    function format(option) {
      return (option.label ? option.label + ': ' : '') + option.value;
    }

    function update() {
      var first = selected('.opt-color');
      var second = selected('.opt-size');
      var message = 'Halo SOUVENIRMU.IDN, saya ingin memesan ' + productName +
        ' (' + format(first) + ', ' + format(second) + ')';

      if (note && note.value.trim()) {
        message += ', ' + noteLabel + ': "' + note.value.trim() + '"';
      }

      link.setAttribute('href', config.waLink(message + '.'));
    }

    ['.opt-color', '.opt-size'].forEach(function (group) {
      queryAll(group).forEach(function (option) {
        option.addEventListener('click', function () {
          queryAll(group).forEach(function (item) {
            item.setAttribute('aria-pressed', String(item === option));
          });
          update();
        });
      });
    });

    if (note) note.addEventListener('input', update);
    update();
  }

  /* Halaman pesanan custom ------------------------------------------------ */

  function initCustomOrder() {
    var form = byId('custom-order-form');
    var button = byId('submit-wa-btn');
    if (!form || !button) return;

    function value(id) {
      var element = byId(id);
      return element ? String(element.value).trim() : '';
    }

    function setText(id, text) {
      var element = byId(id);
      if (element) element.textContent = text;
    }

    function update() {
      var name = value('cust-name') || '[Nama Pemesan]';
      var phone = value('cust-phone') || '-';
      var category = value('cust-category') || 'Buket Custom';
      var date = value('cust-date') || 'Belum ditentukan';
      var quantity = value('cust-qty') || '1';
      var theme = value('cust-theme') || 'Sesuai rekomendasi';
      var notes = value('cust-notes') || '-';

      setText('summary-cat', category);
      setText('summary-qty', quantity);
      setText('summary-date', date);
      setText('summary-theme', theme);

      var message =
        'Halo SOUVENIRMU.IDN, saya ' + name + ' ingin konsultasi pesanan custom:\n' +
        '- Nomor WhatsApp: ' + phone + '\n' +
        '- Kategori: ' + category + '\n' +
        '- Jumlah: ' + quantity + '\n' +
        '- Tanggal acara: ' + date + '\n' +
        '- Nuansa warna: ' + theme + '\n' +
        '- Catatan konsep: ' + notes;

      button.setAttribute('href', config.waLink(message));
    }

    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();
  }

  /* Inisialisasi ---------------------------------------------------------- */

  function init() {
    applyImages();
    applyWhatsAppLinks();
    initMenu();
    initScrollSpy();
    initCatalog();
    initProductGallery();
    initProductOrder();
    initCustomOrder();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
