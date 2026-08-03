/* Sanity CMS menu loader — pulls live menu items into each course group.
   Single shared dataset (fishers_menu), separate document type per restaurant.
   Schema docs (see ~/fishers-website): menuItemLeith, menuItemCity,
     menuItemShorebar — each with name, description, price (number),
     category (string, matches data-course), available (boolean).
   Each page sets window.FISHERS_MENU_TYPE to its own document type name.
   Falls back to the static HTML already in the page if the fetch fails, returns nothing, or Sanity isn't reachable. */
(function(){
  var PROJECT_ID = '4ut45eec';
  var DATASET = 'fishers_menu';
  var DOC_TYPE = window.FISHERS_MENU_TYPE || 'menuItemLeith';
  var API = 'https://' + PROJECT_ID + '.apicdn.sanity.io/v2023-01-01/data/query/' + DATASET;

  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>]/g, function(c){
      return {'&':'&amp;', '<':'&lt;', '>':'&gt;'}[c];
    });
  }

  function itemHTML(it){
    var price = (it.price || it.price === 0) ? '<span class="price">' + esc(it.price) + '</span>' : '';
    // Note: deliberately no "rv" class — that class starts elements at
    // opacity:0 until a page-load-time IntersectionObserver (assets/script.js)
    // reveals them. Items inserted after that observer has already run never
    // get observed, so they'd stay invisible forever. These are already
    // appearing dynamically, so they don't need the scroll-reveal treatment.
    return '<div class="menu-item">' +
      '<div class="row1"><span class="name">' + esc(it.name) + '</span>' + price + '</div>' +
      '<p class="desc">' + esc(it.description) + '</p>' +
    '</div>';
  }

  document.querySelectorAll('.menu-course-group[data-course]').forEach(function(group){
    var course = group.getAttribute('data-course');
    // Sorted by orderRank (the manual drag-and-drop order set in Sanity's
    // Studio "Menus" reorder lists), falling back to name for any item
    // that predates that field / was added outside the ordered lists.
    var query = encodeURIComponent('*[_type=="' + DOC_TYPE + '" && category=="' + course + '" && available!=false] | order(orderRank asc, name asc){name,description,price}');

    fetch(API + '?query=' + query)
      .then(function(r){ return r.json(); })
      .then(function(data){
        var items = data && data.result;
        if(!items || !items.length) return; // keep static fallback
        group.querySelectorAll('.menu-item').forEach(function(el){ el.remove(); });

        // Groups that visually span two columns wrap them with
        // style="display:contents" so the .menu-col children stay direct
        // grid items of the parent .menu-cols grid. Appending straight to
        // `group` in that case would make each new item its own direct grid
        // child instead of flowing inside a column, producing one
        // item-per-cell with huge gaps. Distribute across the real .menu-col
        // containers (round-robin, for a balanced two-column look) when
        // present; otherwise just append to the group itself.
        var cols = group.querySelectorAll('.menu-col');
        if(cols.length){
          items.forEach(function(it, i){
            cols[i % cols.length].insertAdjacentHTML('beforeend', itemHTML(it));
          });
        } else {
          group.insertAdjacentHTML('beforeend', items.map(itemHTML).join(''));
        }
      })
      .catch(function(){ /* Sanity unreachable — static HTML stands */ });
  });
})();