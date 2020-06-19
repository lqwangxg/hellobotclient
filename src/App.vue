<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <web-chat 
    :participants="participants" 
    :messageHistory="messageHistory" 
    :themeColors="availableColors"/>
  </div>
</template>

<script>
import webChat from '../vue_chat_plugin/webChat'
import chatParticipants from '../data/chatProfiles'
import History from '../data/messageHistory'
import Colors from '../data/colors'

export default {
  name: 'App',
  components:{
    webChat
  },
  data() {
    return {
      participants:chatParticipants,
      messageHistory:History,
      availableColors:Colors
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
