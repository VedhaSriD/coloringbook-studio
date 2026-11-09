export const DEFAULT_BOOK_CONCEPTS = [
  "Cute baby elephant playing with butterflies.",
  "Happy little lion sitting under a tree.",
  "Baby giraffe eating leaves.",
  "Cute rabbit sitting in a flower garden.",
  "Friendly bear holding a honey pot.",
  "Little fox exploring a forest.",
  "Baby panda eating bamboo.",
  "Cute kitten playing with a ball.",
  "Puppy sitting in a garden.",
  "Happy duck swimming in a pond.",
  "Baby turtle walking near flowers.",
  "Friendly monkey sitting on a tree branch.",
  "Cute hedgehog surrounded by flowers.",
  "Little deer in a peaceful forest.",
  "Baby penguin standing near snowflakes.",
  "Cute owl sitting on a branch.",
  "Happy cow in a simple farm scene.",
  "Little sheep standing on grass.",
  "Baby dinosaur in a friendly prehistoric scene.",
  "Cute whale swimming with bubbles.",
  "Happy dolphin jumping over waves.",
  "Little squirrel holding an acorn.",
  "Cute frog sitting on a lily pad.",
  "Baby koala holding a eucalyptus branch.",
  "Friendly horse in a meadow.",
  "Cute ladybug sitting on a leaf.",
  "Baby chick coming out of an eggshell.",
  "Little snail in a flower garden.",
  "Cute cat sleeping on a cushion.",
  "Group of friendly forest animals together."
];

export const createDefaultPages = () => {
  return DEFAULT_BOOK_CONCEPTS.map((concept, index) => ({
    id: `page-${index + 1}`,
    pageNumber: index + 1,
    concept: concept,
    imageUrl: null,
    status: 'pending' // 'pending' | 'generated' | 'uploaded'
  }));
};