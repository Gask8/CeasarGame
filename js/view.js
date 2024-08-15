const view = {
  //=====================Basic Display =====================
  displayInfo: function (msg) {
    const messageArea = document.getElementById("infoArea");
    messageArea.innerHTML = msg;
  },
  displayMessage: function (msg) {
    const messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },

  //=====================Managing InfoScreen=====================

  displayPlayerPieces: function (player) {
    const existingPieces = document.querySelectorAll(".playerPieces");
    existingPieces.forEach((piece) => piece.remove());

    model[`player${player}`].piecesAtHand.forEach((piece) => {
      const piecesArea = document.getElementById("piecesArea");
      const piecesAtHand = document.createElement("div");
      piecesAtHand.classList.add("playerPieces");
      piecesAtHand.id = "pp-" + piece[3];
      const p1 = document.createElement("p");
      const p2 = document.createElement("p");
      const img = document.createElement("img");

      p1.innerHTML = piece[0];
      img.src = `./images/${piece[2]}.png`;
      img.className = "playerPiecesImage";
      p2.innerHTML = piece[1];

      piecesAtHand.appendChild(img);
      piecesAtHand.appendChild(p1);
      piecesAtHand.appendChild(p2);

      piecesArea.appendChild(piecesAtHand);

      piecesAtHand.addEventListener("click", () => {
        //Check if tpiece is already selected
        if (controller.selectedPiece === piece[3]) {
          controller.changeDirection();
          document
            .getElementById("pp-" + piece[3])
            .classList.toggle("direction");
        } else {
          [...document.getElementsByClassName("playerPieces")].forEach(
            (piece) => {
              piece.classList.remove("selected");
              piece.classList.remove("direction");
            }
          );
          controller.changeDirection(true);
          controller.selectPiece(piece[3]);
          document.getElementById("pp-" + piece[3]).classList.add("selected");
        }
      });

      document.getElementById("inBag").innerHTML = `In Bag: [${
        model[`player${player}`].pieces.length
      }]`;
    });
  },

  //=====================Display Effects=====================
  addPoint: function (x, y) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    dot.classList.add("red-dot");
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    document.body.appendChild(dot);
    setTimeout(() => {
      dot.remove();
    }, 3000);
  },

  addBonusToken: function (type, loc, index) {
    const token = document.createElement("div");
    token.classList.add("bonusToken");
    token.classList.add("bonus-" + type);
    token.id = "bonus-" + index;
    token.style.left = `${loc.x - 13 + startX}px`;
    token.style.top = `${loc.y - 13 + startY}px`;
    document.body.appendChild(token);
  },

  addInfluenceToken: function (player, location, numbers, direction) {
    const token = document.createElement("div");
    token.classList.add("influenceToken");
    token.classList.add("p-" + player);
    token.style.left = `${location.location.x - 16 + startX}px`;
    token.style.top = `${location.location.y - 16 + startY}px`;
    token.style.transform = `rotate(${location.rotation}deg)`;
    const p1 = document.createElement("p");
    const p2 = document.createElement("p");
    if (direction) {
      p1.innerHTML = numbers[0];
      p2.innerHTML = numbers[1];
    } else {
      p1.innerHTML = numbers[1];
      p2.innerHTML = numbers[0];
    }
    token.appendChild(p1);
    token.appendChild(p2);
    document.body.appendChild(token);
  },
};
