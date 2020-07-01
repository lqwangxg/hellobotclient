<template>
  <div id="app">
    <router-view/>
    <web-chat
      :themeColors="availableColors"
      :ws_url="chat_server_ws_url"
      :participants="participants"
      :username="username"
    />
  </div>
</template>

<script>
import webChat from "../vue_chat_plugin/webChat";
import chatParticipants from "../data/chatProfiles";
import History from "../data/messageHistory";
import Colors from "../data/colors";

export default {
  name: "App",
  props: {
    ws_url:{
      type: String
    }
  },
  components: {
    webChat
  },
  data() {
    return {
      participants: chatParticipants,
      messageHistory: History,
      availableColors: Colors
    };
  },
  mounted: function() {
    this.default_user = "admin";
  },
  computed: {
    chat_server_ws_url() {
      let url = "http://localhost:3000/";
      if(this.ws_url){
        url = this.ws_url;
      }
      return url;
    },
    username() {
      return this.$route.params.username;
    }
  }
};
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
