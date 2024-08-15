const bonusToken = fillArrayWithConditionsNumbers(17, [
  [1, 4],
  [2, 4],
  [3, 4],
  [4, 5],
]);

const model = {
  states: locations
    .filter((l, index) => index < 18)
    .map((loc, index) => {
      return {
        id: loc.id,
        connections: loc.conections,
        influence: new Array(loc.conections.length),
        bonusToken: bonusToken[index],
        closed: false,
      };
    }),
  borders: locations
    .filter((l, index) => l.id > 100)
    .map((loc) => {
      return {
        id: loc.id,
        connections: loc.conections,
        player: null,
        unit: loc.unit,
      };
    }),

  player1: {
    pieces: gamePieces.slice(),
    piecesAtHand: [],
    bonusToken: [],
  },

  // ==============Game================

  setInfluenceInState: function (player, numbers, connections, directions) {
    let d0 = 0;
    let d1 = 1;

    if (!directions) {
      d0 = 1;
      d1 = 0;
    }

    model.states[connections[d0] - 1].influence[
      model.states[connections[d0] - 1].connections.findIndex(
        (e) => e === model.states[connections[d1] - 1].id
      )
    ] = numbers[d0] * (-1) ** (player - 1);
    model.states[connections[d1] - 1].influence[
      model.states[connections[d1] - 1].connections.findIndex(
        (e) => e === model.states[connections[d0] - 1].id
      )
    ] = numbers[d1] * (-1) ** (player - 1);
  },

  // ==============Pieces================
  grabAPiece: function (player, times) {
    for (let i = 0; i < times; i++) {
      const randomInt = Math.floor(
        Math.random() * model[`player${player}`].pieces.length
      );
      const piece = model[`player${player}`].pieces[randomInt].slice();
      model[`player${player}`].piecesAtHand.push(piece);
      model[`player${player}`].pieces.splice(randomInt, 1);
    }
  },

  discardAPiece: function (player, pieceId) {
    const removePiece = model[`player${player}`].piecesAtHand.findIndex(
      (e) => e[3] === pieceId
    );
    model[`player${player}`].piecesAtHand.splice(removePiece, 1);
  },
};

function fillArrayWithConditionsNumbers(n, conditions) {
  let pos = createArrayFromDuples(conditions);
  const arr = [];

  for (let i = 0; i < n; i++) {
    const randomInt = Math.floor(Math.random() * pos.length);
    arr.push(pos[randomInt]);
    pos.splice(randomInt, 1);
  }

  return [...arr.slice(0, 8), 4, ...arr.slice(8)];

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
