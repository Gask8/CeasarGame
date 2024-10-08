const bonusToken = makeBonusTokenArray();

const model = {
  // ==============Variables================
  states: locations
    .filter((l) => l.id < 18)
    .map((loc, index) => {
      return {
        id: loc.id,
        connections: loc.conections,
        influence: new Array(loc.conections.length),
        bonusToken: bonusToken[index],
        player: null,
      };
    }),
  borders: locations
    .filter((l) => l.id >= 100)
    .map((loc) => {
      return {
        id: loc.id,
        connections: loc.conections,
        player: null,
        unit: loc.unit,
      };
    }),

  player1: {
    id: 1,
    name: "Ceasar",
    pieces: gamePieces.slice(),
    piecesAtHand: [],
    controlMarks: 12,
    senateBonus: 0,
  },
  player2: {
    id: 2,
    name: "Auto Poompei",
    pieces: gamePieces.slice(),
    piecesAtHand: [],
    controlMarks: 12,
    senateBonus: 0,
  },

  // ==============Game Actions================
  setInfluenceInState: function (
    player,
    numbers,
    connections,
    direction,
    callback
  ) {
    let d = [0, 1];

    if (!direction) {
      d = [1, 0];
    }

    d.forEach((v, i) => {
      const index = connections[v];
      const otherIndex = v === 0 ? connections[1] : connections[0];
      model.states[index].influence[
        model.states[index].connections.findIndex(
          (e) => e === model.states[otherIndex].id
        )
      ] = numbers[i] * (-1) ** (player - 1);
      //Check if the state is closed and Act accordingly
      if (model.checkIfStateIsClosed(index)) {
        callback(player, index);
      }
    });
  },

  nullifyInfluenceInStates: function (borderIndex) {
    const connections = model.borders[borderIndex].connections;
    const index = connections[0];
    const otherIndex = connections[1];
    model.states[index].influence[
      model.states[index].connections.findIndex(
        (e) => e === model.states[otherIndex].id
      )
    ] = 0;
    model.states[otherIndex].influence[
      model.states[otherIndex].connections.findIndex(
        (e) => e === model.states[index].id
      )
    ] = 0;
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

  // ==============Game Processing================
  checkStateInfluenceSum: function (index) {
    const state = model.states[index];
    const sum = state.influence.reduce((acc, cur) => acc + cur, 0);
    return sum;
  },
  checkIfStateIsClosed: function (index) {
    const state = model.states[index];
    for (let i = 0; i < state.influence.length; i++) {
      if (state.influence[i] === undefined) return false;
    }
    return true;
  },
  changeStateToClosed: function (player, index) {
    model.states[index].closed = player;
  },
};

//Other functions
function makeBonusTokenArray(n, conditions) {
  // 17 is the number of states less Italy
  const arr = fillArrayWithConditionsNumbers(17, [
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 5],
  ]);
  //8 is the index of Italy where there is always a 4 bonus token
  return [...arr.slice(0, 8), 4, ...arr.slice(8)];
}
