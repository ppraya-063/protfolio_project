document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('primary-nav');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.classList.toggle('active', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('active');
      });
    });
  }

  const header = document.getElementById('site-header');
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 8);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  if (sections.length && navAnchors.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(sec => spy.observe(sec));
  }

  const revealEls = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  const skillRows = document.querySelectorAll('.skill-row');

  if (skillRows.length) {
    const fillBars = () => {
      skillRows.forEach(row => {
        const level = row.getAttribute('data-level') || '0';
        const fill = row.querySelector('.skill-fill');
        if (fill) fill.style.width = level + '%';
      });
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      fillBars();
    } else {
      const skillSection = document.getElementById('skills');
      const skillObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            fillBars();
            obs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      if (skillSection) skillObserver.observe(skillSection);
    }
  }

  const copyBtn = document.getElementById('copy-email');
  const toast = document.getElementById('copy-toast');

  if (copyBtn && toast) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-email');
      try {
        await navigator.clipboard.writeText(email);
        toast.textContent = 'Copied ' + email + ' to clipboard.';
      } catch (err) {
        toast.textContent = email;
      }
      toast.classList.add('show');
      clearTimeout(copyBtn._toastTimer);
      copyBtn._toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    });
  }

  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (form && formStatus) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameField = document.getElementById('field-name');
      const emailField = document.getElementById('field-email');
      const messageField = document.getElementById('field-message');

      const fields = [nameField, emailField, messageField];
      let valid = true;

      fields.forEach(field => {
        const wrapper = field.closest('.field');
        const isEmpty = field.value.trim() === '';
        const isBadEmail = field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        const invalid = isEmpty || isBadEmail;
        wrapper.classList.toggle('invalid', invalid);
        if (invalid) valid = false;
      });

      if (!valid) {
        formStatus.textContent = 'Check the highlighted fields and try again.';
        formStatus.classList.add('error');
        return;
      }

      formStatus.classList.remove('error');

      const destinationEmail = (copyBtn && copyBtn.getAttribute('data-email')) || 'pokharelpraya@example.com';

      const subject = encodeURIComponent('Portfolio contact from ' + nameField.value.trim());
      const body = encodeURIComponent(
        messageField.value.trim() + '\n\n— ' + nameField.value.trim() + ' (' + emailField.value.trim() + ')'
      );
      const mailtoLink = 'mailto:' + destinationEmail + '?subject=' + subject + '&body=' + body;

      window.location.href = mailtoLink;
      formStatus.textContent = 'Opening your mail app to send this message…';
    });

    ['field-name', 'field-email', 'field-message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          el.closest('.field').classList.remove('invalid');
          formStatus.textContent = '';
          formStatus.classList.remove('error');
        });
      }
    });
  }

  const canvas = document.getElementById('net-bg');

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let width, height, nodes;
    const mouse = { x: null, y: null };

    const LINK_DIST = 130;
    const MOUSE_DIST = 160;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = Math.min(90, Math.floor((width * height) / 22000));
      nodes = Array.from({ length: Math.max(30, count) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25
      }));
    }

    function step() {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(73, 211, 196, ${0.14 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        if (mouse.x !== null) {
          const dx = nodes[i].x - mouse.x, dy = nodes[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_DIST) {
            ctx.strokeStyle = `rgba(242, 166, 90, ${0.22 * (1 - dist / MOUSE_DIST)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(73, 211, 196, 0.55)';
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    resize();
    requestAnimationFrame(step);
  } else if (canvas) {
    canvas.style.display = 'none';
  }
});