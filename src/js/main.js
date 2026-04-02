/* Your JS here. */
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
  menuIcon.classList.toggle('bx-x');
  navbar.classList.toggle('active');
};

// scroll sections active link
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
  sections.forEach(sec => {
    let top = window.scrollY;
    let offset = sec.offsetTop - 150;
    let height = sec.offsetHeight;
    let id = sec.getAttribute('id');

    if(top >= offset && top < offset + height) {
      navLinks.forEach(links => {
        links.classList.remove('active');
        document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
      });
    };
  });
  // sticky navbar
  let header = document.querySelector('header');
  const scrolled = window.scrollY > 100;

  header.classList.toggle('sticky', scrolled);
  header.classList.toggle('big', !scrolled);

  menuIcon.classList.remove('bx-x');
  navbar.classList.remove('active');
};

// initialize header size on load
window.addEventListener('load', () => {
  const header = document.querySelector('header');
  if (window.scrollY <= 100) {
    header.classList.add('big');
  } else {
    header.classList.remove('big');
  }
  // background video fade-in when ready
  const bgVideo = document.getElementById('home-bg-video');
  if (bgVideo) {
    const tryShow = () => {
      bgVideo.play().catch(() => {});
      setTimeout(() => bgVideo.classList.add('visible'), 700);
    };

    if (bgVideo.readyState >= 3) {
      tryShow();
    } else {
      const onCanPlay = () => {
        tryShow();
        bgVideo.removeEventListener('canplay', onCanPlay);
      };
      bgVideo.addEventListener('canplay', onCanPlay);

      // safety fallback: if 'canplay' never fires, still reveal after 3s
      setTimeout(() => bgVideo.classList.add('visible'), 3000);
    }
  }
});

// wechat QR code popup out
document.getElementById('icon-link').addEventListener('click', function(event){
  event.preventDefault();
  var popup = document.getElementById('image-popup');
  popup.style.display = 'flex';
});

// Close the popup when clicking anywhere on the screen
document.getElementById('image-popup').addEventListener('click', function(){
  this.style.display = 'none';
});

// scroll reveal
ScrollReveal({
  // reset: true,
  distance: '80px',
  duration: 2000,
  delay: 200,
});

ScrollReveal().reveal('.home-content, .heading', { origin: 'top' });
ScrollReveal().reveal('.home-img, .lifestyles-container, .portfolio-box, .contact form', { origin: 'bottom' });
ScrollReveal().reveal('.home-content h1, .about-img', { origin: 'left' });
ScrollReveal().reveal('.home-content p, .about-content', { origin: 'right' });

// typed js
const typed = new Typed('.multiple-text', {
  strings: ['College Student', 'Videographer', 'Photographer','Programmer'],
  typeSpeed: 50,
  backSpeed: 50,
  backDelay: 1000,
  loop: true
});

// dark mode toggle
const toggle = document.querySelector('#dark-mode-toggle');
toggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggle.innerHTML = document.body.classList.contains('dark-mode') ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      // if href is just '#' or empty, don't attempt to querySelector it
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
      }
  });
});

// Lifestyles gallery / carousel logic
const galleryOverlay = document.getElementById('lifestyles-gallery');
const gallerySlides = document.querySelectorAll('#lifestyles-gallery .slide');
const galleryDotsContainer = document.querySelector('#lifestyles-gallery .gallery-dots');
let currentSlide = 0;

function showSlide(index) {
  if (!gallerySlides.length) return;
  gallerySlides.forEach(s => s.classList.remove('active'));
  const idx = (index + gallerySlides.length) % gallerySlides.length;
  gallerySlides[idx].classList.add('active');
  currentSlide = idx;
  // update dots
  if (galleryDotsContainer) {
    Array.from(galleryDotsContainer.children).forEach((d,i) => d.classList.toggle('active', i === idx));
  }
}

function openGallery() {
  if (!galleryOverlay) return;
  // append overlay to body so it behaves like the WeChat popup (fixed fullscreen)
  if (galleryOverlay.parentNode !== document.body) document.body.appendChild(galleryOverlay);

  galleryOverlay.classList.add('open');
  galleryOverlay.setAttribute('aria-hidden', 'false');
  // lock body scroll while gallery is open
  document.body.style.overflow = 'hidden';
  showSlide(0);
}

function closeGallery() {
  if (!galleryOverlay) return;
  galleryOverlay.classList.remove('open');
  galleryOverlay.setAttribute('aria-hidden', 'true');
  // restore scrolling
  document.body.style.overflow = '';
}

// wire up Read More buttons
document.querySelectorAll('.read-more').forEach(btn => {
  btn.addEventListener('click', () => {
    openGallery();
  });
});

// arrows
document.querySelectorAll('#lifestyles-gallery .gallery-arrow.left').forEach(btn => btn.addEventListener('click', () => showSlide(currentSlide - 1)));
document.querySelectorAll('#lifestyles-gallery .gallery-arrow.right').forEach(btn => btn.addEventListener('click', () => showSlide(currentSlide + 1)));

// close
const closeBtn = document.querySelector('#lifestyles-gallery .gallery-close');
if (closeBtn) closeBtn.addEventListener('click', closeGallery);

// close when clicking the overlay background (but not when clicking the gallery container)
if (galleryOverlay) {
  galleryOverlay.addEventListener('click', function(e) {
    if (e.target === galleryOverlay) closeGallery();
  });
}

// build dots
if (galleryDotsContainer && gallerySlides.length) {
  gallerySlides.forEach((_, i) => {
    const d = document.createElement('button');
    d.addEventListener('click', () => showSlide(i));
    galleryDotsContainer.appendChild(d);
  });
}