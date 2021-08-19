/*	Checks if all items are visible and in correct order
 *
 * selector is element selector that surrounds the table - we need to identify the container
 *
 * Items are array of {}, where {} is associative array of column name - > value,
 * column input contains column we are looking for
 *
 * Example
 *
 * we have this elements:
 * <table .class="container">
 *   <tr>
 * 		<td>data1</td>
 *   </tr>
 *   <tr>
 *      <td>data2</td>
 *   </tr>
 *   <tr>
 * 		<td>data3</td>
 *   </tr>
 * </table>
 *
 * checkTableItems(".container", [{name='data1'}, {name='data2'}, {name='data3'}], 'name')
 *
 * The command will first select the table element and then look in all elements inside and look for
 * the items (data1-data3) in correct order in elements.
 */
Cypress.Commands.add('checkTableItems', {}, (selector, items, column) => {
  // wait for renderer (first item available)
  // otherwise we may check table that is not loaded yet
  cy.get(selector).contains(items[0][column]);

  // get container and then all elements in the container (get('*'))
  cy.get(selector)
    .get('*')
    .then((elements) => {
      let itemIndex = 0;
      elements.each((index) => {
        let element = elements[index];
        // we have now all elements in container, but only subset of them has our wanted item
        // wanted item is in itemIndex position in array
        // we suppose elements are defined in HTML document in the same order as we want them
        let text = element.innerHTML;

        // check if element really contains only item and nothing more
        if (itemIndex < items.length && text == items[itemIndex][column]) {
          // move to next item, this way we can check all the items in correct order
          itemIndex++;
        }
      });

      // if item index is equal to items length, all items are in container in correct order
      expect(itemIndex).to.equal(items.length);
    });
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
