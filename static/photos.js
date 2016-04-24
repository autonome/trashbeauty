function qs(s) {
  return document.querySelector(s);
}

var list = qs('div.container');
new Slip(list);

list.addEventListener('slip:swipe', function(e) {
  e.target.parentNode.removeChild(e.target);
  /*
  // e.target list item swiped
  if (thatWasSwipeToRemove) {
    // list will collapse over that element
    e.target.parentNode.removeChild(e.target);
  } else {
    e.preventDefault(); // will animate back to original position
  }
  */
});

/*
// Prepare the cards in the stack for iteration.
const cards = [].slice.call(document.querySelectorAll('img'));

// An instance of the Stack is used to attach event listeners.
var stack = gajus.Swing.Stack();

cards.forEach(function(targetElement) {
  // Add card element to the Stack.
  stack.createCard(targetElement);
});

console.log('asdfads')

// Add event listener for when a card is thrown out of the stack.
stack.on('throwout', (e) => {
  alert('throwout')
  // e.target Reference to the element that has been thrown out of the stack.
  // e.throwDirection Direction in which the element has been thrown (Card.DIRECTION_LEFT, Card.DIRECTION_RIGHT).

  //console.log('Card has been thrown out of the stack.');
  //console.log('Throw direction: ' + (e.throwDirection == Card.DIRECTION_LEFT ? 'left' : 'right'));

  console.log(e.target);
  //e.target.parentNode.removeChild(e.target);
});

// Add event listener for when a card is thrown in the stack, including the spring back into place effect.
stack.on('throwin', () => {
  console.log('Card has snapped back to the stack.');
});

stack.on('throwout', function (e) {
  console.log(e.target.innerText || e.target.textContent, 'has been thrown out of the stack to the', e.throwDirection == 1 ? 'right' : 'left', 'direction.');
});

stack.on('throwin', function (e) {
  console.log(e.target.innerText || e.target.textContent, 'has been thrown into the stack from the', e.throwDirection == 1 ? 'right' : 'left', 'direction.');
});

stack.on('dragstart', function (e) {
  console.log('dragmove')
    throwOutConfidenceElements.yes = e.target.querySelector('.yes').style;
    throwOutConfidenceElements.no = e.target.querySelector('.no').style;
});

stack.on('dragmove', function (e) {
  console.log('dragmove')
    throwOutConfidenceElements[e.throwDirection == gajus.Swing.Card.DIRECTION_RIGHT ? 'yes' : 'no'].opacity = e.throwOutConfidence;

    throwOutConfidenceBind.innerHTML = e.throwOutConfidence.toFixed(3);
    directionBind.innerHTML = e.throwDirection == gajus.Swing.Card.DIRECTION_RIGHT ? 'right' : 'left';
});

stack.on('dragend', function (e) {
  console.log('dgragend')
    if (e.throwOutConfidence != 1) {
        throwOutConfidenceElements.yes.opacity = 0;
        throwOutConfidenceElements.no.opacity = 0;
    }
});
*/

console.log('done!')
