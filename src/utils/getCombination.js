export const getRandom = (arr1, arr2) => {
  const payload = [];
  for (var i = 0; i < 10; i++) {
    const actor = arr1[Math.floor(Math.random() * arr1.length)];
    const genre = arr2[Math.floor(Math.random() * arr2.length)];
    payload.push([actor, genre]);
  }
  return payload;
};
