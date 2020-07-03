<template>
  <div id="chat">
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
  name: "chat",
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
  
  computed: {
    chat_server_ws_url() {
      let url = this.$WS_URL;
      console.log("chatserver_url====>:", url);
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
}
</style>
