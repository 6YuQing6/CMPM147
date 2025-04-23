const tiles = {
  lightpinkdungeon: {
    wall: () => ({ ti: floor(random(1, 5)), tj: 21 }),
    brokenfloor: () => ({
      ti: floor(random(1, 5)),
      tj: 22,
    }),
    solidfloor: {
      ti: 0,
      tj: 23,
    },
    solidlightfloor: {
      ti: 0,
      tj: 21,
    },
  },
  darkpurpledungeon: {
    wall: () => ({ ti: floor(random(21, 25)), tj: 21 }),
    brokenfloor: () => ({
      ti: floor(random(21, 25)),
      tj: 22,
    }),
    solidfloor: {
      ti: 20,
      tj: 23,
    },
    solidlightfloor: {
      ti: 20,
      tj: 21,
    },
    door: () => ({
      ti: floor(random(25, 28)),
      tj: floor(random(25, 28)),
    }),
  },
  purpledungeon: {
    brokenfloor: () => ({
      ti: floor(random(11, 15)),
      tj: 22,
    }),
    solidfloor: {
      ti: 10,
      tj: 21,
    },
  },
  treasurechest: () => ({
    ti: floor(random(0, 3)),
    tj: floor(random(28, 31)),
  }),
  chests: {
    wood: {
      open: { ti: 0, tj: 28 },
      closed: { ti: 3, tj: 28 },
    },
    silver: {
      open: { ti: 1, tj: 28 },
      closed: { ti: 4, tj: 28 },
    },
    gold: {
      open: { ti: 2, tj: 28 },
      closed: { ti: 5, tj: 28 },
    },
  },
  emptyspace: { ti: 5, tj: 10 },
  purpledirt: {
    defaultlight: () => ({ ti: floor(random(4)), tj: 16 }),
    defaultdark: () => ({ ti: floor(random(4)), tj: 16 }),
    flat: {
      rightedge: { ti: 4, tj: 10 },
      leftedge: { ti: 6, tj: 10 },
      bottomedge: { ti: 5, tj: 9 },
      topedge: { ti: 5, tj: 11 },
      bottomleftcorner: { ti: 4, tj: 11 },
      bottomrightcorner: { ti: 6, tj: 11 },
      toprightcorner: { ti: 6, tj: 9 },
      topleftcorner: { ti: 4, tj: 9 },
    },
    tall: {
      rightedge: { ti: 9, tj: 10 },
      leftedge: { ti: 11, tj: 10 },
      bottomedge: { ti: 10, tj: 9 },
      topedge: { ti: 10, tj: 11 },
      bottomleftcorner: { ti: 9, tj: 11 },
      bottomrightcorner: { ti: 11, tj: 11 },
      toprightcorner: { ti: 11, tj: 9 },
      topleftcorner: { ti: 9, tj: 9 },
    },
  },
};

const tileMap = {
  _: {
    getTile(bit) {
      const lookup = {
        // empty space for corners
        3: tiles.emptyspace,
        6: tiles.emptyspace,
        9: tiles.emptyspace,
        12: tiles.emptyspace,
        // edges
        7: tiles.purpledirt.tall.leftedge,
        11: tiles.purpledirt.tall.bottomedge,
        13: tiles.purpledirt.tall.rightedge,
        14: tiles.purpledirt.flat.topedge,
        // // corners
        223: tiles.purpledirt.tall.bottomleftcorner,
        239: tiles.purpledirt.tall.bottomrightcorner,
        127: tiles.purpledirt.tall.toprightcorner,
        191: tiles.purpledirt.tall.topleftcorner,
      };
      return lookup[bit] ?? tiles.purpledirt.defaultlight();
    },
  },
  ".": {
    getTile(bit) {
      const lookup = {};
      if (lookup[bit]) {
        return lookup[bit];
      } else {
        if (random() < 0.8) {
          return tiles.darkpurpledungeon.solidfloor;
        } else {
          return tiles.darkpurpledungeon.brokenfloor();
        }
      }
    },
  },
  "#": {
    getTile(bit) {
      if (random() < 0.15) {
        return tiles.darkpurpledungeon.door();
      } else {
        return tiles.darkpurpledungeon.wall();
      }
      // return { ti: floor(floor(random(21, 25))), tj: floor(random(11, 15)) };
    },
  },
  C: {
    getTile(bit) {
      return tiles.treasurechest();
    },
  },
};
