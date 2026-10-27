/* ==========================================================
   script.js - Pengenalan Kopi
   Isi file ini:
   1. Navbar (tutup menu mobile + link aktif)
   2. Tombol "Lihat langkah" metode seduh
   3. Pemilih selera
   4. Kalkulator takaran
   5. Form data diri
   6. Mode gelap
   7. Progress bar scroll + tombol ke atas
   8. Animasi muncul saat di-scroll
   9. Foto yang gagal dimuat
   Catatan: smooth scroll sudah diurus CSS (scroll-behavior).
   ========================================================== */

(() => {
  'use strict';

  // variabel yang dipakai di banyak bagian
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Navbar ---------- */
  const navMenu = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('#mainNav .nav-link');

  // di HP, menu hamburger ditutup lagi setelah salah satu link diklik
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(navMenu, { toggle: false }).hide();
      }
    });
  });

  // section yang dipantau untuk menandai link yang aktif
  const watched = ['home', 'jenis-kopi', 'metode-seduh', 'nusantara', 'tentang', 'form', 'mulai']
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveLink(sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + sectionId;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  if ('IntersectionObserver' in window) {
    // garis pengamatan ada di sekitar tengah layar
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    watched.forEach((section) => navObserver.observe(section));
  }

  /* ---------- 2. Tombol "Lihat langkah" ---------- */
  // Bootstrap yang buka-tutup panelnya, kita cuma ganti tulisan tombolnya
  function setStepLabel(panel, isOpen) {
    const button = document.querySelector('[data-bs-target="#' + panel.id + '"]');
    if (button) button.textContent = isOpen ? 'Tutup langkah' : 'Lihat langkah';
  }

  document.querySelectorAll('.method .collapse').forEach((panel) => {
    panel.addEventListener('show.bs.collapse', () => setStepLabel(panel, true));
    panel.addEventListener('hide.bs.collapse', () => setStepLabel(panel, false));
  });

  /* ---------- 3. Pemilih selera ---------- */
  // isi rekomendasi untuk tiap pilihan (kunci = data-taste di HTML)
  const tasteResults = {
    segar: {
      card: 'kartu-arabika',
      label: 'Arabika',
      text: 'Coba Arabika. Aromanya kompleks dan keasamannya terasa, apalagi kalau diseduh dengan V60.',
    },
    kuat: {
      card: 'kartu-robusta',
      label: 'Robusta',
      text: 'Coba Robusta. Rasanya lebih pahit dan bodynya tebal, cocok untuk espresso atau kopi tubruk.',
    },
    unik: {
      card: 'kartu-liberika',
      label: 'Liberika',
      text: 'Coba Liberika. Aromanya khas dan rasanya berbeda dari kopi yang biasa ditemui. Cocok kalau kamu ingin mencoba hal baru.',
    },
  };

  // hanya tombol di dalam .taste-options (tombol kalkulator punya fungsi sendiri)
  const tasteButtons = document.querySelectorAll('.taste-options .taste-btn');
  const tasteText = document.getElementById('taste-text');
  const tasteGoto = document.getElementById('taste-goto');
  let pickedKey = null;
  let pickedTimer = null;

  tasteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      pickedKey = button.dataset.taste;
      const result = tasteResults[pickedKey];

      tasteButtons.forEach((other) => {
        other.setAttribute('aria-pressed', String(other === button));
      });
      tasteText.textContent = result.text;
      tasteGoto.textContent = 'Lihat kartu ' + result.label;
      tasteGoto.hidden = false;
    });
  });

  // gulir ke kartu yang direkomendasikan, lalu sorot sebentar
  tasteGoto.addEventListener('click', () => {
    if (!pickedKey) return;
    const card = document.getElementById(tasteResults[pickedKey].card);
    if (!card) return;

    document.querySelectorAll('.type-card.is-picked').forEach((el) => el.classList.remove('is-picked'));
    clearTimeout(pickedTimer);

    card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    card.classList.add('is-picked');
    pickedTimer = setTimeout(() => card.classList.remove('is-picked'), 2600);
  });

  /* ---------- 4. Kalkulator takaran ---------- */
  const dose = document.getElementById('dose');
  const doseOut = document.getElementById('dose-out');
  const waterOut = document.getElementById('water-out');
  const waterCap = document.getElementById('water-cap');
  const modeButtons = document.querySelectorAll('.calc-modes .taste-btn');

  // nilai awal sama dengan tombol V60 yang aktif di HTML
  let ratio = 15;
  let caption = 'air untuk diseduh';

  function updateCalc() {
    doseOut.textContent = dose.value;
    waterOut.textContent = Math.round(Number(dose.value) * ratio);
    waterCap.textContent = caption;
  }

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      ratio = Number(button.dataset.ratio);
      caption = button.dataset.label;
      modeButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      // dosis umum tiap metode: espresso 18 g, V60 15 g
      dose.value = ratio === 2 ? 18 : 15;
      updateCalc();
    });
  });

  dose.addEventListener('input', updateCalc);
  updateCalc();

  /* ---------- 5. Form data diri ---------- */
  const form = document.getElementById('kopiForm');
  const formResult = document.getElementById('formResult');
  const formList = document.getElementById('formResultList');

  // bikin satu baris "label : isi" di ringkasan (pakai textContent biar aman)
  function addRow(label, value) {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    row.append(dt, dd);
    formList.appendChild(row);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();                 // jangan reload halaman
    form.classList.add('was-validated');    // munculkan pesan validasi Bootstrap
    if (!form.checkValidity()) return;

    const hobi = Array.from(form.querySelectorAll('input[name="hobi"]:checked'))
      .map((box) => box.value);

    formList.textContent = '';
    addRow('Nama', form.elements.nama.value.trim());
    addRow('Alamat', form.elements.alamat.value.trim());
    addRow('Kota', form.elements.kota.value);
    addRow('Hobi', hobi.length ? hobi.join(', ') : 'Belum dipilih');
    formResult.hidden = false;
  });

  form.addEventListener('reset', () => {
    form.classList.remove('was-validated');
    formResult.hidden = true;
    formList.textContent = '';
  });

  /* ---------- 6. Mode gelap ---------- */
  // tema awal sudah dipasang oleh script kecil di <head> (biar tidak berkedip),
  // di sini tinggal urus tombolnya
  const themeToggle = document.getElementById('themeToggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    const dark = theme === 'dark';
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);   // supaya komponen Bootstrap ikut gelap
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
    if (metaTheme) metaTheme.setAttribute('content', dark ? '#17100C' : '#F8F4EC');
  }

  applyTheme(root.getAttribute('data-theme') || 'light');

  themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage diblokir, abaikan saja */ }
  });

  /* ---------- 7. Progress bar scroll + tombol ke atas ---------- */
  const scrollBar = document.getElementById('scrollBar');
  const toTop = document.getElementById('toTop');
  let scrollQueued = false;

  function updateScroll() {
    const max = root.scrollHeight - window.innerHeight;
    const ratioScrolled = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    scrollBar.style.transform = 'scaleX(' + ratioScrolled + ')';
    toTop.hidden = window.scrollY < 600;
    scrollQueued = false;
  }

  // requestAnimationFrame supaya tidak dihitung ulang di setiap event scroll
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });
  updateScroll();

  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- 8. Animasi muncul saat di-scroll ---------- */
  // elemen apa saja yang dianimasikan
  const revealTargets = document.querySelectorAll(
    '.type-card, .banner, .section-title, .section-lead, .method, .origin, .note, .calc, .form-card, ' +
    '.section-about .col-lg-6 > *, .section-about .photo, .section-nusantara .photo, .cta-box > *'
  );

  if (!reduceMotion && 'IntersectionObserver' in window) {
    revealTargets.forEach((el) => {
      el.classList.add('reveal');
      // tiga kartu jenis kopi muncul bergantian
      const column = el.closest('.col-12');
      if (el.matches('.type-card') && column) {
        const index = Array.from(column.parentElement.children).indexOf(column);
        el.style.setProperty('--d', index * 0.12 + 's');
      }
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('in');
        revealObserver.unobserve(el);
        // setelah animasi selesai, lepas kelasnya supaya efek hover tidak bentrok
        setTimeout(() => el.classList.remove('reveal', 'in'), 1100);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- 9. Foto yang gagal dimuat ---------- */
  // kalau file foto tidak ada di folder img, sembunyikan gambarnya
  // supaya tidak muncul ikon rusak (blok warna beige tetap tampil)
  document.querySelectorAll('.photo img').forEach((img) => {
    const hideImage = () => {
      img.style.display = 'none';
      console.warn('Foto tidak ditemukan: ' + img.getAttribute('src'));
    };
    img.addEventListener('error', hideImage);
    if (img.complete && img.naturalWidth === 0) hideImage();
  });
})();
