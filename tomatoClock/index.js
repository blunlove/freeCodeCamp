function main() {
  new Vue({
    el: '#app',
    data() {
      return {
        persons: [
          {
            name: 'Jack',
            action: [
              {minutes: 12, type: 'session'},
              {minutes: 2, type: 'break'},
            ],
          },
          {
            name: 'Mike',
            action: [
              {minutes: 20, type: 'session'},
              {minutes: 5, type: 'break'},
            ],
          },
          {
            name: 'Emma',
            action: [
              {minutes: 40, type: 'session'},
              {minutes: 15, type: 'break'},
            ],
          },
          {
            name: 'Saige',
            action: [
              {minutes: 25, type: 'session'},
              {minutes: 5, type: 'break'},
            ],
          },
        ].map(item => {
          return {
            ...item,
            action: item.action.map(config => {
              config.seconds = config.minutes * 60;
              return config;
            }),
            point: 0,
            state: 0,
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
      getColor(percentage) {
        percentage = 1 - percentage / 100;
        let max = {
          r: 21,
          g: 216,
          b: 21
        };
        let min = {
          r: 255,
          g: 0,
          b: 0
        };
        let r = this.getNumber(max.r, min.r, percentage);
        let g = this.getNumber(max.g, min.g, percentage);
        let b = this.getNumber(max.b, min.b, percentage);
        return `rgba(${r}, ${g}, ${b})`;
      },
      getNumber(start, end, percentage) {
        let temp = start - end;
        return start - temp * percentage;
      },
      update(item) {
        if (item.stop) return;
        item.point++;
        if (item.point == item.action[item.state].seconds) {
          item.state = (item.state + 1) % 2;
          item.point = 0;
        }
        let allTimes = item.action[item.state].seconds;
        if (item.state) {
          item.percentage = item.point / allTimes * 100;
        } else {
          item.percentage = (allTimes - item.point) / allTimes * 100;
        }
        item.color = this.getColor(item.percentage);
      },
      stop(item) {
        item.stop = !item.stop;
        if (item.stop) {
          item.lastState = {
            state: item.state,
            seconds: item.action[item.state].seconds,
          }
        } else {
          let seconds = item.action[item.state].seconds;
          if (seconds != item.lastState.seconds) {
            item.point = 0;
            item.allTimes = seconds;
          }
        }
      },
      reduce(item, ket) {
        if (!item.stop) return;
        if (ket.minutes > 1) {
          ket.minutes += -1;
          ket.seconds = ket.minutes * 60;
          item.point = 0;
          this.update(item);
        };
      },
      add(item, ket) {
        if (!item.stop) return;
        if (ket.minutes < 50) {
          ket.minutes += 1;
          ket.seconds = ket.minutes * 60;
          item.point = 0;
          this.update(item);
        }
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
                  <span :class="['fa', item.stop ? 'fa-stop' : 'fa-play']"></span>
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
                <span v-for="ket in item.action">
                  {{ket.type}}:
                  <span>
                    <i class="fa fa-plus-circle" @click="add(item, ket)"></i>
                    <span class="app-content-person-config-content-word">
                      {{ket.minutes}}
                    </span>
                    <i class="fa fa-minus-circle" @click="reduce(item, ket)"></i>
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
            let temp = this.item.action[this.item.state].seconds;
            let minutes = '0' + Math.floor((temp - this.item.point) / 60).toString();
            minutes = minutes.slice(minutes.length - 2);
            let seconds = '0' + ((temp - this.item.point) % 60).toString();
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