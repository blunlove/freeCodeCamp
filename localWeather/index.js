function getWeather(province = '浙江省', city = '温州市', county = '') {
  const dayConfig = [
    {
      value: 1,
      label: '周一'
    },
    {
      value: 2,
      label: '周二'
    },
    {
      value: 3,
      label: '周三'
    },
    {
      value: 4,
      label: '周四'
    },
    {
      value: 5,
      label: '周五'
    },
    {
      value: 6,
      label: '周六'
    },
    {
      value: 0,
      label: '周日'
    },
  ]
  return new Promise((resolve, reject) => {
    $.get({
      headers: {
        Accept: "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
      },
      dataType: 'jsonp',
      url: 'https://wis.qq.com/weather/common',
      data: {
        source: 'pc',
        weather_type: 'observe|forecast_1h|forecast_24h|index|alarm|limit|tips|rise|air',
        province,
        city,
        county,
      },
      success: function (res) {
        let now = new Date();
        let year = now.getFullYear();
        let month = '0' + (now.getMonth() + 1);
        month = month.substring(month.length - 2);
        let day = now.getDate();
        nowDay = `${year}-${(month)}-${day}`
        res.data.forecast_24h = Object.keys(res.data.forecast_24h).map(key => res.data.forecast_24h[key]);
        res.data.forecast_24h.forEach(item => {
          let temp = (new Date(item.time).getTime() - new Date(nowDay).getTime()) / (1000 * 60 * 60 * 24);
          switch(temp) {
            case -1:
              item.timeDay = '昨天';
              break;
            case 0:
              item.timeDay = '今天';
              break;
            case 1:
              item.timeDay = '明天';
              break;
            case 2:
              item.timeDay = '后天';
              break;
            default:
              item.timeDay = dayConfig.find(day => day.value === new Date(item.time).getDay()).label;
          }
        })
        resolve(res.data);
      },
      error() {
        reject();
      }
    });
  })
}

function main() {
  new Vue({
    el: '#app',
    data() {
      return {
        data: {},
      }
    },
    mounted() {
      getWeather().then(res => {
        this.data = res;
      })
    },
    components: {
      'weather-card': {
        props: {
          data: {
            humidity: '',
            degree: '',
            weather: '',
            pressure: '',
            precipitation: '',
            wind_power: ''
          }
        },
        data: function () {
          return {
            config: [
              {label: '湿度', key: 'humidity'},
              {label: '温度', key: 'degree'},
              {label: '天气', key: 'weather'},
              {label: '气压', key: 'pressure'},
              {label: '降水量', key: 'precipitation'},
              {label: '风力', key: 'wind_power'},
            ]
          }
        },
        template: `
          <div class="weather-card">
            <div class="weather-card-item" v-for="item in config">{{ item.label }}：{{ data[item.key] }}</div>
          </div>
        `
      },
      'future-card': {
        props: {
          data: {
            default: {
              time: '',
              day_weather: '',
              night_weather: '',
              max_degree: '',
              min_degree: '',
            }
          }
        },
        template: `
          <div class="future-card">
            <div class="future-card-time">{{data.timeDay}}</div>
            <div class="future-card-degree">
              <div class="future-card-degree-max">最高温：{{data.max_degree}}℃</div>
              <div class="future-card-degree-min">最低温：{{data.min_degree}}℃</div>
            </div>
            <div class="future-card-weather">
              <div class="future-card-weather-day">早晨：{{data.day_weather}}</div>
              <div class="future-card-weather-night">傍晚：{{data.night_weather}}</div>
            </div>
          </div>
        `
      }
    },
    template: `
      <div class="weather">
        <div class="weather-header">
          今天天气
        </div>
        <div class="weather-today">
          <weather-card v-if="data.observe" :data="data.observe"></weather-card>
        </div>
        <div class="weather-future">
          <div class="weather-future-title">未来天气</div>
          <future-card v-for="item in data.forecast_24h" :data="item"></future-card>
        </div>
      </div>
    `
  });
}
main();