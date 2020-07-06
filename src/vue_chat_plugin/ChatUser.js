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
  
}