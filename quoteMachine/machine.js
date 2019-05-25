function getNewQuote(callback) {
  $.ajax({
    headers: {
      Accept: "application/json",
      "X-Mashape-Key": "OivH71yd3tmshl9YKzFH7BTzBVRQp1RaKLajsnafgL2aPsfP9V",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: 'https://andruxnet-random-famous-quotes.p.mashape.com/cat=',
    success: function (res) {
      if (typeof res === 'string') {
        res = JSON.parse(res);
      }
      if (Array.isArray(res)) {
        res = res[0];
      }
      callback(res);
    }
  })
}
function main() {
  colors = [
    '#1CCBAE',
    '#88C7BE',
    '#96EFE6',
    '#BEE8E7',
    '#B0ECC8',
    '#D0D0AE',
    '#CEB773',
    '#E7CCAF',
    '#EEAEA2',
    '#F9636F',
  ];
  let board = $('.app');
  let quote = $('.app-card-quote');
  let media = $('.app-card-media-item');
  let newQuote = $('.app-card-rest');
  function changeColor(color) {
    board.css('background-color', color);
    quote.css('color', color);
    media.css('background-color', color);
    newQuote.css('background-color', color);
  }
  function getColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }
  function changeQuote(el, text) {
    el.animate({
      opacity: 0
    }, 500, function() {
      el.animate({
        opacity: 1
      }, 500)
      el.text(text);
    });
  }
  function bindClickEvent() {
    media.click(() => {
      let twitterPath = $('.app-card-media-item.twitter')[0].href;
      window.open(twitterPath);
    });
    newQuote.click(() => {
      getNewQuote(res => {
        let quote = res.quote;
        let author = res.author;
        $('.app-card-media-item.twitter')[0].href = 'https://twitter.com/intent/tweet?hashtags=quotes&related=freecodecamp&text=' + encodeURIComponent('"' + quote + '" ' + author);
        changeQuote($('.app-card-quote-word span'), quote);
        changeQuote($('.app-card-quote-owner-name'), author);
        changeColor(getColor());
      });
    });
  }
  changeColor(getColor());
  bindClickEvent();
  newQuote.click();
}
main();