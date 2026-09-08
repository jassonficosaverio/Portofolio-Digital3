// ================== util ==================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Tahun otomatis di footer
document.getElementById('year').textContent = new Date().getFullYear();

// ================== layar sambutan ==================
const intro = document.getElementById('intro');
function hideIntro(){
  intro.classList.add('is-hidden');
  setTimeout(() => intro.remove(), 700);
}
if (prefersReducedMotion) {
  hideIntro();
} else {
  window.addEventListener('load', () => setTimeout(hideIntro, 1100));
  // biar tidak ketahan lama-lama kalau load event lambat / gagal
  setTimeout(hideIntro, 3000);
}

// ================== menu mobile ==================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ================== scrollspy navbar ==================
const navAnchors = Array.from(document.querySelectorAll('.nav-links a[data-nav]'));
const navIndicator = document.getElementById('navIndicator');
const spySections = navAnchors
  .map((a) => document.getElementById(a.dataset.nav))
  .filter(Boolean);

function moveIndicatorTo(link){
  if (!link) return;
  navIndicator.style.left = link.offsetLeft + 'px';
  navIndicator.style.width = link.offsetWidth + 'px';
}

function setActiveNav(id){
  navAnchors.forEach((a) => a.classList.toggle('is-active', a.dataset.nav === id));
  moveIndicatorTo(navAnchors.find((a) => a.dataset.nav === id));
}

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) setActiveNav(entry.target.id);
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

spySections.forEach((s) => spyObserver.observe(s));
window.addEventListener('resize', () => {
  const active = navAnchors.find((a) => a.classList.contains('is-active'));
  moveIndicatorTo(active || navAnchors[0]);
});
setActiveNav('beranda');

// ================== scroll reveal (satu momen halus per section) ==================
document.querySelectorAll('.section-head, .about-grid, .hero-text').forEach((el) => el.classList.add('reveal'));
if (!prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
}

// ================== teks peran berganti (hero) ==================
const roles = ['Kelas XI', 'Belajar Jaringan', 'Eksplorasi AI', 'Calon Praktisi TKJ'];
const roleEl = document.getElementById('roleCycle');
let roleIndex = 0;
if (!prefersReducedMotion) {
  setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleEl.style.opacity = 0;
    setTimeout(() => {
      roleEl.textContent = roles[roleIndex];
      roleEl.style.opacity = 1;
    }, 250);
  }, 2600);
}
roleEl.style.transition = 'opacity .25s ease';

// ================== kartu ID gantung (drag & swing) ==================
const cardWrap = document.getElementById('idCardWrap');
let isDragging = false;
let startX = 0;

function pointerX(e){ return e.touches ? e.touches[0].clientX : e.clientX; }

function startDrag(e){
  isDragging = true;
  startX = pointerX(e);
  cardWrap.classList.add('is-dragging');
}
function duringDrag(e){
  if (!isDragging) return;
  const dx = pointerX(e) - startX;
  const angle = Math.max(-28, Math.min(28, dx / 4));
  cardWrap.style.transform = `rotate(${angle}deg)`;
}
function endDrag(){
  if (!isDragging) return;
  isDragging = false;
  cardWrap.classList.remove('is-dragging');
  cardWrap.style.transition = 'transform .8s cubic-bezier(.34,1.56,.64,1)';
  cardWrap.style.transform = 'rotate(0deg)';
  setTimeout(() => { cardWrap.style.transition = ''; }, 850);
}

cardWrap.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', duringDrag);
window.addEventListener('mouseup', endDrag);
cardWrap.addEventListener('touchstart', startDrag, { passive: true });
window.addEventListener('touchmove', duringDrag, { passive: true });
window.addEventListener('touchend', endDrag);

// ================== tab switch portofolio ==================
const tabSwitch = document.getElementById('tabSwitch');
const tabIndicator = document.getElementById('tabIndicator');
const tabButtons = Array.from(tabSwitch.querySelectorAll('.tab-btn'));

function moveTabIndicator(btn){
  tabIndicator.style.left = btn.offsetLeft + 'px';
  tabIndicator.style.width = btn.offsetWidth + 'px';
}

function activateTab(tabName){
  tabButtons.forEach((b) => b.classList.toggle('is-active', b.dataset.tab === tabName));
  document.querySelectorAll('.tab-panel').forEach((p) => {
    p.classList.toggle('is-active', p.id === `panel-${tabName}`);
  });
  moveTabIndicator(tabButtons.find((b) => b.dataset.tab === tabName));
}

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});
window.addEventListener('resize', () => {
  moveTabIndicator(tabButtons.find((b) => b.classList.contains('is-active')));
});
// posisi awal indikator (tunggu font/layout siap)
requestAnimationFrame(() => moveTabIndicator(tabButtons[0]));

// ================== detail proyek (expand/collapse) ==================
document.querySelectorAll('.project-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.project-card');
    const isOpen = card.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.firstChild.textContent = isOpen ? 'Sembunyikan detail ' : 'Lihat detail ';
  });
});

// ================== angka statistik naik ==================
const statNums = document.querySelectorAll('.stat-num');
function animateCount(el){
  const target = Number(el.dataset.count || 0);
  if (prefersReducedMotion || target === 0) { el.textContent = target; return; }
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 30));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 30);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
statNums.forEach((el) => statObserver.observe(el));

// ===== GALERI & LIGHTBOX =====
const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
const galleryCount = document.getElementById('galleryCount');
const galleryStat = document.getElementById('galleryStat');

galleryItems.forEach((item, i) => item.setAttribute('data-index', i + 1));

function updateGalleryCount() {
  const filled = galleryItems.filter((item) => {
    const src = item.querySelector('img').getAttribute('src');
    const has = !!(src && src.trim() !== '');
    item.classList.toggle('has-photo', has);
    return has;
  }).length;
  galleryCount.textContent = `${filled} foto`;
  if (galleryStat) galleryStat.dataset.count = filled;
}
updateGalleryCount();

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let filledItems = [];
let currentIndex = 0;

function openLightbox(index) {
  filledItems = galleryItems.filter((item) => {
    const src = item.querySelector('img').getAttribute('src');
    return src && src.trim() !== '';
  });
  currentIndex = filledItems.findIndex((item) => item === galleryItems[index]);
  if (currentIndex === -1) return;
  showLightboxImage();
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
}

function showLightboxImage() {
  const img = filledItems[currentIndex].querySelector('img');
  lightboxImg.src = img.getAttribute('src');
  lightboxImg.alt = img.getAttribute('alt') || '';
  lightboxCaption.textContent = img.getAttribute('data-caption') || '';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
});
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + filledItems.length) % filledItems.length;
  showLightboxImage();
});
lightboxNext.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % filledItems.length;
  showLightboxImage();
});
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('is-open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxPrev.click();
  if (e.key === 'ArrowRight') lightboxNext.click();
});

// ================== kelopak dekoratif ==================
if (!prefersReducedMotion) {
  const layer = document.getElementById('petalLayer');
  const totalPetals = 10;
  for (let i = 0; i < totalPetals; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = 10 + Math.random() * 9 + 's';
    petal.style.animationDelay = Math.random() * 10 + 's';
    petal.style.opacity = 0.2 + Math.random() * 0.3;
    layer.appendChild(petal);
  }
}

// ================== form kontak -> mailto ==================
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get('name');
  const email = data.get('email');
  const message = data.get('message');
  const subject = encodeURIComponent(`Pesan dari ${name} lewat portofolio`);
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
  window.location.href = `mailto:jassonficosaverio@gmail.com?subject=${subject}&body=${body}`;
});

// ================== komentar / buku tamu ==================
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
const commentImageInput = document.getElementById('commentImage');
const uploadLabel = document.getElementById('uploadLabel');

let comments = [
  { name: 'Jasson Fico Saverio', text: 'Terima kasih sudah mampir di portofolio aku!', pinned: true, image: null },
];

function initials(name){
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');
}

function renderComments(){
  commentList.innerHTML = '';
  const sorted = [...comments].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  sorted.forEach((c) => {
    const item = document.createElement('div');
    item.className = 'comment-item' + (c.pinned ? ' is-pinned' : '');
    item.innerHTML = `
      <div class="comment-item-head">
        <span class="comment-avatar">${initials(c.name)}</span>
        <span class="comment-name">${c.name}</span>
        ${c.pinned ? '<span class="comment-pin">📌 disematkan</span>' : ''}
      </div>
      <p class="comment-text"></p>
    `;
    item.querySelector('.comment-text').textContent = c.text;
    if (c.image) {
      const img = document.createElement('img');
      img.src = c.image;
      img.className = 'comment-image';
      img.alt = `Lampiran dari ${c.name}`;
      item.appendChild(img);
    }
    commentList.appendChild(item);
  });
}
renderComments();

commentImageInput.addEventListener('change', () => {
  const file = commentImageInput.files[0];
  uploadLabel.textContent = file ? `📎 ${file.name}` : '📎 Lampirkan gambar (opsional)';
});

commentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(commentForm);
  const name = (data.get('name') || '').toString().trim();
  const text = (data.get('comment') || '').toString().trim();
  if (!name || !text) return;

  const file = commentImageInput.files[0];
  const pushComment = (imageUrl) => {
    comments.push({ name, text, pinned: false, image: imageUrl || null });
    renderComments();
    commentForm.reset();
    uploadLabel.textContent = '📎 Lampirkan gambar (opsional)';
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => pushComment(reader.result);
    reader.readAsDataURL(file);
  } else {
    pushComment(null);
  }
});
