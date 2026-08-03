/* ===================================================
   Fishers — scroll triggers + small interactions
   =================================================== */

(function(){
  // ---------- Header scroll state ----------
  const header = document.querySelector('.site-header');
  const heroDark = header && header.classList.contains('on-dark');
  function onScroll(){
    if(!header) return;
    const y = window.scrollY;
    if(y > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // ---------- Mobile nav toggle ----------
  const navToggle = document.querySelector('.nav-toggle');
  if(navToggle && header){
    navToggle.addEventListener('click', ()=>{
      const open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    header.querySelectorAll('.nav a').forEach(a=> a.addEventListener('click', ()=>{
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  // ---------- Reveal on scroll ----------
  const revealEls = document.querySelectorAll('.rv, .rv-mask, .rv-img, .rv-left, .rv-right');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el=> io.observe(el));
  } else {
    revealEls.forEach(el=> el.classList.add('in'));
  }

  // ---------- Mobile house-card background peek ----------
  // Desktop reveals each house's background photo on :hover; touch devices
  // have no hover, so on narrow viewports show it instead based on scroll
  // position: whichever card's center is closest to dead-center of the
  // screen gets the photo, and it switches back to white as soon as the
  // card scrolls off that point — not a timed flash, tied directly to
  // scroll position so it tracks back and forth with the user.
  const houseEls = document.querySelectorAll('.house');
  if(houseEls.length && window.matchMedia('(max-width: 1000px)').matches){
    // How close to dead-center (as a fraction of viewport height) a card's
    // midpoint needs to be for its photo to show.
    const CENTER_ZONE = 0.16;
    function onScrollHouses(){
      const vh = window.innerHeight;
      const screenCenter = vh / 2;
      houseEls.forEach(el=>{
        const r = el.getBoundingClientRect();
        const cardCenter = r.top + r.height / 2;
        const dist = Math.abs(cardCenter - screenCenter);
        el.classList.toggle('bg-peek', dist < vh * CENTER_ZONE);
      });
    }
    window.addEventListener('scroll', onScrollHouses, { passive:true });
    window.addEventListener('resize', onScrollHouses);
    onScrollHouses();
  }

  // ---------- Parallax on .parallax img ----------
  const pxEls = document.querySelectorAll('[data-parallax]');
  function onScrollPX(){
    pxEls.forEach(el=>{
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = r.top + r.height/2;
      const delta = (center - vh/2) / vh; // ~ -1..1
      const strength = parseFloat(el.dataset.parallax) || 0.15;
      const img = el.querySelector('img');
      if(img){
        img.style.transform = `translate3d(0, ${(-delta*strength*100).toFixed(2)}px, 0) scale(1.08)`;
      }
    });
  }
  if(pxEls.length){
    window.addEventListener('scroll', onScrollPX, { passive:true });
    window.addEventListener('resize', onScrollPX);
    onScrollPX();
  }

  // ---------- Smooth count-up on .countup ----------
  const cu = document.querySelectorAll('.countup');
  if(cu.length && 'IntersectionObserver' in window){
    const co = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.value);
        const dur = 1200;
        const t0 = performance.now();
        function step(t){
          const k = Math.min(1, (t-t0)/dur);
          const v = Math.floor(target * (1 - Math.pow(1-k, 3)));
          el.textContent = v;
          if(k<1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold:0.3 });
    cu.forEach(el=> co.observe(el));
  }

  // ---------- Crossfade slideshows (.r-quote-slideshow) ----------
  document.querySelectorAll('.r-quote-slideshow').forEach((box)=>{
    const slides = box.querySelectorAll('img');
    if(slides.length < 2) return;
    box.classList.add('js-ready');
    let i = 0;
    slides[0].classList.add('is-active');
    const interval = parseInt(box.dataset.rotateInterval, 10) || 6000;
    const offset = parseInt(box.dataset.rotateOffset, 10) || 0;
    function show(n){
      slides[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
    }
    function advance(){ show(i + 1); }

    // Manual "next" arrow on the photo edge
    const nav = document.createElement('button');
    nav.type = 'button';
    nav.className = 'r-quote-nav';
    nav.setAttribute('aria-label', 'Next photo');
    nav.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><polyline points="9,5 16,12 9,19"/></svg>';
    box.appendChild(nav);

    let timer = null;
    function startTimer(){ timer = setInterval(advance, interval); }
    nav.addEventListener('click', (e)=>{
      e.preventDefault();
      if(timer){ clearInterval(timer); }
      advance();
      startTimer();
    });

    if('IntersectionObserver' in window){
      const io = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            setTimeout(()=>{ advance(); startTimer(); }, offset);
            io.unobserve(box);
          }
        });
      }, { threshold: 0.2 });
      io.observe(box);
    } else {
      setTimeout(()=>{ advance(); startTimer(); }, offset);
    }
  });

  // ---------- Floating "Book Now" button ----------
  const floatBook = document.querySelector('.float-book');
  const footerEl = document.querySelector('.footer');
  if(floatBook){
    function onScrollBook(){
      const past = window.scrollY > window.innerHeight * 0.55;
      let nearFooter = false;
      if(footerEl){
        nearFooter = footerEl.getBoundingClientRect().top < window.innerHeight - 60;
      }
      floatBook.classList.toggle('show', past && !nearFooter);
    }
    window.addEventListener('scroll', onScrollBook, { passive:true });
    window.addEventListener('resize', onScrollBook);
    onScrollBook();
  }

  // ---------- Footer "Contact Us" restaurant picker ----------
  // One shared button instead of each page mailto-ing a different address
  // under an identical-looking link — clicking it opens a small popover to
  // choose which house's email to use.
  document.querySelectorAll('.footer-contact').forEach((wrap)=>{
    const toggle = wrap.querySelector('.footer-contact-toggle');
    const menu = wrap.querySelector('.footer-contact-menu');
    if(!toggle || !menu) return;
    function close(){
      menu.hidden = true;
      wrap.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
    function open(){
      menu.hidden = false;
      wrap.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
    toggle.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(menu.hidden) open(); else close();
    });
    document.addEventListener('click', (e)=>{
      if(!wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape') close();
    });
  });

})();
