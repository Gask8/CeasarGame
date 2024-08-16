window.onload = init;

// Set the board boundaries
let startX, startY, endX, endY;

function init() {
  calculateBoardBoundaries();
  controller.startGame();
  // printMousePoint();
  view.displayPlayerPieces(1);
}

// Recalculate boundaries on window resize
window.addEventListener("resize", calculateBoardBoundaries);
function calculateBoardBoundaries() {
  const board = document.getElementById("board");
  const rect = board.getBoundingClientRect();
  startX = rect.left + window.scrollX;
  startY = rect.top + window.scrollY;
  endX = startX + rect.width;
  endY = startY + rect.height;
}

function printMousePosition() {
  function printMousePos(event) {
    console.log("clientX: " + event.clientX + " - clientY: " + event.clientY);
  }
  document.addEventListener("click", printMousePos);
}

function printMousePoint() {
  document.addEventListener("click", (event) => {
    // Calculate the position for the dot
    let x = event.pageX;
    let y = event.pageY;
    if (x < startX || x > endX || y < startY || y > endY) {
      console.log("Out of bounds");
      return;
    }
    x -= 5;
    y -= 5;
    view.addPoint(x, y);
    const board = document.getElementsByClassName("dot");
    const rect = board[0].getBoundingClientRect();
    const x1 = rect.left + window.scrollX - startX;
    const y2 = rect.top + window.scrollY - startY;
    console.log(` x: ${x1}, y: ${y2}`);
  });
}
