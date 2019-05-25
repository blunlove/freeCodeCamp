function main() {
  new Vue({
    el: '#app',
    data() {
      return {
        buttons: [
          {value: 'C', isInput: false},
          {value: 'CE', isInput: false},
          {value: '<=', isInput: false},
          {value: '÷', isInput: false},
          {value: '7', isInput: true},
          {value: '8', isInput: true},
          {value: '9', isInput: true},
          {value: '×', isInput: false},
          {value: '4', isInput: true},
          {value: '5', isInput: true},
          {value: '6', isInput: true},
          {value: '-', isInput: false},
          {value: '1', isInput: true},
          {value: '2', isInput: true},
          {value: '3', isInput: true},
          {value: '+', isInput: false},
          {value: '±', isInput: false},
          {value: '0', isInput: true},
          {value: '.', isInput: false},
          {value: '=', isInput: false},
        ],
        inputArray: [],
        formulaArray: [],
        isNegative: false,
      }
    },
    computed: {
      standInput() {
        return this.inputArray.join('') || '0';
      },
      formulaInput() {
        return this.formulaArray.map(item => item.length > 1 && item[0] === '-' ? `(${item})` : item).join('');
      }
    },
    components: {},
    methods: {
      restInput() {
        this.isNegative = false;
        this.inputArray = [];
      },
      restAll() {
        this.restInput();
        this.formulaArray = [];
      },
      buttonClick(item) {
        if (item.isInput && this.inputArray.length < 10) {
          if (this.inputArray.length === 0 && item.value === '0') return;
          this.inputArray.push(item.value);
        } else if (item.value === '<=') {
          this.inputArray.pop();
        } else if (item.value === 'CE') {
          this.restInput();
        } else if (item.value === 'C') {
          this.restAll();
        } else if (item.value === '.') {
          if (!this.inputArray.includes(item.value)) {
            if (this.inputArray.length === 0) {
              this.inputArray.push('0');
            }
            this.inputArray.push(item.value);
          }
        } else if (item.value === '±') {
          this.isNegative = !this.isNegative;
        } else if (/[\+\-\×\÷\=]/g.test(item.value)) {
          this.symbol(item.value);
        }
      },
      symbol(value) {
        if (/[\+\-\×\÷]/g.test(value)) {
          if (this.standInput === '0' && this.formulaArray.length > 0) {
            this.formulaArray.pop();
            this.formulaArray.push(value);
          } else {
            this.formulaArray = this.formulaArray.concat(this.getInputValue(), value);
          }
          this.restInput();
        } else {
          this.equal();
        }
      },
      getInputValue() {
        let temp = this.standInput.replace(/\.$/, '');
        if (this.isNegative) temp = '-' + temp;
        return temp;
      },
      equal() {
        if (this.formulaArray.length === 0) {
          return this.getInputValue();
        }
        this.formulaArray.push(this.getInputValue());
        this.inputArray = this.calculator(this.formulaArray);
        if (this.inputArray[0][0] === '-') {
          this.isNegative = true;
        } else {
          this.isNegative = false;
        }
        this.inputArray[0] = Math.abs(this.inputArray[0]).toString();
        this.formulaArray = [];
      },
      firstMethod(array) {
        let result = '';
        let a = {number: Number(array[0].replace('.', '')), decimalNum: array[0].split('.')[1] ? array[0].split('.')[1].length : 0};
        let b = {number: Number(array[2].replace('.', '')), decimalNum: array[2].split('.')[1] ? array[2].split('.')[1].length : 0};
        if (array[1] === '×') {
          result = a.number * b.number;
          if (result < 0) {
            result = '-' + '0'.repeat(a.decimalNum + b.decimalNum) + Math.abs(result).toString();
          } else {
            result = '0'.repeat(a.decimalNum + b.decimalNum) + result.toString();
          }
          if (a.decimalNum + b.decimalNum > 0) {
            result = result.slice(0, result.length - (a.decimalNum + b.decimalNum)) + '.' + result.slice(result.length - (a.decimalNum + b.decimalNum));
          }
        } else {
          let abceilmalNumDeep = a.decimalNum - b.decimalNum;
          if (abceilmalNumDeep >= 0) {
            b.number *= Math.pow(10, abceilmalNumDeep);  
          } else {
            a.number *= Math.pow(10, Math.abs(abceilmalNumDeep));  
          }
          result = (a.number / b.number).toFixed(4);
        }
        return Number(result).toString();
      },
      secondMethod(array) {
        let result = '';
        let a = {number: Number(array[0].replace('.', '')), decimalNum: array[0].split('.')[1] ? array[0].split('.')[1].length : 0};
        let b = {number: Number(array[2].replace('.', '')), decimalNum: array[2].split('.')[1] ? array[2].split('.')[1].length : 0};
        let abceilmalNumDeep = a.decimalNum - b.decimalNum;
        if (abceilmalNumDeep >= 0) {
          b.number *= Math.pow(10, abceilmalNumDeep);
        } else {
          a.number *= Math.pow(10, Math.abs(abceilmalNumDeep));
        }
        if (array[1] === '+') {
          result = a.number + b.number;
        } else {
          result = a.number - b.number;
        }
        if (result < 0) {
          result = '-' + '0'.repeat(Math.max(a.decimalNum, b.decimalNum)) + Math.abs(result).toString();
        } else {
          result = '0'.repeat(Math.max(a.decimalNum, b.decimalNum)) + result.toString();
        }
        if (Math.max(a.decimalNum, b.decimalNum) > 0) {
          result = result.slice(0, result.length - Math.max(a.decimalNum, b.decimalNum)) + '.' + result.slice(result.length - Math.max(a.decimalNum, b.decimalNum));
        }
        return Number(result).toString();
      },
      calculator(array) {
        let arrayCache = [...array];
        while(arrayCache.length >= 3) {
          let firstSymbol = arrayCache.findIndex(word => ['×', '÷'].includes(word));
          let secondSymbol = arrayCache.findIndex(word => ['+', '-'].includes(word));
          if (firstSymbol > 0) {
            let waitCalculator = arrayCache.slice(firstSymbol - 1, firstSymbol + 2);
            arrayCache.splice(firstSymbol - 1, 3, this.firstMethod(waitCalculator));
          } else if (secondSymbol > 0) {
            let waitCalculator = arrayCache.slice(secondSymbol - 1, secondSymbol + 2);
            arrayCache.splice(secondSymbol - 1, 3, this.secondMethod(waitCalculator));
          }
        }
        return arrayCache;
      }
    },
    template: `
      <div class="app">
        <div class="calculator">
          <div class="calculator-header">
            <div class="calculator-header-formula">
              {{formulaInput}}
            </div>
            <div class="calculator-header-stand">
              {{this.isNegative ? '-' : ''}}{{standInput}}
            </div>
          </div>
          <div class="calculator-content">
            <div
              :class="['calculator-content-item', {'func': !item.isInput}]"
              v-for="item in buttons"
              @click="buttonClick(item)">
              {{item.value}}
            </div>
          </div>
        </div>
      </div>
    `
  });
}
main();