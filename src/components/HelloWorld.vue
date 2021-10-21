<template>
  <div class="hello">
    <h1>CoolProp Online fluid property calculation</h1>
    <div>
      <label for="select-fluid">
        Fluid:
        <v-select
        id="select-fluid"
        :options="availableFluids"
        v-model="liquid">
        </v-select>
      </label>
    </div>
    <br>
    <table>
      <tr>
        <th v-for="(prop, index) in displayedProperties" :key="index">
          {{ prop }}
          <span v-if="prop != 'phase'">
            [{{ displayedUnits[index] }}]
          </span>

          <button class="remove-property" v-on:click="displayedProperties.splice(index, 1); displayedUnits.splice(index, 1);">✖</button> 
        </th>
        <th>
          <select v-model="newProperty" v-on:change="newUnit = ((newProperty in availableUnits) ? availableUnits[newProperty][0] : '')">
            <option 
            v-for="(availableProperty, index) in availableProperties"
            :key="index"
            :value="availableProperty"
            >
              {{ availableProperty }}
            </option>
          </select>
          <select v-model="newUnit" v-if="newProperty in availableUnits">
            <option
            v-for="(availableUnit, index) in availableUnits[newProperty]"
            :key="index"
            :value="availableUnit"
            >
              {{ availableUnit }}
            </option>
          </select>
          <button v-on:click="addProperty(newProperty, newUnit)">
            Add
          </button>
        </th>
      </tr>
      <tr v-for="(state, stateindex) in states" :key="stateindex">
        <td v-for="(property, propertyindex) in displayedProperties" :key="propertyindex">
          <input
          v-if="property != 'phase'"
          type="number"
          v-model="state[property][displayedUnits[propertyindex]]"
          v-on:change="updateState(stateindex, property, state[property][displayedUnits[propertyindex]], displayedUnits[propertyindex])"
          >
          <span v-if="property == 'phase'">
            {{ state['phase'] }} 
          </span>
        </td>
        <td class="remove-state">
          <button v-on:click="states.splice(stateindex, 1)">✖</button> 
        </td>
      </tr>
      <tr>
        <td :colspan="displayedProperties.length+1">
          <button v-on:click="addState()" class="add-state">
            <strong>
            +
            </strong>
          </button>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data: function() {
    return {
      newProperty: 'T',
      newUnit: 'c',
      lastChangedProperties: [],
      availableProperties: [...Vue.coolProp().availableProperties].concat('phase'),
      displayedProperties: ['T', 'P', 'Q', 'phase'],
      displayedUnits: ['c', 'bar', 'kg/kg'],
      availableUnits: Vue.coolProp().availableUnits,
      availableFluids: Vue.coolProp().fluids,
      liquid: 'water',
      states: [
        Vue.coolProp().getEmptyMappedState(),
      ]
    }
  },
  watch: {
    liquid: function() {
      this.changeLiquid();
    }
  },
  methods: {
    addState: function() {
      console.log(Vue.coolProp().fluids)
      this.states.push(Vue.coolProp().getEmptyMappedState());
    },
    convertToSI: function(value, unit) {
      return Vue.coolProp().convertToSI(value, unit);
    },
    convertFromSI: function(value, unit) {
      return Vue.coolProp().convertFromSI(value, unit);
    },
    addProperty: function(property, unit) {
      this.displayedProperties.push(property)
      if (property in this.availableUnits) {
          this.displayedUnits.push(unit)
      } else {
        this.displayedUnits.push('')
      }
    },
    changeLiquid: function() {
      if (this.lastChangedProperties.length < 2) {
        this.states = [
          Vue.coolProp().getEmptyMappedState()
        ];
        return;
      }

      var property = this.lastChangedProperties[this.lastChangedProperties.length-1];
      for (var stateindex in this.states) {
        var unit = Vue.coolProp().PropertySIUnits[property];

        this.updateState(stateindex, property, this.states[stateindex][property][unit], unit);
      }
    },
    updateState: function(stateindex, changedProperty, changedValue, unit) {
      var state = this.states[stateindex];
      if (
        this.lastChangedProperties.length < 1 ||
        this.lastChangedProperties[this.lastChangedProperties.length-1] != changedProperty
      ) {
        this.lastChangedProperties.push(changedProperty);
      }

      changedValue = parseFloat(changedValue);
      changedValue = this.convertToSI(changedValue, unit);
      for (var propertyUnit in this.states[stateindex][changedProperty]) {
        if (propertyUnit == unit) {
          continue;
        }

        this.states[stateindex][changedProperty][propertyUnit] = this.convertFromSI(changedValue, propertyUnit);  
      }

      var knownProperties = {};
      knownProperties[changedProperty] = changedValue;

      var lastProperties = [...this.lastChangedProperties];
      lastProperties = lastProperties.reverse();
      lastProperties = lastProperties.concat(this.availableProperties);
      for (var property in lastProperties) {
        property = lastProperties[property];
        if (property == 'phase') {
          continue;
        }

        var SIUnit = Vue.coolProp().PropertySIUnits[property];
        if (
          property != changedProperty && 
          !isNaN(state[property][SIUnit]) && 
          state[property][SIUnit] != Infinity &&
          state[property][SIUnit] !== ''
        ) {
            knownProperties[property] = parseFloat(state[property][SIUnit]);
            break;
        } 
      }

      if (Object.keys(knownProperties).length < 2) {
        return;
      }

      var data =  Vue.coolProp().completeState(this.liquid, knownProperties);
      var mapped = Vue.coolProp().mapStateToUnits(data, 8);
      this.states[stateindex] = mapped;
      this.$set(this.states, stateindex, mapped)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

input[type=number] {
  text-align: right;
}
table {
    border-collapse: collapse;
}
table td, table th {
  border: 1px solid #ccc;
  border-collapse: collapse;
  padding: 2px 4px;
}
select, button {
  margin: 0 3px;
}

button.add-state {
  width: 100%;
}

td.remove-state {
  text-align: center;
}

#select-fluid {
  width: 400px;
  display: inline-block;
}
</style>
