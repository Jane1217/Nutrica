export const puzzleCategories = [
  {
    id: 'magic_garden',
    title: 'Magic Garden',
    desc: 'Complete daily nutrition challenge and collect 6 nutrition puzzles in the Magic Garden. Little by little, your garden is coming alive. Keep tending to it with care.',
    count: 6,
    pieces: [1, 1, 1, 0, 0, 0], // 1:已获得, 0:未获得
    puzzles: [
      {
        id: 'carrot',
        name: 'Carrot',
        description: "Bright, balanced, and well-fed. That’s the carrot energy we love to see.",
        img: '/assets/puzzles/puzzle_carrot.svg',
        inCollection: true,
        bgColor: '#FFB279'
      },
      // 其他puzzle...
    ]
  },
  // 其他分类...
]; 