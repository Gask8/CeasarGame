//1 Grab 2, Resolve, Discard
//2 Grab 1, Resolve
const easyMovements = [1, 1, 1, 1, 2, 2];

//AutoPlay
const autoPlay = {
  movements: easyMovements.slice(),

  selectAMovement: function () {
    if (this.movements.length === 0) {
      this.movements = easyMovements.slice();
    }
    const randomInt = Math.floor(Math.random() * this.movements.length);
    let movement = this.movements[randomInt];
    this.movements.splice(randomInt, 1);
    return movement;
  },

  selectAPieceIfPosible: function (pieces, border, condition) {
    const posiblePieces = pieces.filter(
      (p) => p[2] === border.unit || p[2] === "wild"
    );

    if (posiblePieces.length === 0) {
      return false;
    }

    let piece = null;
    if (condition === "highest") {
      controller.changeDirection(true);
      let lowestNumber = 6;
      for (let i = 0; i < posiblePieces.length; i++) {
        if (posiblePieces[i][0] < lowestNumber) {
          lowestNumber = posiblePieces[i][0];
          piece = posiblePieces[i];
        }
      }
    } else if (condition === "lowest") {
      controller.changeDirection();
      let highestNumber = 0;
      for (let i = 0; i < posiblePieces.length; i++) {
        if (posiblePieces[i][1] > highestNumber) {
          highestNumber = posiblePieces[i][1];
          piece = posiblePieces[i];
        }
      }
    }

    controller.selectAPiece(piece);
    return true;
  },

  botAutoDecision: function () {
    const pieces = model.player2.piecesAtHand;
    //Check if one state is almost closed
    const almostClosedStates = auxiliar.checkWhichStatesAreAlmostClosed();
    if (almostClosedStates.length > 0) {
      //Choice #1: Can he control a state?
      for (let i = 0; i < almostClosedStates.length; i++) {
        const state = almostClosedStates[i];
        const sum = model.checkStateInfluenceSum(state.id);
        if (sum < 0) {
          const findIndex = auxiliar.getLastBorderIndex(state);
          const border = auxiliar.getBorderByStateConnections(state, findIndex);
          if (this.selectAPieceIfPosible(pieces, border, "lowest")) {
            console.log("Choice #1");
            return border.id - 100;
          }
        }
      }
      //Choice #2: Can he close a state?
      for (let i = 0; i < almostClosedStates.length; i++) {
        const state = almostClosedStates[i];
        const sum = model.checkStateInfluenceSum(state.id);
        if (sum > 0) {
          const findIndex = auxiliar.getLastBorderIndex(state);
          const border = auxiliar.getBorderByStateConnections(state, findIndex);
          if (this.selectAPieceIfPosible(pieces, border, "highest")) {
            // Check if the can win State with highest piece
            if (sum - gamePieces[controller.selectedPiece][0] <= 0) {
              // Else just close the state with lowest piece
              this.selectAPieceIfPosible(pieces, border, "lowest");
            }
            console.log(gamePieces[controller.selectedPiece][1]);
            console.log("Choice #2");
            return border.id - 100;
          }
        }
      }
    }

    // const availableBorders = model.borders.filter((b) => !b.player);
    const availableStates = model.states.filter((s) => s.player === null);
    //Choice #3: Is he losing a unclaimed state?
    let highestInfluence = 0;
    let highestInfluenceState = null;
    for (let i = 0; i < availableStates.length; i++) {
      const state = availableStates[i];
      const sum = model.checkStateInfluenceSum(state.id);
      if (sum > highestInfluence) {
        highestInfluence = sum;
        highestInfluenceState = state;
      }
    }
    if (highestInfluence > 0) {
      const stateBorders = highestInfluenceState.connections.map((v) => {
        const border = auxiliar.foundBorderBetweenStates(
          highestInfluenceState,
          model.states[v]
        );
        if (border.player === null) {
          return border;
        }
      });
      const availableBorders = stateBorders.filter((b) => b !== undefined);
      for (let i = 0; i < availableBorders.length; i++) {
        const border = availableBorders[i];
        if (this.selectAPieceIfPosible(pieces, border, "highest")) {
          console.log("Choice #3");
          return border.id - 100;
        }
      }
    }

    //Choice #4: Is he present in any province?
    //Choice #5: Pick a state adjacent to one they already control

    //Choice #6: Pick a central state (Italia, Sardinia, Sicilia, Achaia, Creta)
    const centralStates = [8, 4, 7, 11, 14];
    for (let i = 0; i < centralStates.length; i++) {
      const state = model.states[centralStates[i]];
      const stateBorders = state.connections.map((v) => {
        const border = auxiliar.foundBorderBetweenStates(
          state,
          model.states[v]
        );
        if (border.player === null) {
          return border;
        }
      });
      const availableBorders = stateBorders.filter((b) => b !== undefined);
      for (let i = 0; i < availableBorders.length; i++) {
        const border = availableBorders[i];
        if (this.selectAPieceIfPosible(pieces, border, "highest")) {
          console.log("Choice #6");
          return border.id - 100;
        }
      }
    }

    //Choice #7: Random Choice
    console.log("Choice #7");
    return this.botRandomDecision();
  },

  // botTieBreakerBorder: function (state) {
  //   const availableStates = state.connections.filter(
  //     (v) => model.states[v].player === null
  //   );

  //   // #1 Tie Breaker: State is losing the most
  //   let highestInfluence = 0;
  //   let border1 = null;
  //   for (let i = 0; i < availableStates.length; i++) {
  //     const state2 = availableStates[i];
  //     const sum = model.checkStateInfluenceSum(state2);
  //     if (highestInfluence > sum) {
  //       highestInfluence = sum;
  //       border1 = auxiliar.foundBorderBetweenStates(state, state2);
  //     }
  //   }
  //   if (border1) return border1;

  //   // #2 Tie Breaker: Central States (Italia, Sardinia, Sicilia, Achaia, Creta)
  //   const centralStates = [8, 4, 7, 11, 14];
  //   let border2 = null;
  //   for (let i = 0; i < availableStates.length; i++) {
  //     const state2 = availableStates[i];
  //     if (centralStates.includes(state2.id)) {
  //       highestInfluence = sum;
  //       border2 = auxiliar.foundBorderBetweenStates(state, state2);
  //     }
  //   }
  //   if (border2) return border2;

  //   // #3 Tie Breaker: Random Choice
  //   // return bestBorder;

  //   // #1 Tie Breaker: States adjencent to ones they have already won
  //   // #2 Tie Breaker: States with Senate Token
  //   // #3 Tie Breaker: Central States (Sardinia, Italia, Sicilia, Achaia, Creta)
  //   // #4 Tie Breaker: Random Choice
  // },

  botReturnLeftPiece: function () {
    //Most Left piece is return to the deck
    model.player2.pieces.push(model.player2.piecesAtHand[0]);
    model.player2.piecesAtHand.splice(0, 1);
  },

  botRandomDecision: function () {
    //Pick at random a border
    const availableBorders = model.borders.filter((b) => !b.player);
    const piece = model.player2.piecesAtHand[0];
    controller.selectAPiece(piece);
    let possibleBorders = [];
    if (piece[2] === "wild") {
      possibleBorders = availableBorders;
    } else {
      possibleBorders = availableBorders.filter((b) => b.unit === piece[2]);
    }
    const randomBorder = Math.floor(Math.random() * possibleBorders.length);
    return possibleBorders[randomBorder].id - 100;
  },
};

//Functions that are used for this project
const auxiliar = {
  checkIfItIsPosibleToPlacePiece: function (player) {
    const posibleBorders = model.borders.filter((b) => b.player === null);
    const pieces = model[`player${player}`].piecesAtHand;

    for (let i = 0; i < posibleBorders.length; i++) {
      const border = posibleBorders[i];
      const posiblePieces = pieces.filter(
        (p) => p[2] === border.unit || p[2] === "wild"
      );
      if (posiblePieces.length > 0) {
        return true;
      }
    }
    return false;
  },

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

  foundBorderBetweenStates: function (state1, state2) {
    return model.borders.find(
      (b) =>
        b.connections.includes(state1.id) && b.connections.includes(state2.id)
    );
  },

  getBorderByStateConnections: function (state, borderID) {
    // const valuesToCheck = [state.id, state.connections[borderID]];
    const result = model.borders.filter(
      (border) =>
        border.connections.includes(state.id) &&
        border.connections.includes(state.connections[borderID])
    );
    return result[0];
  },

  getLastBorderIndex: function (state) {
    return state.influence.findIndex((c) => c === undefined);
  },

  checkWhichStatesAreAlmostClosed: function () {
    const almostClosedStates = model.states.filter((s) => {
      let influenceCount = 0;
      for (let i = 0; i < s.influence.length; i++) {
        if (s.influence[i] !== undefined) {
          influenceCount++;
        }
      }
      return influenceCount === s.connections.length - 1;
    });
    return almostClosedStates;
  },
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//General use functions
function fillArrayWithConditionsNumbers(n, conditions) {
  let pos = createArrayFromDuples(conditions);
  const arr = [];
  for (let i = 0; i < n; i++) {
    const randomInt = Math.floor(Math.random() * pos.length);
    arr.push(pos[randomInt]);
    pos.splice(randomInt, 1);
  }
  return arr;
  function createArrayFromDuples(duples) {
    const resultArray = [];
    duples.forEach(([number, count]) => {
      for (let i = 0; i < count; i++) {
        resultArray.push(number);
      }
    });
    return resultArray;
  }
}

function fillArrayWithRandomNumbers(x, y, n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const randomInt = Math.floor(Math.random() * (y - x + 1)) + x;
    arr.push(randomInt);
  }
  return arr;
}
