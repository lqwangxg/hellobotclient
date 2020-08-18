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
      :on-message-was-sent="sendMessage"
      :open="openChat"
      :participants="participants"
      :show-close-button="false"
      :show-launcher="true"
      :show-emoji="false"
      :show-file="false"
      :showTypingIndicator="showTypingIndicator"
      :showEdition="false"
      :showDeletion="false"
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
import client from './BotClient.js'
import ChatMessage from './ChatMessageObject.js'
import logoIcon from "./assets/logo.png";
import store from './store/'
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
      store,
      title:'',
      titleImageUrl: logoIcon,
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
      guestImageUrl:"./assets/guest.png"
    }
  },
  created() {
    if(!this.store.currentUser){
      this.store.currentUser = {}
    }
    let userid =this.username;
    if(!userid){
      userid = Math.random().toString().substr(2,6);
    }
    this.store.currentUser.id = userid;
    this.setColor('blue')
    this.messageList = this.messageHistory? this.messageHistory:[]
  },
  mounted(){
    this.messageList.forEach(x=>x.liked = false);
    this.chatbot.element = this;
    this.chatbot.ws_url = this.ws_url;
    this.chatbot.on('disconnected', this.onDisConnected);
    this.chatbot.on('connected', this.onConnected);
    this.chatbot.on('message', this.onReceived);
    this.chatbot.on('event', this.onReceived);    
    this.chatbot.on('text', this.onReceived);
  },
  methods: {
    onConnected:function(details){
      this.chat_connected = true;
      const message = {
        type: "system",
        user: this.store.currentUser.id,
        text: this.store.currentUser.id + '様がサーバに接続できました。'
      }
      let msg = new ChatMessage(message);

      this.title="ようこそ、" + this.store.currentUser.id +"様"; 
      console.log(msg, details);
    
      this.messageList.push(msg);//頭から追加
    },
    onDisConnected:function( ){
      this.chat_connected = false;
      const message ={
        type: "system",
        user: this.store.currentUser.id,
        text: "ネットワークが切断されました。"
      }
      let msg = new ChatMessage(message);
      console.log(msg);
      this.messageList.push(msg);//頭から追加
    },
    onReceived:function(event, message){
      if(message.type==="message"){
        message.type="text"
      }
      //let msg = new ChatMessage(message);      
      this.messageList.push(message);
    },
    handleTyping(text) {
      this.showTypingIndicator =
        text.length > 0
          ? this.participants[this.participants.length - 1].id
          : ''
    },
    sendMessage(message) {
      this.messageList = [...this.messageList, Object.assign({}, message)]
      console.log("sendMessage from User=====:", message);
      let msg = new ChatMessage(message); 
      this.chatbot.send(msg);
    },
    openChat() {
      this.isChatOpen = true
      this.newMessagesCount = 0
      this.chatbot.connect(this.store.currentUser.id, this.ws_url);
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
