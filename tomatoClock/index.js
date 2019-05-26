function main() {
  new Vue({
    el: '#app',
    data() {
      return {
        persons: [
          { name: 'Jack', sport: 10, rest: 2 },
          { name: 'Mick', sport: 20, rest: 5 },
          { name: 'Emma' , sport: 30, rest: 8 },
          { name: 'Saige', sport: 25, rest: 15 },
        ].map(item => {
          return {
            ...item,
            sportTime: item.sport * 60,
            restTime: item.rest * 60,
            allTimes: item.sport * 60,
            point: 0,
            state: 1,
            percentage: 100,
            color: '#15d815',
            stop: false
          }
        })
      }
    },
    mounted() {
      setInterval(() => {
        this.persons.forEach(item => this.update(item));
      }, 1000);
    },
    methods: {
      getColor(item) {
        let max = {
          r: '15',
          g: 'd8',
          b: '15'
        };
        let min = {
          r: 'ff',
          g: '00',
          b: '00'
        };
        let r, g, b;
        if (item.state) {
          r = (parseInt(max.r, 16) - parseInt(min.r, 16)) * (item.percentage / 100) + parseInt(min.r, 16);
          g = (parseInt(max.g, 16) - parseInt(min.g, 16)) * (item.percentage / 100) + parseInt(min.g, 16);
          b = (parseInt(max.b, 16) - parseInt(min.b, 16)) * (item.percentage / 100) + parseInt(min.b, 16);
        } else {
          r = (parseInt(min.r, 16) - parseInt(max.r, 16)) * ((100 - item.percentage) / 100) + parseInt(max.r, 16);
          g = (parseInt(min.g, 16) - parseInt(max.g, 16)) * ((100 - item.percentage) / 100) + parseInt(max.g, 16);
          b = (parseInt(min.b, 16) - parseInt(max.b, 16)) * ((100 - item.percentage) / 100) + parseInt(max.b, 16);
        }
        return `rgba(${r}, ${g}, ${b})`;
      },
      update(item) {
        if (item.stop) return;
        item.point++;
        if (item.state && item.point == item.sportTime) {
          item.state = !item.state;
          item.point = 0;
          item.allTimes = item.restTime;
        }
        if (!item.state && item.point == item.restTime) {
          item.state = !item.state;
          item.point = 0;
          item.allTimes = item.sportTime;
        }
        if (item.state) {
          item.percentage = (item.allTimes - item.point) / item.allTimes * 100;
        } else {
          item.percentage = item.point / item.allTimes * 100;
        }
        item.color = this.getColor(item);
      },
      stop(item) {
        item.stop = !item.stop;
        if (item.stop) {
          item.lastState = {
            state: item.state,
            time: item.state ? item.sport : item.rest,
          }
        } else {
          let time = item.state ? item.sport : item.rest;
          if (time != item.lastState.time) {
            item.point = 0;
            item.allTimes = time * 60;
          }
        }
      },
      change(item, type, number) {
        if (!item.stop) return;
        if (number < 0) {
          if (type == 'break') {
            if (item.rest + number < 1) return;
            item.rest += number;
          } else {
            if (item.sport + number < 1) return;
            item.sport += number;
          }
        } else {
          if (type == 'break') {
            item.rest += number;
          } else {
            item.sport += number;
          }
        }
        if ((number < 0) && (item.rest == 1 || item.sport == 1)) return;
      }
    },
    template: `
      <div class="app">
        <div class="app-header">
          Gym Clock
        </div>
        <div class="app-content">
          <div class="app-content-person" v-for="item in persons">
            <div class="app-content-person-top">
              <div class="app-content-person-top-name">
                {{item.name}}
              </div>
              <div class="app-content-person-top-clock">
                <div ref="progress"
                  class="app-content-person-top-clock-progress"
                  :data-name="item.name"
                  :style="{
                    width: item.percentage + '%',
                    'background-color': item.color
                  }"
                  @click="stop(item)">
                  <span>{{item.stop ? '暂停' : '播放'}}</span>
                </div>
              </div>
              <div class="app-content-person-top-time">
                <timer :item="item"></timer>
              </div>
            </div>
            <div class="app-content-person-config">
              <div class="app-content-person-config-label">
                setup
              </div>
              <div class="app-content-person-config-content">
                <span>
                  session:
                  <span>
                    <i class="fa fa-plus-circle" @click="change(item, 'session', 1)"></i>
                    <span class="app-content-person-config-content-word">
                      {{item.sport}}
                    </span>
                    <i class="fa fa-minus-circle" @click="change(item, 'session', -1)"></i>
                  </span>
                </span>
                <span>
                  break:
                  <span>
                    <i class="fa fa-plus-circle" @click="change(item, 'break', 1)"></i>
                    <span class="app-content-person-config-content-word">
                      {{item.rest}}
                    </span>
                    <i class="fa fa-minus-circle" @click="change(item, 'break', -1)"></i>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    components: {
      timer: {
        props: ['item'],
        computed: {
          clock() {
            let minutes = '0' + Math.floor((this.item.allTimes - this.item.point) / 60).toString();
            minutes = minutes.slice(minutes.length - 2);
            let seconds = '0' + ((this.item.allTimes - this.item.point) % 60).toString();
            seconds = seconds.slice(seconds.length - 2);
            return `${minutes} : ${seconds}`;
          }
        },
        template: `
          <div class="timer">
            <div class="timer-board">
              {{clock}}
            </div>
          </div>
        `
      }
    }
  });
}
main();