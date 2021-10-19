<template>
  <div class="hello">
    <table>
      <tr>
        <th v-for="(prop, index) in displayedProperties" :key="index">
          {{ prop }}
          <button class="remove-property" v-on:click="displayedProperties.splice(index, 1)">✖</button> 
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
          <input 
          v-if="editableProperties.includes(property)"
          type="number"
          v-model="state[property]"
          v-on:change="updateState(stateindex, property, state[property])"
          >
          <span v-if="!editableProperties.includes(property)">
            {{ state[property] }}
          </span>
        </td>
      </tr>
      <tr>
        <td :colspan="displayedProperties.length">
          <button v-on:click="states.push({})">
            +
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
      lastChangedProperties: [],
      availableProperties: ['T', 'P', 'Q', 'H', 'S', 'phase'],
      displayedProperties: ['T', 'P', 'Q'],
      editableProperties: ['T', 'P', 'Q', 'H', 'S'],
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

      var newState = {};
      changedValue = parseFloat(changedValue);
      newState[changedProperty] = changedValue;

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

      if (Object.keys(newState).length < 2) {
        return;
      }

      newState =  Vue.coolProp().completeState('water', newState);
      console.log(newState, 'newstate');
      this.states[stateindex] = {};
      this.$set(this.states, stateindex, newState)
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
</style>
