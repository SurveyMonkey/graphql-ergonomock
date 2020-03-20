import seedrandom from "seedrandom";

export default {
  seed: () => {},

  integer: (max: number = 100, min: number = 1) => {},
  float: (max: number = 100, min: number = 1) => {},
  list: (maxLength: number = 4, minLength: number = 1) => {},
  words: (numWords: number = 3) => {},
  boolean: () => {}
};
