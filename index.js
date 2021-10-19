const directionKeys = {
  up: 38,
  down: 40,
  left: 37,
  right: 39,
};
const MAX_X = 500;
const MAX_Y = 500;
const directionKeyMap = [38, 40, 37, 39];
const defaultUnit = 10;

function isLevel(direction) {
  return direction === directionKeys.right || direction === directionKeys.left;
}

function updatePos(pos, direction) {
  const newPos = { ...pos };
  switch (direction) {
    case directionKeys.up:
      newPos.y -= defaultUnit;
      break;
    case directionKeys.down:
      newPos.y += defaultUnit;
      break;
    case directionKeys.left:
      newPos.x -= defaultUnit;
      break;
    case directionKeys.right:
      newPos.x += defaultUnit;
      break;
  }
  return newPos;
}

function isRepeat(list, pos) {
  return list.some(({ pos: itemPos }) => pos.x === itemPos.x && pos.y === itemPos.y);
}

function isCrossedLine(x, y) {
  return x >= MAX_X || x < 0 || y >= MAX_X || y < 0;
}

new Vue({
  el: '#app',
  data: {
    initData: { x: 250, y: 250 },
    snakeBodyList: [],
    direction: undefined,
    lastPos: {},
    footPos: {},
    isLose: false,
    headerPos: {},
    isPlaying: false,
    speed: 200,
    id: 0,
  },
  computed: {
    count() {
      const count = (this.snakeBodyList.length - 10) * 100 * (this.speed / 200);
      return Math.max(count, 0);
    },
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown);
  },
  methods: {
    init() {
      this.direction = directionKeys.left;
      this.lastPos = { ...this.initData, direction: this.direction };
      this.headerPos = { ...this.initData };
      this.snakeBodyList = Array(10).fill(0).map(this.createBody);
    },
    createBody() {
      const { x, y } = this.lastPos;
      // 判断是否属于需要 -2 的同类型
      const isLower = this.direction === directionKeys.up || this.direction === directionKeys.left;
      const pos = {
        ...updatePos({ x, y }, isLower ? this.direction + 2 : this.direction - 2),
      };
      this.lastPos = { ...pos };
      return {
        uuid: this.id++,
        pos,
      };
    },
    genFoot() {
      const x = 10 + (((Math.random() * (MAX_X - 10)) / 10) >>> 0) * 10;
      const y = 10 + (((Math.random() * (MAX_X - 10)) / 10) >>> 0) * 10;
      if (isRepeat(this.snakeBodyList, { x, y }) || isCrossedLine(x, y)) {
        this.genFoot();
      } else {
        this.footPos = { x, y };
      }
    },
    onKeydown({ keyCode }) {
      if (this._moveLock) {
        return;
      }
      if (!directionKeyMap.includes(keyCode) || isLevel(keyCode) === isLevel(this.direction)) {
        return;
      }
      this.direction = keyCode;
      this._moveLock = true;
    },
    render() {
      let lastPos = { ...this.headerPos };
      const snakeBodyList = this.snakeBodyList.slice(0);
      for (const body of snakeBodyList) {
        const nextPos = { ...body.pos };
        body.pos = lastPos;
        lastPos = { ...nextPos };
      }
      this.headerPos = { ...updatePos(this.headerPos, this.direction), direction: this.direction };
      this.lastPos = snakeBodyList[snakeBodyList.length - 1].pos;
      if (isRepeat(snakeBodyList, this.footPos)) {
        snakeBodyList.push(this.createBody());
        this.genFoot();
      }
      this.snakeBodyList = snakeBodyList;
      if (isCrossedLine(this.headerPos.x, this.headerPos.y) || isRepeat(snakeBodyList, this.headerPos)) {
        this.isLose = true;
        this.isPlaying = false;
        clearTimeout(this._timer);
        return alert('你输了');
      }
      this._moveLock = false;
      this._timer = setTimeout(() => this.render(), this.speed);
    },
    playGame() {
      if (this.isPlaying) {
        clearTimeout(this._timer);
      } else {
        this.isLose = false;
        this.init();
        this.genFoot();
        this.render();
      }
      this.isPlaying = !this.isPlaying;
    },
  },
});
