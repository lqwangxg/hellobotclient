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
          <message-window />
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

export default {
  name: "MessageCenter",
  props: {
    messageList: {
      type: Array,
      default: () => []
    }
  },
  components: {
    UserList,
    messageWindow
  },
  data() {
    return {
      participants: chatParticipants,
      availableColors: Colors.blue
    };
  },
  computed: {
    messages() {
      let messages = this.messageList;

      return messages;
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
    onUserInputSubmit() {
      console.log("onUserInputSubmit");
    },
    onMessageWasSent() {}
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