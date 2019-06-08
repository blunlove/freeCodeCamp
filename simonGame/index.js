function main() {
  let AudioContext = window.AudioContext;
  let audioCtx = new AudioContext();
  function getVoiceNode(frq, type) {
    let osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = frq;
    osc.start(0.0);
    let node = audioCtx.createGain();
    osc.connect(node);
    node.connect(audioCtx.destination);
    node.gain.value = 0;
    return node;
  }
  let goodVoices = [
    {frq: 329.63, color: '#00a74a'},
    {frq: 261.63, color: '#9f0f17'},
    {frq: 220, color: '#094a8f'},
    {frq: 164.81, color: '#cca707'},
  ];
  let errVoice = 110;
  let goodNodes = goodVoices.map(item => {
    item.node = getVoiceNode(item.frq, 'sine');
    item.checked = false;
    delete item.frq;
    return item;
  });
  let errNode = getVoiceNode(errVoice, 'triangle');
  let ramp = 0.01;
  let vol = 0.5;
  new Vue({
    el: '#app',
    data() {
      return {
        goodNodes,
        errNode,
        gameStatus: {}
      }
    },
    mounted() {
      this.restGameStatus();
    },
    methods: {
      timeInterval() {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve();
          }, 600);
        })
      },
      async playTones(node) {
        this.gameStatus.isVoice = true;
        node.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + ramp);
        await this.timeInterval();
        this.stopAllVoice();
      },
      checkStrict() {
        if (this.gameStatus.switch) {
          this.gameStatus.strict = !this.gameStatus.strict;
        }
      },
      restGameStatus() {
        this.gameStatus = {
          isVoice: false,
          switch: false,
          strict: false,
          count: 0,
          start: false,
        };
        this.stopAllVoice();
        this.clearNodeBright();
      },
      stopAllVoice() {
        this.goodNodes.forEach(item => {
          item.node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + ramp);
        });
        this.gameStatus.isVoice = false;
      },
      switchChange(val) {
        this.gameStatus.start = val;
        if (!val) {
          this.restGameStatus();
        }
      },
      checkedNode(item) {
        item.checked = true;
      },
      clearNodeBright() {
        this.goodNodes.forEach(ket => {
          ket.checked = false;
        });
      },
      async clickGoodNodes(item) {
        if (!this.canCheck) return;
        this.checkedNode(item);
        await this.playTones(item.node);
        this.clearNodeBright();
      }
    },
    computed: {
      canCheck() {
        return !this.gameStatus.isVoice && this.gameStatus.start
      }
    },
    template: `
      <div class="app">
        <div class="app-header">
          Simon Game
        </div>
        <div class="app-content">
          <div class="app-content-console">
            <div class="app-content-console-count">
              <div class="app-content-console-count-screen"></div>
              <div class="app-content-console-count-title">count</div>
            </div>
            <div class="app-content-console-switch">
              <el-switch
                v-model="gameStatus.switch"
                active-text="on"
                inactive-text="off"
                @change="switchChange">
              </el-switch>
            </div>
            <div class="app-content-console-start">
              <el-button type="danger" circle></el-button>
              <div class="app-content-console-start-title">start</div>
            </div>
            <div class="app-content-console-strict">
              <span>
                <i :class="{'strict': gameStatus.strict}"></i>
              </span>
              <el-button type="warning" circle @click="checkStrict"></el-button>
              <div class="app-content-console-strict-title">strict</div>
            </div>
          </div>
          <div class="app-content-button">
            <span
              v-for="item in goodNodes"
              @click="clickGoodNodes(item)"
              :class="[{'canCheck': !gameStatus.isVoice && gameStatus.start}, {'bright': item.checked}]"
              :style="{background: item.color}">
            </span>
          </div>
        </div>
      </div>
    `,
  });
}
main();