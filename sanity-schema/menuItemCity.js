export const menuItemCity = {
  name: 'menuItemCity',
  title: 'Menu Item — City',
  type: 'document',
  fields: [
    {name: 'name', title: 'Name', type: 'string', validation: r => r.required()},
    {name: 'description', title: 'Description', type: 'string'},
    {name: 'price', title: 'Price', type: 'string', description: 'e.g. 11 or 6.75 · 10'},
    {name: 'tag', title: 'Tag', type: 'string', description: 'e.g. House, V, GF — optional'},
    {name: 'course', title: 'Course', type: 'string', validation: r => r.required(),
      options: {list: [
        {title: 'Starters', value: 'starter'},
        {title: 'Mains', value: 'main'},
        {title: 'Fishers Favourites — From the kitchen', value: 'favourite-kitchen'},
        {title: 'Fishers Favourites — From the grill', value: 'favourite-grill'},
        {title: 'Shellfish Specials', value: 'shellfish'},
        {title: 'Shellfish Specials — Surf & Turf', value: 'shellfish-surfturf'},
        {title: 'Sides', value: 'side'},
        {title: 'Desserts', value: 'dessert'}
      ]}
    },
    {name: 'order', title: 'Order', type: 'number', description: 'Controls sort position within the course'},
    {name: 'available', title: 'Available', type: 'boolean', initialValue: true, description: 'Turn off to hide this item from the site without deleting it'}
  ],
  orderings: [
    {title: 'Order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}
  ],
  preview: {
    select: {title: 'name', subtitle: 'course'}
  }
}
