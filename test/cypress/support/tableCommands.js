/*	Checks if all items are visible and in correct order
 * 
 * selector is element selector that surrounds the table
 * 
 * Items are array of {}, where {} is associative array of column name - > value, 
 * column input contains column we are looking for

 */
Cypress.Commands.add('checkTableItems', {}, (selector, items, column) => {
  // wait for renderer (first item available)
  cy.get(selector).contains(items[0][column]);

  // get elements in container
  cy.get(selector)
    .get('*')
    .then((result) => {
      cy.checkTableElements(result, items, column);
    });
});

// Check if all elements contains items (for input variables, see checkTableItems)
Cypress.Commands.add('checkTableElements', {}, (elements, items, column) => {
  let itemIndex = 0;
  for (var i = 0; i < elements.length; i++) {
    let element = elements[i];
    let text = element.innerHTML;

    // if all items were found, quit
    if (itemIndex >= items.length) break;

    // check if element really contains only entity, the get returns all elements that contains the entity and other HTML
    // for example it returns main div and etc.
    if (text == items[itemIndex][column]) {
      // move to next item, this way we can check all the items in correct order
      itemIndex++;
    }
  }

  expect(itemIndex).to.equal(items.length);
});

// sorts item of object by column name
Cypress.Commands.add('sortBy', {}, (items, column, ascending) => {
  items.sort((a, b) => {
    let res = 0;
    if (a[column] > b[column]) {
      res = 1;
    } else {
      res = -1;
    }

    if (ascending == false) res *= -1;
    return res;
  });
});
