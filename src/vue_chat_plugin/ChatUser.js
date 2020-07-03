export default class ChatUser {
  
  constructor(id, name, imageUrl){
    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;

    this.messageList = [];
    this.newMessageCount = 0;

    //参加しているChatGroup
    this.ChatGroup = [];
  }

  push(msg){
    this.messageList.push(msg);
  }
  
  mine(msg){
    if( msg.author && msg.author === this.id ) return true;
    if( msg.user && msg.user === this.id) return true;
    if( msg.reply_user && msg.reply_user === this.id) return true;
    if(Array.isArray(msg.groups)){
      return msg.groups.includes(this.id);
    }
    return false;
  }

}