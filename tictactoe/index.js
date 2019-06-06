function main() {
  new Vue({
    el: '#app',
    data() {
      return {
        chessboard: [],
        size: {
          x: 3,
          y: 3
        },
        gamer: {
          o: {
            target: 'o', class: 'fa-circle-o'
          },
          x: {
            target: 'x', class: 'fa-close'
          },
        },
        turn: '',
        gameStart: false
      }
    },
    mounted () {
      this.beginGame();
    },
    computed: {
      rulesArray() {
        return [
          ...this.chessboard,
          ...this.chessboard[0].map((item, index) => {
            return this.chessboard.map(row => {
              return row[index];
            });
          }),
          this.chessboard.map((row, index) => {
            return row[index];
          }),
          this.chessboard.map((row, index) => {
            return row[row.length - 1 - index];
          }),
        ];
      }
    },
    methods: {
      beginGame() {
        this.chessboard = this.getChessboard(this.size);
        setTimeout(() => {
          this.$confirm('o or x?', '选择棋子', {
            confirmButtonText: 'o',
            cancelButtonText: 'x',
            type: 'info',
            closeOnClickModal: false,
            closeOnPressEscape: false,
            showClose: false
          }).then(() => {
            this.turn = 'o';
          }).catch(() => {
            this.turn = 'x';
          }).finally(() => {
            this.gameStart = true;
            let opponent = this.gamer[this.turn === 'x' ? 'o' : 'x'];
            this.chessboard[1][1].target = opponent.target;
            this.chessboard[1][1].class = opponent.class;
          });
        }, 1000);
      },
      getChessboard({x, y}) {
        let array_w = new Array(x).fill(null).map(() => ({class: '', target: '', state: ''}));
        return new Array(y).fill(null).map(() => JSON.parse(JSON.stringify(array_w)));
      },
      checkTurn(item) {
        if (item.class || !this.gameStart) return;
        this.checkItem(item);
        if (this.gameStart) {
          let emptyItem = this.getEmptyItem();
          this.turn === 'x' ? this.checkItem(emptyItem, 'o') : this.checkItem(emptyItem, 'x');
        }
      },
      getEmptyItem() {
        let emptyArray = this.chessboard.reduce((emptys, group) => {
          emptys = emptys.concat(group.filter(item => !item.class));
          return emptys;
        }, []);
        if (emptyArray.length == 0) {
          return;
        }
        let randomNumber = Math.floor(Math.random() * emptyArray.length);
        return emptyArray[randomNumber];
      },
      getWinner() {
        let winnerGroup = this.rulesArray.find(group => {
          return group[0].target && group.every((item, index, arr) => item.target === arr[0].target)
        });
        if (winnerGroup) {
          return winnerGroup;
        }
      },
      timeInterval() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, 300);
        })
      },
      async winnerAnimation(winnerGroup) {
        let times = 3;
        let winner = winnerGroup[0].target;
        let state = winner === this.turn ? 'win' : 'lose';
        while(times) {
          await this.timeInterval();
          winnerGroup.forEach(item => {
            this.$set(item, 'state', state);
          })
          await this.timeInterval();
          winnerGroup.forEach(item => {
            this.$set(item, 'state', '');
          })
          times--;
        }
      },
      async gameOver(msg, winnerGroup) {
        this.gameStart = false;
        if (winnerGroup) await this.winnerAnimation(winnerGroup);
        this.$alert(msg, '游戏结束', {
          confirmButtonText: '重新开始',
          callback: () => {
            this.beginGame();
          }
        });
      },
      checkItem(item, turn = this.turn) {
        item.class = this.gamer[turn].class;
        item.target = this.gamer[turn].target;
        let winnerGroup = this.getWinner();
        if (winnerGroup) {
          let win = winnerGroup[0].target === this.turn;
          this.gameOver(win ? '你赢了' : '你输了', winnerGroup);
        } else {
          let emptyItem = this.getEmptyItem();
          if (!emptyItem) {
            this.gameOver('平局');
          }
        }
      }
    },
    template: `
      <div class="app">
        <div class="app-header">
          tictactoe
        </div>
        <div class="app-content">
          <div class="app-content-board">
            <div class="app-content-board-group" v-for="group in chessboard">
              <div :class="['app-content-board-group-item', item.state, {'empty': !item.target}]" v-for="item in group" @click="checkTurn(item)">
                <span>
                  <i :class="['fa', item.class]"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  });
}
main();