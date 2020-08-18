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
          <el-tabs v-model="activeTabName" type="card"  @tab-click="handleTabsEdit">
            <el-tab-pane  v-for="user in guests" :key="user.id" :label="user.id" :name="user.name">
              <message-window :messageList="messageList" @sendMessage="sendMessage" />
            </el-tab-pane>
          </el-tabs>
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
import MessageWindow from "../vue_chat_plugin/MessageWindow";
import store from "../vue_chat_plugin/store/";
import logoIcon from "../vue_chat_plugin/assets/logo.png";
import GuestIcon from "../vue_chat_plugin/assets/guest.png";
import InfoIcon from "../vue_chat_plugin/assets/information.png";
import client from '../vue_chat_plugin/BotClient.js'
import ChatUser from "../vue_chat_plugin/ChatUserObject.js";
import ChatMessage from '../vue_chat_plugin/ChatMessageObject.js'

export default {
  name: "MessageCenter",
  components: {
    UserList,
    MessageWindow
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
      guests:null,
      availableColors: Colors.blue,
      chatbot: client,
      title: "",
      mmcUser: null,
      currentUser: null,
      titleImageUrl: logoIcon,
      guestImageUrl: GuestIcon,
      mmcImageUrl: InfoIcon,
      messageList: [],
      activeTabName:""
    };
  },
  mounted() {
    
    this.guests=this.participants.filter(user=>!user.hidden);
    this.activeTabName = this.mmc_uid;
    this.mmcUser = new ChatUser(this.mmc_uid,this.mmc_uid, InfoIcon);
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
    currentDisplayMessages() {
      return this.messageList;
    }
  
  },
  methods: {
    userClick(chatUser) {
      this.currentUser = this.participants.find(u => u.id === chatUser.id);
      this.title = "ようこそ、" + this.currentUser.name + "様";
    },
    
    handleTabsEdit() {
        
    },
    onConnected: function() {
      this.chat_connected = true;
      let message = {
        type: "system",
        author: this.mmcUser.id,
        text: this.mmcUser.id + "様がサーバに接続できました。"
      };
      console.log("onConnected====>", message);
      this.title = "ようこそ、" + this.mmcUser.id + "様";
      let msg = new ChatMessage(message);
      this.showMessage(msg);
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
      message.user = this.mmcUser.id;
      let msg = new ChatMessage(message);
      msg.reply_user =this.currentUser.id;

      console.log("sendMessage======:", msg);
      this.showMessage(msg);
      this.chatbot.send(msg);
    },
    showMessage(msg) {
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
      this.messageList.push(msg);
      // if (!userinfo.messageList) {
      //   userinfo.messageList = [];
      // }
      // userinfo.messageList.push(msg);
      // if (this.mmcUser.id != userinfo.id) {
      //   userinfo.newMessageCount++;
      // }
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