<template>
  <div >
    <Launcher 
      :always-scroll-to-bottom="alwaysScrollToBottom"
      :close="closeChat"
      :colors="colors"
      :is-open="isChatOpen"
      :message-list="messageList"
      :message-styling="messageStyling"
      :new-messages-count="newMessagesCount"
      :on-message-was-sent="onMessageWasSent"
      :open="openChat"
      :participants="participants"
      :show-close-button="true"
      :show-launcher="true"
      :show-emoji="false"
      :show-file="false"
      :showTypingIndicator="showTypingIndicator"
      :showEdition="true"
      :showDeletion="true"
      :title="title"
      :titleImageUrl="titleImageUrl"
      @onType="handleOnType"
      @edit="editMessage"
      @remove="removeMessage"
    >
      <template v-slot:text-message-toolbox="scopedProps">
        <button v-if="!scopedProps.me && scopedProps.message.type==='text'" @click.prevent="like(scopedProps.message.id)">
          👍
        </button>
      </template>
      <template v-slot:text-message-body="scopedProps"> 
        <p class="sc-message--text-content" v-html="scopedProps.messageText"></p>
        <p v-if="scopedProps.message.data.meta" class='sc-message--meta' :style="{color: scopedProps.messageColors.color}">{{scopedProps.message.data.meta}}</p>
        <p v-if="scopedProps.message.isEdited || scopedProps.message.liked" class='sc-message--edited'>
          <template v-if="scopedProps.message.isEdited">✎</template>
          <template v-if="scopedProps.message.liked">👍</template>
        </p>
      </template>
      <template v-slot:system-message-body="{ message }">
        [System]: {{message.text}}
      </template>
    </Launcher>
  </div>
</template>

<script>
import Launcher from './Launcher.vue'
import client from './client.js'

export default {
  components: {
    Launcher
  },
  props: {
    username:{
      type:String
    },
    participants: {
      type: Array,
      required: true
    },
    messageHistory: {
      type: Array
    },
    themeColors:{
      type: Object,
      required: true
    },
    ws_url:{
      type: String
    }
  },
  data() {
    return {
      title:'',
      titleImageUrl:
        'https://github.com/lqwangxg/resources/blob/master/animals/yongo2.png?raw=true',
      messageList: [],
      newMessagesCount: 0,
      isChatOpen: false,
      showTypingIndicator: '',
      colors: null,
      chosenColor: null,
      alwaysScrollToBottom: true,
      messageStyling: true,
      userIsTyping: false,
      chatbot: client,
      userid:''
    }
  },
  created() {
    this.userid = this.username;
    this.setColor('blue')
    //this.messageList = []
    this.messageList = this.messageHistory? this.messageHistory:[]
  },
  methods: {
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
  },
  computed: {
    isAdmin(){
      return this.userid==="admin"
    },
    linkColor() {
      return this.chosenColor === 'dark'
        ? this.colors.sentMessage.text
        : this.colors.launcher.bg
    },
    backgroundColor() {
      return this.chosenColor === 'dark' ? this.colors.messageList.bg : '#fff'
    }
  },
  mounted(){
    this.messageList.forEach(x=>x.liked = false);

    //this.userid = Math.random().toString().substr(2,6);
    if(!this.userid){
      this.userid = Math.random().toString().substr(2,6);
    }
    this.chatbot.element = this;
    this.chatbot.on('disconnected', this.onDisConnected);
    this.chatbot.on('connected', this.onConnected);
    this.chatbot.on('message', this.onReceived);
    this.chatbot.on('text', this.onReceived);
    //this.chatbot.on('system', this.onSystemMessageReceived);
    //this.chatbot.on('sent', this.onMessageSent);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
