function getWiki(queryWord) {
  return new Promise((resolve, reject) => {
    $.get({
      headers: {
        Accept: "application/json",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
      },
      dataType: 'jsonp',
      url: 'https://en.wikipedia.org/w/api.php',
      data: {
        format: 'json',
        action: 'query',
        generator: 'search',
        gsrnamespace: '0',
        gsrlimit: '10',
        prop: 'pageimages|extracts',
        pilimit: 'max',
        exintro: '',
        explaintext: '',
        exsentences: '1',
        exlimit: 'max',
        gsrsearch: queryWord,
      },
      success: function (res) {
        resolve(Object.keys(res.query.pages).map(key => res.query.pages[key]));
      },
      error: function() {
        reject();
      }
    })
  })
}
function main() {
  new Vue({
    el: '#app',
    data() {
      return {
        searched: false,
        wikiData: [],
      }
    },
    components: {
      'search': {
        data () {
          return {
            isclick: false,
            queryWord: ''
          }
        },
        template: `
          <div class="search">
            <i class="fa fa-search" v-if="!isclick" @click="clickSearch"></i>
            <div class="search-input" v-if="isclick">
              <input :class="{click: isclick}" ref="input" v-model="queryWord" @keyup.enter="search">
              <i class="fa fa-close" @click="back"></i>
            </div>
          </div>
        `,
        methods: {
          search() {
            this.$emit('search', this.queryWord);
          },
          back() {
            this.isclick = false;
            this.$emit('back');
          },
          clickSearch() {
            this.isclick = true;
            this.$nextTick(() => {
              this.$refs.input.focus();
            })
          },
        }
      },
      'wiki-card': {
        props: ['wikiData'],
        template: `
          <div class="wiki-card">
            <div class="wiki-card-item" v-for="item in wikiData" @click="gotoWiki(item)">
              <div class="wiki-card-item-title">{{item.title}}</div>
              <div class="wiki-card-item-word">{{item.extract}}</div>
            </div>
          </div>
        `,
        methods: {
          gotoWiki(item) {
            window.open('https://en.wikipedia.org/?curid=' + item.pageid);
          },
        }
      }
    },
    methods: {
      randomArticle() {
        window.open('http://en.wikipedia.org/wiki/Special:Random');
      },
      search(queryWord) {
        this.searched = true;
        getWiki(queryWord).then(res => {
          this.wikiData = res;
        })
      },
      back() {
        this.searched = false;
      }
    },
    template: `
      <div :class="['app', {'center': !searched}]">
        <div class="app-header" @click="randomArticle">
          Click here for a random article
        </div>
        <div class="app-search">
          <search @search="search" @back="back"></search>
        </div>
        <div class="app-cards" v-if="searched">
          <wiki-card :wiki-data="wikiData"></wiki-card>
        </div>
        <div class="app-footer" v-if="!searched">
          Click icon to search
        </div>
      </div>
    `
  });
}
main();