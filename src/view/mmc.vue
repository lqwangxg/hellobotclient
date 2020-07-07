<template>
  <div id="messageCenter">
    <el-container style="height: 550px; border: 1px solid #eee">
      <el-header>
        <el-row>
          <el-col :span="12" class="chat-header">
            <div>MBP Smartec ChatBot Control Center.</div>
          </el-col>
          <el-col :span="12">
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

      <el-footer>Copyright © 2019-2024 Company Co. All rights reserved</el-footer>
    </el-container>
  </div>
</template>

<script>
import Colors from "../data/colors";
import chatParticipants from "../data/chatProfiles";
import UserList from "../vue_chat_plugin/UserList";
import messageWindow from "../vue_chat_plugin/messageWindow";
import store from "../vue_chat_plugin/store/";
import client from "../vue_chat_plugin/client.js";
import GuestIcon from "../vue_chat_plugin/assets/guest.png";
import InfoIcon from "../vue_chat_plugin/assets/information.png";
import ChatUser from "../vue_chat_plugin/ChatUser.js";
import ChatMessage from "../vue_chat_plugin/ChatMessage.js";

export default {
  name: "MessageCenter",
  components: {
    UserList,
    messageWindow
  },
  data() {
    return {
      store,
      participants: chatParticipants,
      availableColors: Colors.blue,
      chatbot: client,
      title: "",
      mmcUser: new ChatUser(this.$MMC_UID, this.$MMC_UID, InfoIcon),
      currentUser: null,
      guestImageUrl: GuestIcon,
      mmcImageUrl: InfoIcon
    };
  },
  mounted() {
    this.chatbot.element = this;
    this.chatbot.on("disconnected", this.onDisConnected);
    this.chatbot.on("connected", this.onConnected);
    this.chatbot.on("hello", this.onGuestOnline);
    this.chatbot.on("message", this.onReceived);
    this.chatbot.on("event", this.onReceived);
    this.chatbot.on("text", this.onReceived);
    this.chatbot.connect(this.mmcUser.id, this.$WS_URL);
    this.currentUser = this.mmcUser;
    let chatUser = this.participants.find(u => u.id === this.mmcUser.id);
    if (!chatUser) {
      this.participants.push(this.mmcUser);
    }
  },
  computed: {
    messages() {
      if (this.currentUser) {
        return this.currentUser.messageList;
      }
      return this.mmcUser.messageList;
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
    }
    // //=============================================
    // //ここから下は削除予定
    // //=============================================
    // getSuggestions() {
    //   return this.messages.length > 0
    //     ? this.messages[this.messages.length - 1].suggestions
    //     : [];
    // },
    // handleTyping(text) {
    //   this.showTypingIndicator =
    //     text.length > 0
    //       ? this.participants[this.participants.length - 1].id
    //       : ''
    // },
    // setColor(color) {
    //   this.colors = this.themeColors[color]
    //   this.chosenColor = color
    // },
    // showStylingInfo() {
    //   this.$modal.show('dialog', {
    //     title: 'Info',
    //     text:
    //       'You can use *word* to <strong>boldify</strong>, /word/ to <em>emphasize</em>, _word_ to <u>underline</u>, `code` to <code>write = code;</code>, ~this~ to <del>delete</del> and ^sup^ or ¡sub¡ to write <sup>sup</sup> and <sub>sub</sub>'
    //   })
    // },
    // messageStylingToggled(e) {
    //   this.messageStyling = e.target.checked
    // },
    // handleOnType() {
    //   this.$root.$emit('onType')
    //   this.userIsTyping = true
    // },
    // editMessage(message){
    //   const m = this.messageList.find(m => m.id === message.id);
    //   m.isEdited = true;
    //   m.data.text = message.data.text;
    // },
    // removeMessage(message){
    //   if (confirm('Delete?')){
    //     const m = this.messageList.find(m => m.id === message.id);
    //     m.type = 'system';
    //     m.data.text = 'This message has been removed';
    //   }
    // },
    // like(id){
    //   const m = this.messageList.findIndex(m => m.id === id);
    //   var msg = this.messageList[m];
    //   msg.liked = !msg.liked;
    //   this.$set(this.messageList, m, msg);
    // }
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
</style>