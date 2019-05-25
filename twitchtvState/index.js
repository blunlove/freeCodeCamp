function getStreams(type, name) {
  return new Promise((resolve, reject) => {
    $.getJSON({
      headers: {
        Accept: "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
      },
      dataType: 'jsonp',
      url: `https://wind-bow.gomix.me/twitch-api/${type}/${name}`,
      success: function (res) {
        resolve(res);
      },
      error: function() {
        reject();
      }
    })
  })
}
function getMessage(name) {
  return Promise.all(
    ['streams', 'channels'].map(item => getStreams(item, name))
  ).then(res => {
    let temp = {};
    if (res[0].stream === null) {
      temp.game = "Offline";
      temp.status = "offline";
    } else if (res[0].stream === undefined) {
      temp.game = "Account Closed";
      temp.status = "offline";
    } else {
      temp.game = res[0].stream.game;
      temp.status = "online";
    };
    temp.logo = res[1].logo != null ? res[1].logo : "https://dummyimage.com/50x50/ecf0e7/5c5457.jpg&text=0x3F",
    temp.name = res[1].display_name != null ? res[1].display_name : name,
    temp.description = temp.status === "online" ? ': ' + res[1].status : "";
    temp.url = res[1].url;
    return temp;
  })
}
function main() {
  let channels = ["freecodecamp","test_channel","ESL_SC2"];
  new Vue({
    el: '#app',
    data() {
      return {
        anchorList: [],
        anchorListCache: [],
      }
    },
    components: {
      'anchor-card': {
        props: ['data'],
        template: `
          <div :class="['anchor-card', data.status]">
            <img :src="data.logo">
            <div class="anchor-card-name" @click="gotoTwitch">{{data.name}}</div>
            <div class="anchor-card-description">{{data.game + data.description}}</div>
          </div>
        `,
        methods: {
          gotoTwitch() {
            window.open(this.data.url);
          }
        }
      },
      'switch-button': {
        data () {
          return {
            checked: 'all',
            config: [
              { label: 'ALL', state: 'all' },
              { label: 'ONLINE', state: 'online' },
              { label: 'OFFLINE', state: 'offline' },
            ]
          }
        },
        template: `
          <div class="switch">
            <div
              :class="['switch-' + item.state, {'checked': checked == item.state}]"
              v-for="item in config"
              @click="changeState(item)"
            >
              <span></span>{{ item.label }}
            </div>
          </div>
        `,
        methods: {
          changeState(item) {
            this.checked = item.state;
            this.$emit('state-change', item);
          }
        }
      }
    },
    mounted() {
      Promise.all(channels.map(name => getMessage(name))).then(res => {
        this.anchorList = res.sort((a, b) => {
          if (a.status == 'online' && b.status == 'offline') {
            return -1;
          } else {
            return 1;
          }
        });
        this.anchorListCache = this.anchorList;
      });
    },
    methods: {
      stateChange(item) {
        this.anchorList = item.state == 'all' ? this.anchorListCache : this.anchorListCache.filter(anchor => anchor.status == item.state);
      },
    },
    template: `
      <div class="app">
        <div class="app-header">
          <h1>TWITCH STREAMERS</h1>
          <switch-button @state-change="stateChange"></switch-button>
        </div>
        <div class="app-content">
          <anchor-card v-for="item in anchorList" :data="item"></anchor-card>
        </div>
        <div class="app-footer"></div>
      </div>
    `
  });
}
main();