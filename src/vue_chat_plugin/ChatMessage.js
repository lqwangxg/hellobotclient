export default class ChatMessage {
  author="bot";
  type ="text";
  data = {};
  suggestions=[];
  
  constructor(msg){
    //既存情報を保存
    Object.assign(this, msg);

    if (msg.type === "message") {
      this.type = "text";
    }
    if (msg.text) {
      this.data.text = msg.text;
    }
    if (msg.user) {
      this.author = msg.user;
    }
    if (msg.quick_replies) {
      this.suggestions = msg.quick_replies.map(x => x.payload);
    }
  }

}