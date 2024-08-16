//Functions that are used for this project
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
