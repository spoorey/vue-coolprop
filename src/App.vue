<template>
  <div id="app">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
//import './assets/coolprop.js'
import Vue from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import coolprop from './plugins/coolprop.js'
import vSelect from 'vue-select';
import "vue-select/dist/vue-select.css";

Vue.component('v-select', vSelect);
Vue.use(coolprop, window.cm)

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
