window.onload = init;

// Set the board boundaries
const board = document.getElementById("board");
const rect = board.getBoundingClientRect();
const startX = rect.left + window.scrollX;
const startY = rect.top + window.scrollY;
const endX = startX + rect.width;
const endY = startY + rect.height;

function init() {
  controller.startGame();
  // printMousePoint();
  view.displayPlayerPieces(1);
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
