/* ==========================================================================
   SOUVENIRMU.IDN — Konfigurasi terpusat

   Semua nomor WhatsApp dan path gambar ada di file ini.
   Untuk mengganti foto ilustrasi dengan foto produk asli, cukup ubah nilai
   di bawah ini — tidak perlu menyunting file HTML.
   ========================================================================== */

(function () {
  'use strict';

  var CONFIG = {
    /* Nomor bisnis yang diberikan pemilik (085646438145), dinormalisasi
       untuk format https://wa.me/<kode negara><nomor> tanpa tanda + dan 0. */
    whatsapp: '6285646438145',

    instagram: 'https://instagram.com/souvenirmu.idn',

    /* Foto publik dari Unsplash dipakai SEBENTARA sebagai ilustrasi.
       Lisensi: https://unsplash.com/license
       Ganti nilai di bawah dengan foto produk asli saat tersedia. */
    images: {
      hero: 'assets/images/hero-rangkaian.jpg',
      buket: 'assets/images/kategori-buket.jpg',
      mahar: 'assets/images/kategori-mahar-hantaran.jpg',
      souvenir: 'assets/images/kategori-souvenir.jpg',
      gift: 'assets/images/kategori-custom-gift.jpg',
      buketMawar: 'assets/images/produk-buket-mawar.jpg',
      maharAkrilik: 'assets/images/produk-mahar-akrilik.jpg',
      hantaranKaca: 'assets/images/produk-hantaran-kaca.jpg',
      souvenirSatin: 'assets/images/produk-souvenir-satin.jpg',
      atelier: 'assets/images/atelier-custom.jpg'
    },

    waLink: function (message) {
      var text = message || 'Halo SOUVENIRMU.IDN, saya ingin bertanya mengenai produk.';
      return 'https://wa.me/' + this.whatsapp + '?text=' + encodeURIComponent(text);
    },

    waPlainLink: function () {
      return 'https://wa.me/' + this.whatsapp;
    }
  };

  window.SOUVENIRMU = CONFIG;
})();
