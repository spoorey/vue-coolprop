<template>
  <div class="hello">
    <table>
      <tr>
        <th v-for="(prop, index) in displayedProperties" :key="index">
          {{ prop }}
        </th>
        <th>
          <select v-model="newProperty">
            <option 
            v-for="(availableProperty, index) in availableProperties"
            :key="index"
            :value="availableProperty"
            >
              {{ availableProperty }}
            </option>
          </select>
          <button v-on:click="addProperty(newProperty)">
            Add
          </button>
        </th>
      </tr>
      <tr v-for="(state, stateindex) in states" :key="stateindex">
        <td v-for="(property, index) in displayedProperties" :key="index">
          <input type="text" v-model="state[property]" v-on:change="updateState(stateindex, property, state[property])">
        </td>
      </tr>
      <tr>
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
      lastChangedProperties: [],
      availableProperties: ['T', 'P', 'Q', 'H', 'S', 'phase'],
      displayedProperties: ['T', 'P', 'Q'],
      states: [
        { H: 1546933.2820738966, S: 4330.717339121239, T: 373, P: 100876.29794712717, phase: "liquid" }
      ]
    }
  },
  methods: {
    addProperty: function(property) {
      this.displayedProperties.push(property)
    },
    updateState: function(stateindex, changedProperty, changedValue) {
      var state = this.states[stateindex];
      this.lastChangedProperties.push(changedProperty);
      console.log(stateindex)
      console.log(state, changedProperty, changedValue);

      var newState = {};
      changedValue = parseFloat(changedValue);
      newState[changedProperty] = changedValue;

      console.log(this.lastChangedProperties)

      var knownProperties = [...this.lastChangedProperties];
      knownProperties = knownProperties.reverse();
      knownProperties = knownProperties.concat(this.availableProperties);
      for (var property in knownProperties) {
        property = knownProperties[property]
        if (
          property != changedProperty && 
          !isNaN(state[property]) && 
          state[property] != Infinity
          ) {
          newState[property] = parseFloat(state[property]);
          break;
        } 
      }
      console.log(newState);
      newState =  Vue.coolProp().completeState('water', newState);
      console.log(newState, 'newstate');
      this.states[stateindex] = {};
      this.$set(this.states, stateindex, newState)
      return newState;
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
</style>
