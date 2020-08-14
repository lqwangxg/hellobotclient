<template>
  <div id="messageCenter">
    <el-container style="height: 550px; border: 1px solid #eee">
      <el-header>
        <el-row>
          <el-col :span="3" class="chat-header">
            <img v-if="titleImageUrl" class="sc-header--img" :src="titleImageUrl" alt="" />
          </el-col>
          <el-col :span="9" style="text-align: left;">
            <div>MBP Smartec ChatBot Control Center.</div>
          </el-col>
          <el-col :span="12" style="text-align: right;">
            <div>{{title}}</div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
          <UserList :colors="availableColors" :participants="participants" @userClick="userClick" />
        </el-aside>
        <el-main>
          <message-window :messageList="messages" @sendMessage="sendMessage" />
        </el-main>
      </el-container>
      <el-footer>Copyright © MBPSMARTEC株式会社 All rights reserved</el-footer>
    </el-container>
  </div>
</template>

<script>
import Colors from "../data/colors";
import chatParticipants from "../data/chatProfiles";
import UserList from "../vue_chat_plugin/UserList";
import messageWindow from "../vue_chat_plugin/messageWindow";
import store from "../vue_chat_plugin/store/";
import logoIcon from "../vue_chat_plugin/assets/logo.png";
import GuestIcon from "../vue_chat_plugin/assets/guest.png";
import InfoIcon from "../vue_chat_plugin/assets/information.png";
//import client from "../vue_chat_plugin/client.js";
//import ChatUser from "../vue_chat_plugin/ChatUser.js";
//import ChatMessage from "../vue_chat_plugin/ChatMessage.js";
import client from '../vue_chat_plugin/BotClient.js'
import ChatUser from "../vue_chat_plugin/ChatUserObject.js";
import ChatMessage from '../vue_chat_plugin/ChatMessageObject.js'

export default {
  name: "MessageCenter",
  components: {
    UserList,
    messageWindow
  },
  props: {
    ws_url:{
      type: String
    },
    username:{
      type: String
    }
  },
  data() {
    return {
      store,
      participants: chatParticipants,
      availableColors: Colors.blue,
      chatbot: client,
      title: "",
      mmcUser: null,
      currentUser: null,
      titleImageUrl: logoIcon,
      guestImageUrl: GuestIcon,
      mmcImageUrl: InfoIcon
    };
  },
  mounted() {
    this.mmcUser = new ChatUser(this.mmc_uid, this.mmc_uid, InfoIcon);
    this.currentUser = this.mmcUser;
    let chatUser = this.participants.find(u => u.id === this.mmcUser.id);
    if (!chatUser) {
      this.participants.push(this.mmcUser);
    }

    this.chatbot.element = this;
    this.chatbot.on("closed", this.onDisConnected);
    this.chatbot.on("connected", this.onConnected);
    this.chatbot.on("hello", this.onGuestOnline);
    this.chatbot.on("message", this.onReceived);
    this.chatbot.on("event", this.onReceived);
    this.chatbot.on("text", this.onReceived);
    this.chatbot.connect(this.mmcUser.id, this.chat_server_ws_url);
  },
  computed: {
    chat_server_ws_url() {
      let url = this.$WS_URL;
      if(this.ws_url){
        url = this.ws_url;
      }
      return url;
    },
    mmc_uid() {
      let uid = this.$MMC_UID;
      if(this.username){
        uid = this.username;
      }
      return uid;
    },    
    messages() {
      if (this.currentUser) {
        return this.currentUser.messageList;
      }
      if(this.mmcUser){
        return this.mmcUser.messageList;
      }
      return [];
    }
  },
  methods: {
    userClick(chatUser) {
      this.currentUser = this.participants.find(u => u.id === chatUser.id);
      this.title = "ようこそ、" + this.currentUser.name + "様";
    },

    onConnected: function() {
      this.chat_connected = true;
      let message = {
        type: "system",
        author: this.mmcUser.id,
        text: this.mmcUser.name + "様がサーバに接続できました。"
      };
      console.log("onConnected====>", message);

      this.title = "ようこそ、" + this.mmcUser.name + "様";
      this.showMessage(message);
      this.currentUser = this.mmcUser;
    },
    onDisConnected: function() {
      this.chat_connected = false;
      let message = {
        type: "system",
        author: this.mmcUser.id,
        text: "ネットワークが切断されました。"
      };
      console.log("onDisConnected====>", message);
      this.showMessage(message);
    },
    onReceived: function(event, message) {
      if (!message.reply_user) {
        message.reply_user = this.currentUser.id;
      }
      this.showMessage(message);
    },
    onGuestOnline: function(event, message) {
      message.type = "system";
      let userid = message.author;
      if (message.isTranfering && message.data.author) {
        userid = message.data.author;
      }
      message.text = userid + "様がサーバに接続できました。";

      this.showMessage(message);
    },
    sendMessage(message) {
      message.author = this.mmcUser.id;
      let msg = new ChatMessage(message);
      this.messages.push(msg);
      msg.addChatGroup(this.currentUser.id);
      console.log("sendMessage======:", msg);
      this.chatbot.send(msg);
    },
    showMessage(message) {
      let msg = new ChatMessage(message);
      let userid = this.getAuthor(msg);
      if (msg.isTranfering && msg.data.author) {
        userid = msg.data.author;
      }
      //const userid =this.getAuthor(msg);
      let userinfo = this.participants.find(u => u.id === userid);
      if (!userinfo) {
        userinfo = new ChatUser(userid, userid, this.guestImageUrl);
        this.participants.push(userinfo);
      }
      if (!userinfo.messageList) {
        userinfo.messageList = [];
      }
      userinfo.messageList.push(msg);
      if (this.currentUser.id != userinfo.id) {
        userinfo.newMessageCount++;
      }
    },
    getAuthor(msg) {
      if (msg.reply_user && msg.reply_user != "bot") return msg.reply_user;
      if (msg.author && msg.author != "bot") return msg.author;

      return msg.author;
    },
    onClose(){
      //処理なし
    }
  }
};
</script>

<style>
.chat-header {
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
  height: 550px;
}

.el-main {
  background-color: #efeff3;
  color: #333;
  text-align: center;
  line-height: 50px;
  border: 1px solid #eee;
  height: 100%;
}
#messageCenter {
  height: 550px;
}

.sc-header--img {
  border-radius: 50%;
  align-self: center;
  padding: 10px;
}
</style>