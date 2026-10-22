/**
 * THOD — The House of Detail
 * JavaScript: Navegación, Menú Mobile, Galería de Trabajos, FAQ y Footer (Etapas 1-7)
 */

(function () {
  'use strict';

  // Esperar a que el DOM esté completamente cargado
  document.addEventListener('DOMContentLoaded', function () {
    initHeader();
    initWorksGallery();
    initFaqAccordion();
    initFooter();
  });

  function initHeader() {
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const primaryNav = document.getElementById('primary-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.getElementById('header');

    if (!mobileNavToggle || !primaryNav) {
      return;
    }

    /**
     * Alterna la visibilidad del menú mobile
     */
    function toggleMobileNav() {
      const isExpanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
      const newState = !isExpanded;

      mobileNavToggle.setAttribute('aria-expanded', String(newState));
      mobileNavToggle.setAttribute(
        'aria-label',
        newState ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
      );

      primaryNav.classList.toggle('is-open', newState);

      if (newState) {
        // Al abrir, colocar foco opcional en el primer enlace navegable
        const firstLink = primaryNav.querySelector('.nav-link');
        if (firstLink) {
          firstLink.focus();
        }
      }
    }

    /**
     * Cierra el menú mobile
     * @param {boolean} [returnFocus=false] Si debe devolver el foco al botón de alternar
     */
    function closeMobileNav(returnFocus = false) {
      if (primaryNav.classList.contains('is-open')) {
        primaryNav.classList.remove('is-open');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
        mobileNavToggle.setAttribute('aria-label', 'Abrir menú de navegación');

        if (returnFocus) {
          mobileNavToggle.focus();
        }
      }
    }

    // Evento de clic en el botón de hamburguesa
    mobileNavToggle.addEventListener('click', toggleMobileNav);

    // Eventos en enlaces de navegación: cerrar menú al hacer clic y actualizar estado activo
    navLinks.forEach((link) => {
      link.addEventListener('click', function () {
        // En móvil, cerrar menú al hacer clic en un enlace
        closeMobileNav(false);

        // Actualizar visualmente el enlace activo
        navLinks.forEach((l) => {
          l.classList.remove('active');
          l.removeAttribute('aria-current');
        });

        this.classList.add('active');
        this.setAttribute('aria-current', 'page');
      });
    });

    // Cierre con la tecla Escape (requisito WCAG)
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        closeMobileNav(true);
      }
    });

    // Cierre al hacer clic fuera del header
    document.addEventListener('click', function (event) {
      if (
        primaryNav.classList.contains('is-open') &&
        !header.contains(event.target)
      ) {
        closeMobileNav(false);
      }
    });

    // Resetear estado al redimensionar a pantallas de escritorio
    window.addEventListener('resize', function () {
      if (window.innerWidth > 992 && primaryNav.classList.contains('is-open')) {
        closeMobileNav(false);
      }
    });
  }

  /**
   * Galería de Trabajos Realizados: Desplazamiento horizontal accesible con botones y teclado (Etapa 4)
   */
  function initWorksGallery() {
    const track = document.getElementById('worksGalleryTrack');
    const prevBtn = document.getElementById('worksGalleryPrev');
    const nextBtn = document.getElementById('worksGalleryNext');
    const dots = document.querySelectorAll('.works-dot');

    if (!track || !prevBtn || !nextBtn) {
      return;
    }

    /**
     * Calcula la distancia de desplazamiento según el ancho de un cartão + gap
     */
    function getScrollStep() {
      const firstCard = track.querySelector('.work-card');
      if (!firstCard) return 260;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.gap) || 18;
      return firstCard.offsetWidth + gap;
    }

    /**
     * Actualiza el indicador activo de paginación
     */
    function updateActiveDot(index) {
      dots.forEach((dot, i) => {
        const isActive = i === index;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', String(isActive));
      });
    }

    // Actualizar punto activo en tiempo real durante el scroll
    let isScrolling = false;
    track.addEventListener('scroll', function () {
      if (!isScrolling) {
        window.requestAnimationFrame(function () {
          const step = getScrollStep();
          if (step > 0 && dots.length > 0) {
            const activeIndex = Math.min(
              dots.length - 1,
              Math.max(0, Math.round(track.scrollLeft / step))
            );
            updateActiveDot(activeIndex);
          }
          isScrolling = false;
        });
        isScrolling = true;
      }
    }, { passive: true });

    // Clic en los puntos de paginación
    dots.forEach((dot) => {
      dot.addEventListener('click', function () {
        const targetIndex = parseInt(this.getAttribute('data-index'), 10);
        const step = getScrollStep();
        track.scrollTo({ left: targetIndex * step, behavior: 'smooth' });
        updateActiveDot(targetIndex);
      });
    });

    // Navegación hacia la izquierda
    prevBtn.addEventListener('click', function () {
      const step = getScrollStep();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft <= 10 && maxScroll > 10) {
        track.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -step, behavior: 'smooth' });
      }
    });

    // Navegación hacia la derecha
    nextBtn.addEventListener('click', function () {
      const step = getScrollStep();
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll > 10 && track.scrollLeft >= maxScroll - 15) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: step, behavior: 'smooth' });
      }
    });

    // Navegación por teclado dentro de la galería con flechas izquierda/derecha
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      }
    });
  }

  /**
   * Acordeón Interactivo y Accesible para FAQ (Etapa 6)
   */
  function initFaqAccordion() {
    const faqBtns = document.querySelectorAll('.faq-question-btn');
    if (!faqBtns.length) return;

    faqBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const panelId = this.getAttribute('aria-controls');
        const panel = document.getElementById(panelId);

        // Cerrar los otros paneles abiertos (comportamiento de acordeón limpio y consistente)
        faqBtns.forEach(function (otherBtn) {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            const otherPanelId = otherBtn.getAttribute('aria-controls');
            const otherPanel = document.getElementById(otherPanelId);
            if (otherPanel) {
              otherPanel.hidden = true;
            }
          }
        });

        // Alternar estado del panel seleccionado
        if (isExpanded) {
          this.setAttribute('aria-expanded', 'false');
          if (panel) {
            panel.hidden = true;
          }
        } else {
          this.setAttribute('aria-expanded', 'true');
          if (panel) {
            panel.hidden = false;
          }
        }
      });
    });
  }

  /**
   * Footer: Año dinámico y Modal Accesible de Textos Legales (Etapa 7)
   */
  function initFooter() {
    // 1. Actualización dinámica del año de copyright
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
      currentYearEl.textContent = new Date().getFullYear();
    }

    // 2. Manejo accesible de textos legales sin páginas externas rotas
    const legalModal = document.getElementById('legalModal');
    const legalTitle = document.getElementById('legalModalTitle');
    const legalBody = document.getElementById('legalModalBody');
    const legalClose = document.getElementById('legalModalClose');
    const legalNoticeLink = document.getElementById('legalNoticeLink');
    const privacyPolicyLink = document.getElementById('privacyPolicyLink');

    if (!legalModal || !legalTitle || !legalBody) return;

    const legalTexts = {
      notice: {
        title: 'Aviso Legal',
        html: `
          <p><strong>1. Identificación del titular:</strong> THOD — The House of Detail, empresa especializada en detailing, protección y cuidado estético automotriz con sede de operaciones en España.</p>
          <p><strong>2. Propiedad intelectual:</strong> Todos los contenidos, logotipos, imágenes y marcas mostrados en este sitio web son propiedad exclusiva de THOD o de sus respectivos titulares.</p>
          <p><strong>3. Condiciones de uso:</strong> El acceso a esta web implica la aceptación de estas condiciones. Queda prohibida la reproducción total o parcial sin autorización expresa por escrito.</p>
          <p><strong>4. Contacto oficial:</strong> info@thod.es | Teléfono: +34 612 345 678.</p>
        `
      },
      privacy: {
        title: 'Política de Privacidad',
        html: `
          <p><strong>1. Responsable del tratamiento:</strong> THOD — The House of Detail.</p>
          <p><strong>2. Finalidad del tratamiento:</strong> Atender consultas comerciales y solicitudes de presupuesto para servicios de detailing remitidas a través de nuestros canales de contacto y WhatsApp.</p>
          <p><strong>3. Legitimación:</strong> Consentimiento inequívoco del usuario al enviar una solicitud de información o presupuesto.</p>
          <p><strong>4. Derechos:</strong> Puedes ejercer tus derechos de acceso, rectificación, supresión y oposición escribiendo a info@thod.es.</p>
          <p><strong>5. Conservación de datos:</strong> Los datos se conservarán durante el tiempo estrictamente necesario para la prestación del servicio solicitado.</p>
        `
      }
    };

    function openModal(type) {
      const data = legalTexts[type];
      if (!data) return;
      legalTitle.textContent = data.title;
      legalBody.innerHTML = data.html;
      if (typeof legalModal.showModal === 'function') {
        legalModal.showModal();
      } else {
        legalModal.setAttribute('open', '');
      }
    }

    function closeModal() {
      if (typeof legalModal.close === 'function') {
        legalModal.close();
      } else {
        legalModal.removeAttribute('open');
      }
    }

    if (legalNoticeLink) {
      legalNoticeLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal('notice');
      });
    }

    if (privacyPolicyLink) {
      privacyPolicyLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal('privacy');
      });
    }

    if (legalClose) {
      legalClose.addEventListener('click', closeModal);
    }

    // Cerrar al hacer clic en el backdrop
    legalModal.addEventListener('click', function (e) {
      if (e.target === legalModal) {
        closeModal();
      }
    });
  }
})();
