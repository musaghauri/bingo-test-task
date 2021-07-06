const generateArray = (n) => [...Array(n + 1).keys()].slice(1)
const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

export {
  generateArray,
  shuffleArray
}
