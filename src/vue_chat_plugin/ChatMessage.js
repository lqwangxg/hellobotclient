export default class ChatMessage {
  author="bot";
  type ="text";
  data = {text:"", group: ["bot"]};
  suggestions=[];
  text ="";

  constructor(msg){
    //既存情報を保存
    Object.assign(this, msg);

    if (msg.type === "message") {
      this.type = "text";
    }

    if(typeof msg ==="string"){
      this.text = msg;
    }
    if (msg.text) {
      this.text = msg.text;
    }else if (msg.data && msg.data.text) {
      this.text = msg.data.text;
    }

    if(this.text){
      this.data.text = this.text;
    }else if(this.data.text && !this.text){
      this.text = this.data.text;
    }
    if (msg.user) {
      this.author = msg.user;
    }else if (msg.author) {
      this.author = msg.author;
    }
    
    if (msg.quick_replies) {
      this.suggestions = msg.quick_replies.map(x => x.payload);
    }

    if(!this.data.group){
      this.data.group = ["bot"];
    }
    if(!this.data.group.includes(this.author)){
      this.data.group.push(this.author);
    }
  }

  addChatGroup = function(id){
    if(this.data.group.includes(id)){
      return;
    }
    this.data.group.push(id);
  }
  
}