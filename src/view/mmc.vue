<template>
  <div id="messageCenter">
    <el-container>
      <el-header>
        <el-row>
          <el-col :span="12" class="chat-header">
            <div >MBP Smartec ChatBot Control Center.</div>
          </el-col>
          <el-col :span="8">
            <div ></div>
          </el-col>
          <el-col :span="4">
            <div >匿名客</div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside width="200px">
          <UserList :colors="availableColors" :participants="participants" @userClick="userClick" />
        </el-aside>
        <el-main>
          <message-window :messageList="messageList" />
        </el-main>
      </el-container>

      <el-footer>Copyright © 2019-2024 Company Co. All rights reserved</el-footer>
    </el-container>
  </div>
</template>

<script>
import Colors from "../data/colors";
import chatParticipants from "../data/chatProfiles";
import UserList from "../vue_chat_plugin/UserList";
import messageWindow from "../vue_chat_plugin/messageWindow";
import client from '../vue_chat_plugin/client.js'

export default {
  name: "MessageCenter",
  components: {
    UserList,
    messageWindow
  },
  data() {
    return {
      participants: chatParticipants,
      availableColors: Colors.blue,
      chatbot: client,
      messageList: [],
    };
  },
  mounted() {
    this.chatbot.element = this;
    this.chatbot.on('disconnected', this.onDisConnected);
    this.chatbot.on('connected', this.onConnected);
    this.chatbot.on('message', this.onReceived);
    this.chatbot.on('text', this.onReceived);

    this.chatbot.connect(this.$MMC_UID, this.$WS_URL);
  },
  computed: {
    messages() {
      let messages = this.messageList;

      return messages;
    },
    chat_server_ws_url() {
      return this.$WS_URL;
    }
  },
  methods: {
    userClick(user) {
      console.log("drag user clicked:", user);
    },
    getSuggestions() {
      return this.messages.length > 0
        ? this.messages[this.messages.length - 1].suggestions
        : [];
    },
    onUserInputSubmit(payload) {
      this.chatbot.quickReply(payload);
    },
    onConnected:function( ){
      this.chat_connected = true;
      const message = {
        type: "system",
        data: {
          text: this.userid + '様がサーバに接続できました。'
        }
      }
      this.title="ようこそ、" + this.userid +"様"; 
      console.log(message);
      
      this.chatbot.sendEvent({
        name: 'connected'
      });
      this.messageList.push(message);//頭から追加
    },
    onDisConnected:function( ){
      this.chat_connected = false;
      const message ={
        data: {
          text: 'ネットワークが切断されました。'
        },
        type: 'system'
      }
      console.log(message);
      this.messageList.push(message);//頭から追加
    },
    onReceived:function(event, message){
      console.log(" onReceived======>event:", event, " messagedetails:", message)
      if(message.type==="message"){
        message.type="text"
      }
      this.convertMessage(message);
      this.messageList.push(message);
    },
    convertMessage(msg) {
      if(msg.text){
        msg.data = {text: msg.text};
      }
      if(msg.user && !msg.author){
        msg.author = msg.user;
      }
      if(msg.quick_replies){
        msg.suggestions=msg.quick_replies.map(x=> x.payload)
        //Object.assign(msg.suggestions, msg.quick_replies) 
      }
      return msg;
    },
    onMessageSent:function(event, msg){
      if(msg.data.match(/^clear|cls|クリア|ｸﾘｱ$/i)){
        this.messageList.length = 0;
        while(this.messageList.length>0){
          this.messageList.shift();//削除でクリア
        }
      }
    },
    onQuickReply:function(payload){
      console.log(payload);
      this.chatbot.quickReply(payload);
    }, 
    sendMessage(msg) {
        let message ={
          text: msg.data.text,
          user: this.userid,
          reply_user: "bot",
        }
        Object.assign(message, msg)
        console.log("sendMessage=================", message);
        this.chatbot.send(message, null);      
        this.newMessagesCount = this.isChatOpen
          ? this.newMessagesCount
          : this.newMessagesCount + 1

        //this.onMessageWasSent(message)
      
    },
    handleTyping(text) {
      this.showTypingIndicator =
        text.length > 0
          ? this.participants[this.participants.length - 1].id
          : ''
    },
    onMessageWasSent(message) {
      this.messageList = [...this.messageList, Object.assign({}, message, {id: Math.random()})]
      console.log("onMessageWasSent=================??????:", message);
      this.sendMessage(message);
    },
    openChat() {
      console.log("openChat==============-")
      this.isChatOpen = true
      this.newMessagesCount = 0
      this.chatbot.connect(this.userid, this.ws_url);
    },
    closeChat() {
      this.isChatOpen = false
    },
    setColor(color) {
      this.colors = this.themeColors[color]
      this.chosenColor = color
    },
    showStylingInfo() {
      this.$modal.show('dialog', {
        title: 'Info',
        text:
          'You can use *word* to <strong>boldify</strong>, /word/ to <em>emphasize</em>, _word_ to <u>underline</u>, `code` to <code>write = code;</code>, ~this~ to <del>delete</del> and ^sup^ or ¡sub¡ to write <sup>sup</sup> and <sub>sub</sub>'
      })
    },
    messageStylingToggled(e) {
      this.messageStyling = e.target.checked
    },
    handleOnType() {
      this.$root.$emit('onType')
      this.userIsTyping = true
    },
    editMessage(message){
      const m = this.messageList.find(m => m.id === message.id);
      m.isEdited = true;
      m.data.text = message.data.text;
    },
    removeMessage(message){
      if (confirm('Delete?')){
        const m = this.messageList.find(m => m.id === message.id);
        m.type = 'system';
        m.data.text = 'This message has been removed';
      }
    },
    like(id){
      const m = this.messageList.findIndex(m => m.id === id);
      var msg = this.messageList[m];
      msg.liked = !msg.liked;
      this.$set(this.messageList, m, msg);
    }
  }
};
</script>

<style>
.chat-header{
  text-align: left;
}
.el-header,
.el-footer {
  background-color: #4e8cff;
  color: #ffffff;
  text-align: center;
  line-height: 60px;
}
.el-header {
  border-radius: 10px 10px 10px 10px / 10px 10px 0px 0px;
}
.el-footer {
  border-radius: 0px 0px 10px 10px / 0px 0px 10px 10px;
}
.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
}
.el-tabs {
  width: 100%;
  height: 100%;
}
.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  line-height: 100px;
  height: 550px;
  border: 1px solid #eee;
}

body > .el-container {
  margin-bottom: 40px;
}
</style>