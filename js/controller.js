const controller = {
  gameState: 0,
  playerTurn: 1,
  selectedPiece: null,
  selectedDirection: true,
  gameLog: [],

  startGame: function () {
    this.startGameStateClick();
    this.startShowLocationsWithMouseMovement();
    this.startPlayer();
    this.addAllBonusToken();

    view.displayControlMarksCounter(1, 12);
    view.displayControlMarksCounter(2, 12);

    this.addToGameLog("Game Started");
    this.addToGameLog("Start Turn", 1);
    view.displayMessage("Game Started");
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
        // case 0:
        //   // Check if the location is clicked
        //   locationIndex !== null
        //     ? view.displayMessage(locations[locationIndex].id)
        //     : "";
        //   break;
        // 1. Influence Token Placement
        case 0:
          if (locationIndex >= 18) {
            controller.placeInfluenceToken(1, locationIndex - 18);
            // controller.gameState = 1;
          }
          break;
        default:
          return;
      }
    }
    document.addEventListener("click", checkMousePos);
  },

  manageIfHasWon: function (player) {
    //Win Condition #1
    if (player.controlMarks === 0) {
      view.displayMessage(`${player.name} Wins!`);
    }
    //Win Condition #2
    return;
  },

  playBonusToken: function (player, index) {
    const tokenType = model.states[index].bonusToken;
    switch (tokenType) {
      case 1:
        //Extra turn
        view.displayMessage("Bonus Extra Turn");
        break;
      case 2:
        //Extra turn
        model.grabAPiece(player, 1);
        view.displayMessage("Bonus Extra Piece");
        view.displayPlayerPieces(player);
        break;
      case 3:
        //Destroy Influence
        view.displayMessage("Destroy Influence");
        break;
      default:
        //Senate Token
        model[`player${player}`].senateBonus++;
        controller.addToGameLog(
          `Senate Token acquired. Now ${model[`player${player}`].name} has ${
            model[`player${player}`].senateBonus
          }`,
          player
        );
        model[`player${player}`].controlMarks -=
          model[`player${player}`].senateBonus;
        view.displayControlMarksCounter(
          player,
          model[`player${player}`].controlMarks
        );
        view.displaySenateCounter(player, model[`player${player}`].senateBonus);
        break;
    }
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

  //=====================Using Model=====================

  placeInfluenceToken: function (player, borderId) {
    const direction = this.selectedDirection;
    const pieceNumbers = gamePieces[this.selectedPiece];
    const border = model.borders[borderId];
    const location = locations[borderId + 18]; //+18 is the start of the borders
    //Checks
    if (border.player) {
      view.displayMessage("Border already taken");
      return;
    }
    if (this.selectedPiece === null) {
      view.displayMessage("Select a piece");
      return;
    }
    if (pieceNumbers[2] !== border.unit && pieceNumbers[2] !== "wild") {
      view.displayMessage("It's not the same type");
      return;
    }
    //View
    view.addInfluenceToken(player, location, pieceNumbers, direction);
    this.addToGameLog(
      `Placed Influence Token ${pieceNumbers[2]} ${pieceNumbers[0]}/${
        pieceNumbers[1]
      } between ${auxiliar.getConntectionsText(location).join(" and ")}`,
      player
    );
    model.discardAPiece(player, this.selectedPiece);
    model.grabAPiece(player, 1);
    view.displayPlayerPieces(player);
    //Change Variables
    model.borders[borderId].player = player;
    model.setInfluenceInState(
      player,
      pieceNumbers,
      location.conections,
      direction,
      this.manageClosedState
    );
    this.selectedPiece = null;
  },

  manageClosedState: function (player, index) {
    let howMuchControl = 0;
    const sum = model.checkStateInfluenceSum(index);
    const state = locations[index];
    //Check who won the state
    let playerObj;
    if (sum > 0) {
      playerObj = model.player1;
    } else if (sum < 0) {
      playerObj = model.player2;
    }
    controller.addToGameLog(`State Closed: ${state.name}`, player);
    //decrease control marks if not tie
    if (sum !== 0) {
      howMuchControl++;
      controller.addToGameLog(`${state.name} was won by ${playerObj.name}`);
      if (index === 8) {
        howMuchControl++; //Italy has two control marks
        controller.addToGameLog(
          `The Glory of Rome was won by ${playerObj.name}`
        );
      }
      //Check if adjacent states are also closed
      model.states[index].connections.forEach((i) => {
        if (model.checkIfStateIsClosed(i - 1)) {
          const sum2 = model.checkStateInfluenceSum(i - 1);
          if (sum2 > 0 && player === 1) {
            howMuchControl++;
          } else if (sum2 < 0 && player === 2) {
            howMuchControl++;
          }
          view.displayMessage("Adjacent State Also Closed");
          controller.addToGameLog(
            `One more Control Marker by Adjacent State ${
              locations[i - 1].name
            }`,
            player
          );
        }
      });
      //Alter View
      playerObj.controlMarks -= howMuchControl;
      view.displayControlMarksCounter(player, playerObj.controlMarks);
      view.addControlToken(player, state.location, howMuchControl);
    }

    controller.playBonusToken(player, index);
    controller.manageIfHasWon(player);
  },

  // Interacting with Player
  startPlayer: function () {
    model.grabAPiece(1, 2);
    view.displayPlayerPieces;
  },

  selectAPiece: function (piece) {
    this.selectedPiece = piece[3];
    let text = `${piece[1]}/${piece[0]} ${piece[2]} selected`;
    if (this.selectedDirection) {
      text = `${piece[0]}/${piece[1]} ${piece[2]} selected`;
    }
    view.displayMessage(text);
  },

  changeDirection: function (reset) {
    if (!reset) {
      this.selectedDirection = !this.selectedDirection;
    } else {
      this.selectedDirection = true;
    }
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
      // const state = model.states[index];
      return `${loc.type.toUpperCase()}<br> 
      =================<br> 
       ${loc.name ? loc.name : ""}<br> 
      =================<br> 
    Influence: ${model.checkStateInfluenceSum(index)}<br>
    Closed: ${model.checkIfStateIsClosed(index)}`;
    }
  },

  addToGameLog: function (message, player) {
    let insertText = message;
    if (player) {
      let playerObj = model[`player${player}`];
      insertText = `${playerObj.name}: - ${message}`;
    }
    this.gameLog.unshift(insertText);
    view.displayLog(this.gameLog);
  },
};
