<template>
  <div class="root">
    <h3>app calculate rate</h3>
    <h5>mutable fields: </h5>
    <pre>{{ mutable[0] }}</pre>
    <pre>{{ mutable[1] }}</pre>
    <p>
      <label for="frequency">Frequency:</label>
      <select
       id="frequency"
       @change="frequencySelected"
       >
       <option v-for="opt in frequencies" :value="opt">{{ opt }}</option>
      </select>
    </p>
    <p>
      <label for="calculationMethod">Calculation for:</label>
      <select
        id="calculationMethod"
        v-model="calculated"
       @change="calculationMethodSelected"
       >
       <option v-for="opt in ['billRate', 'payRate', 'margin']" :value="opt">{{ opt }}</option>
      </select>
    </p>
    <p>
      <label for="bill_rate">Bill Rate</label>
      <input
        v-model.number="fields.billRate"
        @input="inputChanged"
        :disabled="calculated === 'billRate'"
        id="bill_rate"
        type="text">
    </p>
    <p>
      <label for="pay_rate">Pay Rate</label>
      <input
        v-model.number="fields.payRate"
        @input="inputChanged"
        :disabled="calculated === 'payRate'"
        id="pay_rate"
        type="text">
    </p>
    <p>
      <label for="is_percent">Show in %</label>
      <input
        id="is_percent"
        type="checkbox"
        v-model="margin_in_percent"
        @change="reevaluateMargin"
        >
    </p>
    <p>
      <label for="margin">Margin</label>
      <input
        v-model.number="fields.margin"
        @input="inputChanged"
        :disabled="calculated === 'margin'"
        id="margin" type="text"
        >
    </p>
    <p>Margin: {{ marginRepresentation }}</p>
  </div>
</template>
<script>
const add = (m, n) => m + n
const substract = (m, n) => m - n

const billRateFunc = (pr, ma) => pr / (1 - ma / 100)
const payRateFunc = (br, ma) => br * (1 - ma / 100)
const marginFunc = (br, pr) => 100 * (1 - pr / br)

const curry = f => x => y => f(x, y)

const curriedAdd = curry(add)
const curriedSubstract = curry(substract)

const curriedBillRate = curry(billRateFunc)
const curriedPayRate = curry(payRateFunc)
const curriedMargin = curry(marginFunc)

export default {
  data() {
    return {
      margin_in_percent: false,
      calculated: "billRate",
      frequencies: ["hourly", "weekly", "monthly"],
      fields: {
        billRate: 0, // must be the first operand, because of reuduce() method below!
        payRate: 0,
        margin: 0
      },
      mutable: [],
      funcRefs: {
        curriedBillRate,
        curriedPayRate,
        curriedMargin
      }
    }
  },
  methods: {
    upperFirst(str) {
      return str
        .charAt(0)
        .toUpperCase()
        .concat(str.slice(1))
    },

    reevaluateMargin(e) {
      this.inputChanged()
    },

    inputChanged() {
      let f
      this.mutable = Object.entries(this.fields).filter(([type, value]) => {
        return type !== this.calculated
      })
      if (!this.margin_in_percent) {
        f = this.calculated === "billRate" ? curriedAdd : curriedSubstract
      } else {
        const funcName = `curried${this.upperFirst(this.calculated)}`
        f = this.funcRefs[funcName]
      }

      const result = this.mutable.reduce(([t1, v1], [t2, v2]) => {
        return f(Math.abs(v1))(Math.abs(v2))
      })
      this.fields[this.calculated] = result
    },

    frequencySelected() {
      console.log("frequency selected")
    },

    calculationMethodSelected(e) {
      console.log("calculation method selected", e.target.value)
    }
  },
  computed: {
    realMargin() {
      return this.margin_in_percent
        ? this.fields.margin / 100
        : this.fields.margin
    },

    marginRepresentation() {
      if (this.fields.billRate !== 0) {
        if (this.margin_in_percent) {
          return this.realMargin * this.fields.billRate
        }
        return (this.fields.margin / this.fields.billRate) * 100
      }
      return "division by zero"
    }
  }
}
</script>
<style scoped>
pre {
  white-space: normal;
}
.root {
  display: block;
  text-align: center;
}
.root input:disabled {
  border: none;
  border-bottom: 3px solid blue;
}
</style>
