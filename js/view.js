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
  displayLog: function (log) {
    const logArea = document.getElementById("gameLog");
    logArea.innerHTML = "";
    for (let i = 0; i < log.length; i++) {
      const p = document.createElement("p");
      p.innerHTML = log[i];
      logArea.appendChild(p);
    }
  },

  //=====================Managing Enemy=====================

  displayEnemyPieces: function () {
    const existingPieces = document.querySelectorAll(".enemyPieces");
    existingPieces.forEach((piece) => piece.remove());
    model.player2.piecesAtHand.forEach((piece) => {
      const piecesArea = document.getElementById("enemyArea");
      const piecesAtHand = document.createElement("div");
      piecesAtHand.classList.add("buttonPieces");
      piecesAtHand.classList.add("enemyPieces");
      piecesAtHand.id = "ep-" + piece[3];
      const p1 = document.createElement("p");
      const p2 = document.createElement("p");
      const img = document.createElement("img");
      p1.innerHTML = piece[0];
      img.src = `./images/${piece[2]}.png`;
      img.draggable = false;
      img.className = "playerPiecesImage";
      p2.innerHTML = piece[1];
      piecesAtHand.appendChild(img);
      piecesAtHand.appendChild(p1);
      piecesAtHand.appendChild(p2);
      piecesArea.appendChild(piecesAtHand);
    });
  },

  //=====================Managing InfoScreen=====================

  displayPlayerPieces: function (player) {
    const existingPieces = document.querySelectorAll(".playerPieces");
    existingPieces.forEach((piece) => piece.remove());

    model[`player${player}`].piecesAtHand.forEach((piece) => {
      const piecesArea = document.getElementById("piecesArea");
      const piecesAtHand = document.createElement("div");
      piecesAtHand.classList.add("buttonPieces");
      piecesAtHand.classList.add("playerPieces");
      piecesAtHand.classList.add("p-" + player);
      piecesAtHand.id = "pp-" + piece[3];
      const p1 = document.createElement("p");
      const p2 = document.createElement("p");
      const img = document.createElement("img");

      p1.innerHTML = piece[0];
      img.src = `./images/${piece[2]}.png`;
      img.draggable = false;
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
          controller.selectAPiece(piece);
        } else {
          [...document.getElementsByClassName("playerPieces")].forEach(
            (piece) => {
              piece.classList.remove("selected");
              piece.classList.remove("direction");
            }
          );
          controller.changeDirection(true);
          controller.selectAPiece(piece);
          document.getElementById("pp-" + piece[3]).classList.add("selected");
        }
      });

      document.getElementById("inBag").innerHTML = `In Bag: [${
        model[`player${player}`].pieces.length
      }]`;
    });
  },

  displayControlMarksCounter: function (player, points) {
    const board = document.getElementById("board");

    const existingMarks = document.querySelectorAll(
      `.controlMarksCounter.p-${player}`
    );
    existingMarks.forEach((mark) => mark.remove());

    let inistialLocation = { x: 33, y: 185 };
    if (player === 2) {
      inistialLocation = { x: 334, y: 508 };
    }

    for (let i = 0; i < points; i++) {
      const token = document.createElement("div");
      token.classList.add("controlMarksCounter");
      token.classList.add(`p-${player}`);
      token.style.left = `${inistialLocation.x - 15}px`;
      token.style.top = `${inistialLocation.y - 15}px`;
      board.appendChild(token);

      if (i % 2 === 0) {
        inistialLocation.x += 31;
      } else {
        inistialLocation.x -= 31;
        inistialLocation.y -= 30.5;
      }
    }
  },

  displaySenateCounter: function (player, tokens) {
    const board = document.getElementById("board");
    const existingMarks = document.querySelectorAll(
      `.senateTokens.p-${player}`
    );
    existingMarks.forEach((mark) => mark.remove());

    let inistialLocation = { x: 98.5, y: 123 };
    if (player === 2) {
      inistialLocation = { x: 301, y: 508 };
    }

    for (let i = 0; i < tokens; i++) {
      const token = document.createElement("div");
      token.classList.add("senateTokens");
      token.classList.add(`p-${player}`);
      token.style.left = `${inistialLocation.x - 15}px`;
      token.style.top = `${inistialLocation.y - 15}px`;
      board.appendChild(token);

      inistialLocation.y -= 31;
    }
  },

  addControlToken: function (player, location, times) {
    const board = document.getElementById("board");
    for (let i = 0; i < times; i++) {
      const token = document.createElement("div");
      token.classList.add("controlToken");
      token.classList.add("p-" + player);
      token.style.left = `${location.x - 15 + i * 5}px`;
      token.style.top = `${location.y - 15 + i * 5}px`;
      board.appendChild(token);
    }
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
    const board = document.getElementById("board");
    const token = document.createElement("div");
    token.classList.add("bonusToken");
    token.classList.add("bonus-" + type);
    token.id = "bonus-" + index;
    token.style.left = `${loc.x - 13}px`;
    token.style.top = `${loc.y - 13}px`;
    board.appendChild(token);
  },

  removeBonusToken: function (index) {
    const token = document.getElementById(`bonus-${index}`);
    token.remove();
  },

  addInfluenceToken: function (player, location, numbers, direction) {
    const board = document.getElementById("board");
    const token = document.createElement("div");
    token.classList.add("influenceToken");
    token.classList.add("p-" + player);
    token.id = "it-" + location.id;
    token.style.left = `${location.location.x - 16}px`;
    token.style.top = `${location.location.y - 16}px`;
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
    board.appendChild(token);
  },

  nullifyInfluenceToken: function (player, location) {
    const token = document.getElementById(`it-${location.id}`);
    token.remove();
    const board = document.getElementById("board");
    const newToken = document.createElement("div");
    newToken.classList.add("influenceToken");
    newToken.classList.add("p-" + player);
    newToken.style.left = `${location.location.x - 16}px`;
    newToken.style.top = `${location.location.y - 16}px`;
    board.appendChild(newToken);
  },

  drawDirectionArrows: function (location) {
    const arrows = document.querySelectorAll(".arrowHelper");
    arrows.forEach((arrow) => arrow.remove());

    const board = document.getElementById("board");
    const helper = document.createElement("div");
    helper.classList.add("arrowHelper");
    helper.style.left = `${location.location.x - 16}px`;
    helper.style.top = `${location.location.y - 16}px`;
    helper.style.transform = `rotate(${location.rotation}deg)`;

    board.appendChild(helper);
  },
};
