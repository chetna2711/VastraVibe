/**
 * VastraVibe Wishlist Manager
 * Stores product handles in localStorage.
 * Key: 'vv_wishlist'  Value: Array<string> (product handles)
 */
window.VVWishlist = (function () {
  var KEY = 'vv_wishlist';

  function _get() {
    try {
      var data = localStorage.getItem(KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Wishlist get failed', e);
      return [];
    }
  }

  function _save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
      _updateHeaderCount(list.length);
      document.dispatchEvent(new CustomEvent('vv:wishlist:changed', { 
        detail: { count: list.length, list: list } 
      }));
    } catch (e) {
      console.error('Wishlist save failed', e);
    }
  }

  function add(handle) {
    if (!handle) return;
    var list = _get();
    if (!list.includes(handle)) {
      list.unshift(handle);
      _save(list);
    }
    return list;
  }

  function remove(handle) {
    if (!handle) return;
    var list = _get().filter(function (h) { return h !== handle; });
    _save(list);
    return list;
  }

  function toggle(handle) {
    if (!handle) return;
    if (has(handle)) {
      remove(handle);
    } else {
      add(handle);
    }
    updateUI();
  }

  function has(handle) {
    return _get().includes(handle);
  }

  function getAll() { return _get(); }
  function count()  { return _get().length; }

  /* Update the header wishlist bubble count */
  function _updateHeaderCount(n) {
    var bubble = document.getElementById('wishlist-count-bubble');
    if (!bubble) return;
    var inner = bubble.querySelector('span');
    if (n > 0) {
      if (inner) inner.textContent = n < 100 ? n : '99+';
      bubble.style.display = 'flex';
      bubble.hidden = false;
    } else {
      bubble.style.display = 'none';
      bubble.hidden = true;
    }
  }

  /* Update heart button states across the site */
  function updateUI() {
    var list = _get();
    var btns = document.querySelectorAll('[data-wishlist-handle]');
    btns.forEach(function (btn) {
      var handle = btn.getAttribute('data-wishlist-handle');
      if (list.includes(handle)) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  /* Handle global click delegation */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-wishlist-handle]');
    if (!btn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    var handle = btn.getAttribute('data-wishlist-handle');
    toggle(handle);
  });

  /* Sync on load */
  function init() {
    _updateHeaderCount(count());
    updateUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Sync on custom events (for other tabs or dynamic content) */
  document.addEventListener('vv:wishlist:changed', updateUI);

  return { 
    add: add, 
    remove: remove, 
    toggle: toggle, 
    has: has, 
    getAll: getAll, 
    count: count, 
    updateUI: updateUI,
    refresh: init
  };
})();
