const controller = {
  gameState: 0,
  playerTurn: 2,
  selectedPiece: null,
  selectedDirection: true,
  gameLog: [],
  gameEnd: false,

  startGame: function () {
    this.startGameStateClick();
    this.startShowLocationsWithMouseMovement();
    this.startPlayers();
    this.addAllBonusToken();
    view.displayEnemyPieces();

    view.displayControlMarksCounter(1, 12);
    view.displayControlMarksCounter(2, 12);

    this.addToGameLog("Game Started");
    this.botPlay();
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
        // 0. Influence Token Placement
        case 0:
          if (locationIndex >= 18) {
            controller.placeInfluenceToken(1, locationIndex - 18);
          }
          break;
        // 1. Nullify State
        case 1:
          // Nullify influence in border
          if (locationIndex >= 18) {
            model.nullifyInfluenceInStates(locationIndex - 18);
            view.nullifyInfluenceToken(2, locations[locationIndex]);
            controller.addToGameLog(
              `Nullified Influence between ${auxiliar
                .getConntectionsText(locations[locationIndex])
                .join(" and ")}`,
              1
            );
            //Keep Playing
            //Change Turn And Check If Game End
            controller.gameState = 0;
            controller.endTurn();
          }

          break;
        // 2. Click Information
        case 2:
          locationIndex !== null
            ? view.displayMessage(locations[locationIndex].id)
            : "";
          break;
        default:
          return;
      }
    }
    document.addEventListener("click", checkMousePos);
  },

  manageIfGameEnd: function (player) {
    //Win Condition #1 Control Marks are 0
    if (model.player1.controlMarks <= 0) {
      view.displayMessage(`${model.player1.name} Wins!`);
      this.addToGameLog(
        `<span class=victory>${model.player1.name} Wins!</span>`
      );
      this.gameEnd = true;
    } else if (model.player2.controlMarks <= 0) {
      view.displayMessage(`${model.player2.name} Wins!`);
      this.addToGameLog(
        `<span class=victory>${model.player2.name} Wins!</span>`
      );
      this.gameEnd = true;
    }
    //Win Condition #2 Player can not play any piece
    if (player) {
      const nextPlayer = player === 1 ? 2 : 1;
      if (!auxiliar.checkIfItIsPosibleToPlacePiece(player)) {
        view.displayMessage(`${model["player" + nextPlayer].name} Wins!`);
        this.addToGameLog(
          `${
            model["player" + player].name
          } can't make any action, <span class=victory>${
            model["player" + nextPlayer].name
          } Wins!</span>`
        );
        this.gameEnd = true;
      }
    }
    return;
  },

  playBonusToken: function (player, index) {
    const dic = {
      1: "Extra Turn",
      2: "Extra Piece",
      3: "Destroy Influence",
      4: "Senate Token",
    };
    view.removeBonusToken(index);
    const tokenType = model.states[index].bonusToken;
    this.addToGameLog(
      `Bonus Token: <span class=green>${dic[tokenType]}</span>`,
      player
    );
    // Bot only plays Senate Tokens
    if (tokenType !== 4 && player === 2) {
      return;
    }

    switch (tokenType) {
      case 1:
        //Extra turn
        this.playerTurn = 2;
        break;
      case 2:
        //Extra Piece
        model.grabAPiece(player, 1);
        break;
      case 3:
        //Destroy Influence
        console.log("Destroy Influence");
        view.displayMessage("Select a Border to Destroy Influence");
        this.gameState = 1;
        break;
      default:
        //Senate Token
        model[`player${player}`].senateBonus++;
        controller.addToGameLog(
          `<span class=green>Senate Token</span> acquired. Now ${
            model[`player${player}`].name
          } has ${model[`player${player}`].senateBonus}`,
          player
        );
        model[`player${player}`].controlMarks -=
          model[`player${player}`].senateBonus;
        view.displayControlMarksCounter(
          model[`player${player}`].id,
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
        if (locationIndex >= 18) {
          view.drawDirectionArrows(locations[locationIndex]);
        }
        view.displayInfo(text);
      } else {
        view.displayInfo("");
      }
    }
    document.addEventListener("mousemove", printMousePos);
  },

  //=====================Auto Play=====================

  botPlay: function () {
    if (this.gameEnd) return;
    const dic = ["", "A: Grab 2, Resolve, Discard", "B: Grab 1, Resolve"];
    this.addToGameLog("Auto Play", 2);
    const movement = autoPlay.selectAMovement();
    this.addToGameLog(`Movement: ${dic[movement]}`, 2);
    console.log("movement", movement);
    model.grabAPiece(2, 1);
    if (movement === 1) model.grabAPiece(2, 1);
    let borderId = autoPlay.botAutoDecision(); //a piece is also selected
    // if (borderId === null) borderId = autoPlay.botRandomDecision(); //a piece is also selected
    // let borderId = autoPlay.botRandomDecision();
    console.log("border", borderId);
    this.placeInfluenceToken(2, borderId);
    if (movement === 1) {
      autoPlay.botReturnLeftPiece();
      view.displayEnemyPieces();
    }
  },

  //=====================Using Model=====================

  placeInfluenceToken: function (player, borderId) {
    if (this.gameEnd) {
      return;
    }

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
    //Change Variables
    model.borders[borderId].player = player;
    model.setInfluenceInState(
      player,
      pieceNumbers,
      location.conections,
      direction,
      this.manageClosedState
    );
    model.discardAPiece(player, this.selectedPiece);
    //Finalize Turn
    if (this.playerTurn === 1) model.grabAPiece(player, 1);
    this.selectedPiece = null;
    this.selectedDirection = true;

    if (this.gameState === 0) controller.endTurn();
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
      model.states[index].player = playerObj.id;
      playerObj.controlMarks--;
      howMuchControl++;
      controller.addToGameLog(
        `<span class=victory>${state.name}</span> was won by <span class=log-${playerObj.id}>${playerObj.name}</span`
      );
      if (index === 8) {
        playerObj.controlMarks--;
        howMuchControl++; //Italy has two control marks
        controller.addToGameLog(
          `The <span class=victory>Glory of ROME</span> was won by <span class=log-${playerObj.id}>${playerObj.name}</span>`
        );
      }
      //Check if adjacent states are also closed
      model.states[index].connections.forEach((i) => {
        if (model.checkIfStateIsClosed(i)) {
          if (model.states[i].player === playerObj.id) {
            playerObj.controlMarks--;
            howMuchControl++;
            controller.addToGameLog(
              `One more Control Marker due Adjacent State ${locations[i].name}`,
              playerObj.id.name
            );
          }
        }
      });
      //Alter View
      view.displayControlMarksCounter(playerObj.id, playerObj.controlMarks);
      view.addControlToken(
        playerObj.id,
        bonusLocations[state.id],
        howMuchControl
      );
    }

    controller.manageIfGameEnd();
    controller.playBonusToken(player, index);
  },

  endTurn: function () {
    this.playerTurn = this.playerTurn === 1 ? 2 : 1;
    this.manageIfGameEnd(this.playerTurn);
    //Bot Play
    if (this.playerTurn === 2) this.botPlay();
    // Refresh View
    view.displayPlayerPieces(1);
    view.displayEnemyPieces();
  },

  // Interacting with Player
  startPlayers: function () {
    model.grabAPiece(1, 2);
    model.grabAPiece(2, 3);
    view.displayPlayerPieces(1);
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
      view.addBonusToken(model.states[i].bonusToken, bonusLocations[i], i);
    }
  },

  getLocationHoverMessage: function (index) {
    const loc = locations[index];
    const connections = auxiliar.getConntectionsText(loc);
    if (loc.type === "border") {
      return `${loc.type.toUpperCase()}<br> 
      =================<br> 
      Connecting: <br> ${connections[0]}<br> ${connections[1]} <br>
      =================<br> 
      Type: ${loc.unit.toLocaleUpperCase()}`;
    } else {
      // const state = model.states[index];
      return `${loc.type.toUpperCase()}<br> 
      =================<br> 
       ${loc.name ? loc.name : ""}<br> 
      =================<br> 
    Influence: ${model.checkStateInfluenceSum(index)}<br>
     LEADER: ${
       model.states[index].player ? model.states[index].player : "FREE"
     }`;
    }
  },

  addToGameLog: function (message, player) {
    let insertText = message;
    if (player) {
      let playerObj = model[`player${player}`];
      insertText = `<span class=log-${player}>${playerObj.name}:</span> ${message}`;
    }
    this.gameLog.unshift(insertText);
    view.displayLog(this.gameLog);
  },
};
