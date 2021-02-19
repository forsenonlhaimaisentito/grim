<template lang="pug">
  #app
    section.title-section
      h1.title.has-text-centered grim 0.1.0
    Sandbox
</template>

<script lang="ts">
import Vue from 'vue'
import Buefy from 'buefy'
import './theme.scss'
import Sandbox from './components/Sandbox.vue'

Vue.use(Buefy)

export default Vue.extend({
  name: 'App',
  components: {
    Sandbox
  }
})
</script>

<style>
.title-section {
  padding: 1ex 0;
}
</style>
