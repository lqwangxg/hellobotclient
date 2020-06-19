<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <web-chat 
    :participants="participants" 
    :messageHistory="messageHistory" 
    :availableColors="availableColors"/>
  </div>
</template>

<script>
import chatParticipants from '../data/chatProfiles'
import messageHistory from '../data/messageHistory'
import availableColors from '../data/colors'

export default {
  name: 'App',
  data() {
    return {
      participants:chatParticipants,
      messageHistory:messageHistory,
      availableColors:availableColors
    }
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
