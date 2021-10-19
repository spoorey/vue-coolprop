<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
//import './assets/coolprop.js'
import Vue from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import coolprop from './plugins/coolprop.js'
Vue.use(coolprop, window.cm)

setTimeout(function() {
  console.log(500)
  console.log(Vue.coolProp().completeState('Water', {'T': 373, 'Q': 0.5}))
}, 500)
setTimeout(function() {
  console.log(1000)
  console.log(Vue.coolProp().completeState('Water', {'T': 373, 'Q': 0.5}))
}, 500)

setTimeout(function() {
  console.log(5000)
  console.log(Vue.coolProp().completeState('Water', {'T': 373, 'Q': 0.5}))
}, 5000)
console.log(Vue.coolProp().completeState('Water', {'T': 373, 'Q': 0.5}))

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
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
