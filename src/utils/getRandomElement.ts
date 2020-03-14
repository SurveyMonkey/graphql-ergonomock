export default function getRandomElement(ary: ReadonlyArray<any>) {
  const sample = Math.floor(Math.random() * ary.length);
  return ary[sample];
}
