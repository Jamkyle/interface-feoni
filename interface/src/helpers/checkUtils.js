const categories = ["AN", "TS"];

export const isACantique = (num) => {
  const id = parseInt(num, 10);
  return (id >= 1 && id <= 829) || num.includes(categories);
};
