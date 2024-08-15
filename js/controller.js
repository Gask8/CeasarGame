const controller = {
  gameState: 1,
  playerTurn: 1,
  selectedPiece: null,
  selectedDirection: true,

  startGame: function () {
    controller.startShowLocationsWithMouseMovement();
    controller.startGameStateClick();

    controller.startPlayer();

    controller.addAllBonusToken();
    view.displayMessage("Game Started");
  },

  //=====================Using Model=====================

  placeInfluenceToken: function (player, borderId) {
    const direction = this.selectedDirection;
    const pieceNumbers = gamePieces[this.selectedPiece];
    const border = model.borders[borderId];
    const location = locations[borderId + 18];
    //Checks
    if (border.player) {
      view.displayMessage("Already taken");
      return;
    }
    if (this.selectedPiece === null) {
      view.displayMessage("Select a piece");
      return;
    }
    if (pieceNumbers[2] !== border.unit && pieceNumbers[2] !== "wild") {
      view.displayMessage("No same type");
      return;
    }
    //View
    view.addInfluenceToken(player, location, pieceNumbers, direction);
    model.discardAPiece(player, this.selectedPiece);
    view.displayPlayerPieces(player);
    // model.grabAPiece(player, 1);
    //Change Variables
    model.borders[borderId].player = player;
    model.setInfluenceInState(
      player,
      pieceNumbers,
      location.conections,
      direction
    );

    console.log("Placed Influence Token");
    console.log(model.borders[borderId]);
    console.log(model.states[location.conections[0] - 1]);
    console.log(model.states[location.conections[1] - 1]);
    this.selectPiece = null;
  },

  // Interacting with Player
  startPlayer: function () {
    model.grabAPiece(1, 2);
    view.displayPlayerPieces;
  },

  selectPiece: function (id) {
    controller.selectedPiece = id;
    view.displayMessage(id);
  },

  changeDirection: function (reset) {
    if (!reset) {
      controller.selectedDirection = !controller.selectedDirection;
    } else {
      controller.selectedDirection = true;
    }
  },

  //=====================Game State & Events=====================

  startGameStateClick: function () {
    function checkMousePos(event) {
      let x = event.clientX;
      let y = event.clientY;
      if (x < startX || x > endX || y < startY || y > endY) {
        return;
      }
      const loc = { x: x - startX, y: y - startY };

      const locationIndex = auxiliar.getLocationsIndexByLocation(loc);

      switch (controller.gameState) {
        case 0:
          // Check if the location is clicked
          locationIndex !== null
            ? view.displayMessage(locations[locationIndex].id)
            : "";
          break;
        // 1. Influence Token Placement
        case 1:
          if (locationIndex >= 18) {
            controller.placeInfluenceToken(1, locationIndex - 18);
          }
          break;
        default:
          return;
      }
    }
    document.addEventListener("click", checkMousePos);
  },

  startShowLocationsWithMouseMovement: function () {
    function printMousePos(event) {
      let x = event.clientX;
      let y = event.clientY;
      if (x < startX || x > endX || y < startY || y > endY) {
        view.displayInfo("");
        return;
      }
      const loc = { x: x - startX, y: y - startY };
      const locationIndex = auxiliar.getLocationsIndexByLocation(loc);
      if (locationIndex !== null) {
        const text = controller.getLocationHoverMessage(locationIndex);
        view.displayInfo(text);
      } else {
        view.displayInfo("");
      }
    }
    document.addEventListener("mousemove", printMousePos);
  },

  //=====================Using View=====================

  addAllBonusToken: function () {
    for (let i = 0; i < model.states.length; i++) {
      view.addBonusToken(model.states[i].bonusToken, locations[i].location, i);
    }
  },

  getLocationHoverMessage: function (index) {
    const loc = locations[index];
    const connections = auxiliar.getConntectionsText(loc);
    if (loc.type === "border") {
      return `${loc.type.toUpperCase()}<br> 
      =================<br> 
      Connecting: <br> ${connections[0]} 🔺<br> ${connections[1]} 🔻 <br>
      =================<br> 
      Type: ${loc.unit.toLocaleUpperCase()}`;
    } else {
      return `${loc.type.toUpperCase()}<br> 
      =================<br> 
       ${loc.name ? loc.name : ""}<br> 
      =================<br> 
    Borders:<br>  ${connections.join(", ")}`;
    }
  },
};

const auxiliar = {
  getLocationsIndexByLocation: function (loc) {
    for (let i = 0; i < locations.length; i++) {
      const cx = locations[i].location.x;
      const cy = locations[i].location.y;
      if (
        loc.x > cx - 20 &&
        loc.x < cx + 20 &&
        loc.y > cy - 20 &&
        loc.y < cy + 20
      ) {
        return i;
      }
    }
    return null;
  },

  getConntectionsText: function (location) {
    return location.conections.map((connectionId) => {
      const connectedLocation = locations.find(
        (loc) => loc.id === connectionId
      );
      return connectedLocation ? connectedLocation.name : "Unknown";
    });
  },
};
