//const AutoPlay

const autoPlay = {
  selectAPieceIfPosible: function (pieces, border, condition) {
    const posiblePieces = pieces.filter(
      (p) => p[2] === border.unit || p[2] === "wild"
    );

    if (posiblePieces.length === 0) {
      return false;
    }

    let piece = null;
    if (condition === "lowest") {
      controller.changeDirection(true);
      let lowestNumber = 6;
      for (let i = 0; i < posiblePieces.length; i++) {
        if (posiblePieces[i][0] < lowestNumber) {
          lowestNumber = posiblePieces[i][0];
          piece = posiblePieces[i];
        }
      }
    } else if (condition === "highest") {
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
    let borderId = null;
    const pieces = model.player2.piecesAtHand;

    //Check if one state is almost closed
    const almostClosedStates = auxiliar.checkWhichStatesAreAlmostClosed();
    if (almostClosedStates.length > 0) {
      //Choice #1: Can he control a state?
      for (let i = 0; i < almostClosedStates.length; i++) {
        const state = almostClosedStates[i];
        const sum = model.checkStateInfluenceSum(state.id - 1);
        if (sum < 0) {
          const findIndex = auxiliar.getLastBorderIndex(state);
          const border = auxiliar.getBorderByStateConnections(state, findIndex);
          if (this.selectAPieceIfPosible(pieces, border, "lowest")) {
            return border.id - 101;
          }
        }
      }
      //Choice #2: Can he close a state?
      for (let i = 0; i < almostClosedStates.length; i++) {
        const state = almostClosedStates[i];
        const sum = model.checkStateInfluenceSum(state.id - 1);
        if (sum > 0) {
          const findIndex = auxiliar.getLastBorderIndex(state);
          const border = auxiliar.getBorderByStateConnections(state, findIndex);
          if (this.selectAPieceIfPosible(pieces, border, "highest")) {
            // Check if the can win State with highest piece
            if (sum - gamePieces[controller.selectedPiece][1] <= 0) {
              // Else just close the state with lowest piece
              this.selectAPieceIfPosible(pieces, border, "lowest");
            }
            console.log(gamePieces[controller.selectedPiece][1]);
            return border.id - 101;
          }
        }
      }
    }

    // const availableBorders = model.borders.filter((b) => !b.player);
    const availableStates = model.states.filter((s) => s.player === null);
    let highestInfluence = 0;
    let highestInfluenceState = null;
    //Choice #3: Is he losing a unclaimed state?
    for (let i = 0; i < availableStates.length; i++) {
      const state = availableStates[i];
      const sum = model.checkStateInfluenceSum(state.id - 1);
      if (sum > highestInfluence) {
        highestInfluence = sum;
        highestInfluenceState = state;
      }
    }

    // almostClosedStates.forEach((state) => {
    //   const findIndex = auxiliar.getLastBorderIndex(state);
    //   const border = auxiliar.getBorderByStateConnections(state, findIndex);
    //   const piece = pieces.find((p) => p[2] === border.unit);
    //   if (piece) {
    //     this.selectAPiece(piece);
    //     borderId = border.id - 101;
    //     return piece;
    //   }
    // });

    return borderId;
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
    return possibleBorders[randomBorder].id - 101;
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

  getBorderByStateConnections: function (state, borderID) {
    const valuesToCheck = [state.id, state.connections[borderID]];
    console.log(valuesToCheck);
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
