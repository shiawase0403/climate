
export interface Tip {
  id: number;
  content: string;
}

export const TIPS: Tip[] = [
  { "id": 1, "content": "点点这里，点点那里，探索世界！" },
  { "id": 2, "content": "把地球的呼吸装进你的口袋！" },
  { "id": 3, "content": "Global Climate Explorer！" },
  { "id": 4, "content": "学习柯本气候分类法有助于解题！" },
  { "id": 5, "content": "请不要点得太快呀！" },
  { "id": 6, "content": "这个软件是由一群高中生开发的，他们只花了3天就做出了第一版。" },
  { "id": 7, "content": "请多多支持我们！" },
  { "id": 8, "content": "As？Aw？As/Aw？Aw/As？" },
  { "id": 9, "content": "有的时候Csa可能出现错误，这是算法缺陷导致的。" },
  { "id": 10, "content": "有的时候覆盖层上的类型和实际的类型并不一致。" },
  { "id": 11, "content": "如果你想翻译我们的网站，请告诉我们。" },
  { "id": 12, "content": "在导入比赛时，其实比较模式支持比较六个地点。" },
  { "id": 13, "content": "图形感知也可以帮助你做出题目！" },
  { "id": 14, "content": "或许你喜欢气候寻宝，但单点模式是我们开发的初衷。" },
  { "id": 15, "content": "这个项目曾经只是一个mapresso数据的可视化。" },
  { "id": 16, "content": "你是巨擘。" },
  { "id": 17, "content": "五雷轰顶！" },
  { "id": 18, "content": "你见过这一条tips吗？" },
  { "id": 19, "content": "到底有多少条tips呢？" },
  { "id": 20, "content": "由于赤道低气压带的两次扫过，双峰型降水常常出现在赤道附近。" },
  { "id": 21, "content": "温度并不总取决于太阳直射点！" },
  { "id": 22, "content": "别忘了看数据的极值！" },
  { "id": 23, "content": "别被坐标轴坑了！" },
  { "id": 24, "content": "这是不是GIS系统呢？" }
];

export const getRandomTip = (): string => {
  const randomIndex = Math.floor(Math.random() * TIPS.length);
  return TIPS[randomIndex].content;
};
