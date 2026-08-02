/* Sanity CMS menu loader — pulls live menu items into each course group.
   Single shared dataset (fishers_menu), separate document type per restaurant.
   Schema docs: menuItemLeith, menuItemCity, menuItemShorebar — each with
     name, description, price, tag (optional), course (string, matches data-course), order (number, optional).
   Each page sets window.FISHERS_MENU_TYPE to its own document type name.
   Falls back to the static HTML already in the page if the fetch fails, returns nothing, or Sanity isn't reachable. */
(function(){
  var PROJECT_ID = '4ut45eec';
  var DATASET = 'fishers_menu';
  var DOC_TYPE = window.FISHERS_MENU_TYPE || 'menuItemLeith';
  var API = 'https://' + PROJECT_ID + '.apicdn.sanity.io/v2023-01-01/data/query/' + DATASET;

  function itemHTML(it){
    var tag = it.tag ? ' <span class="tag">' + it.tag + '</span>' : '';
    var price = it.price ? '<span class="price">' + it.price + '</span>' : '';
    return '<div class="menu-item rv">' +
      '<div class="row1"><span class="name">' + it.name + '</span>' + price + '</div>' +
      '<p class="desc">' + (it.description || '') + tag + '</p>' +
    '</div>';
  }

  document.querySelectorAll('.menu-course-group[data-course]').forEach(function(group){
    var course = group.getAttribute('data-course');
    var query = encodeURIComponent('*[_type=="' + DOC_TYPE + '" && course=="' + course + '" && available!=false] | order(order asc, name asc){name,description,price,tag}');

    fetch(API + '?query=' + query)
      .then(function(r){ return r.json(); })
      .then(function(data){
        var items = data && data.result;
        if(!items || !items.length) return; // keep static fallback
        group.querySelectorAll('.menu-item').forEach(function(el){ el.remove(); });
        group.insertAdjacentHTML('beforeend', items.map(itemHTML).join(''));
      })
      .catch(function(){ /* Sanity unreachable — static HTML stands */ });
  });
})();