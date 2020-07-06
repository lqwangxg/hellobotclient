export default [
  {
    type: "system",
    id: 13,
    data: {
      text: "You have been transferred to another operator",
      meta: "04-07-2018 15:57",
    },
  },
  {
    type: "file",
    author: `support`,
    id: 14,
    data: {
      text: `No forget the story. `,
      file: {
        name: "awesome",
        url: "https://github.com/lqwangxg/resources/blob/master/gif/happy.gif?raw=true",
      },
      meta: "✓✓ Read",
    },
  },
  { type: "emoji", author: `me`, id: 17, data: { emoji: `😋` } },
  {
    type: "text",
    author: `me`,
    id: 19,
    data: { text: `...or not?`, meta: "✓ Delivered" },
  },
  {
    type: "system",
    id: 20,
    data: { text: "User changed security key", meta: "04-08-2018 15:57" },
  }
];
