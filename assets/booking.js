/* =========================================================
   Booking modal — opens the ResDiary widget for any venue
   in a branded overlay. Used across home + venue pages.
   ========================================================= */
(function(){
  'use strict';

  var VENUES = {
    leith: {
      tag: 'No. 01 — The Original · Leith',
      title: 'Fishers <em>in Leith</em>',
      addr: '1 The Shore, Leith'
    },
    city: {
      tag: 'No. 02 — Thistle Street',
      title: 'Fishers <em>in the City</em>',
      addr: '58 Thistle Street'
    },
    shore: {
      tag: 'No. 03 — The Shore',
      title: 'The <em>Shore Bar</em>',
      addr: '3–4 The Shore, Leith'
    }
  };
  var FALLBACK = 'leith';

  var overlay, panel, frameEl, bodyEl, tagEl, titleEl, addrEl;
  var currentVenue = null;
  var loadedVenue  = null;
  var lastFocus    = null;
  var built        = false;

  function build(){
    if(built) return;
    built = true;

    overlay = document.createElement('div');
    overlay.className = 'bk-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Make a booking');
    overlay.innerHTML =
      '<div class="bk-panel">' +
        '<div class="bk-head">' +
          '<p class="bk-tag"></p>' +
          '<h3 class="bk-title"></h3>' +
          '<p class="bk-note">For parties over 4, please call</p>' +
          '<button class="bk-close" type="button" aria-label="Close booking">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
              '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<div class="bk-body">' +
          '<iframe class="bk-iframe" title="Reservations" ' +
            'allow="payment" referrerpolicy="no-referrer-when-downgrade"></iframe>' +
        '</div>' +
        '<div class="bk-foot">' +
          '<span>Secure booking · Powered by ResDiary</span>' +
          '<span class="bk-foot-addr"></span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    panel   = overlay.querySelector('.bk-panel');
    bodyEl  = overlay.querySelector('.bk-body');
    frameEl = overlay.querySelector('.bk-iframe');
    tagEl   = overlay.querySelector('.bk-tag');
    titleEl = overlay.querySelector('.bk-title');
    addrEl  = overlay.querySelector('.bk-foot-addr');

    overlay.querySelector('.bk-close').addEventListener('click', close);
    overlay.addEventListener('mousedown', function(e){
      if(e.target === overlay) close();
    });
  }

  function open(venueKey){
    var key = (venueKey && VENUES[venueKey]) ? venueKey : FALLBACK;
    build();

    var v = VENUES[key];
    tagEl.textContent  = v.tag;
    titleEl.innerHTML  = v.title;
    addrEl.textContent = v.addr;
    currentVenue = key;

    // Only (re)load the widget if the venue changed
    if(loadedVenue !== key){
      bodyEl.classList.remove('is-ready');
      frameEl.style.height = '520px';
      frameEl.src = 'assets/book-widget.html?v=' + encodeURIComponent(key);
      loadedVenue = key;
    }

    lastFocus = document.activeElement;
    document.documentElement.style.setProperty(
      '--bk-scrollbar', (window.innerWidth - document.documentElement.clientWidth) + 'px'
    );
    document.body.style.paddingRight = 'var(--bk-scrollbar)';
    document.body.style.overflow = 'hidden';

    // next frame so the transition runs
    requestAnimationFrame(function(){
      overlay.classList.add('is-open');
    });
    window.addEventListener('keydown', onKey);
    setTimeout(function(){
      var c = overlay.querySelector('.bk-close');
      if(c) c.focus({ preventScroll: true });
    }, 60);
  }

  function close(){
    if(!overlay || !overlay.classList.contains('is-open')) return;
    overlay.classList.remove('is-open');
    window.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    if(lastFocus && lastFocus.focus){
      try{ lastFocus.focus({ preventScroll: true }); }catch(e){}
    }
  }

  function onKey(e){
    if(e.key === 'Escape' || e.key === 'Esc') close();
  }

  // Live height + ready signal from the widget host iframe
  window.addEventListener('message', function(e){
    if(!e.data || e.data.type !== 'rd-widget-height') return;
    if(!frameEl || e.data.venue !== currentVenue) return;
    var h = Math.max(360, Math.min(e.data.height + 4, 2400));
    frameEl.style.height = h + 'px';
    bodyEl.classList.add('is-ready');
  });

  // Resolve which venue a trigger should book
  function venueFor(el){
    var explicit = el.getAttribute('data-book');
    if(explicit && VENUES[explicit]) return explicit;
    var page = document.body.getAttribute('data-page');
    if(page && VENUES[page]) return page;
    return FALLBACK;
  }

  function wire(){
    var triggers = document.querySelectorAll(
      '[data-book], .float-book, a.r-stack-btn[href="#"]'
    );
    triggers.forEach(function(el){
      if(el.__bkWired) return;
      el.__bkWired = true;
      el.addEventListener('click', function(e){
        e.preventDefault();
        open(venueFor(el));
      });
    });
  }

  // Expose for any future programmatic use
  window.FishersBooking = { open: open, close: close };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', wire);
  }else{
    wire();
  }
})();
