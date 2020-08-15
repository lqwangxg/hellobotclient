import ChatMessage from "./ChatMessageObject";

export default class ChatUser {
  id: string;
  username: string;
  imageUrl: string; 
  realname?: string;
  nickname?: string;
  
  mail?: string;
  telno?: string;
  
  messageList?:Array<ChatMessage>;
  newMessageCount?:Number;
  ChatGroup?:Array<any>;

  constructor(id: string , name?:string, imageUrl?:string){
    this.id = id;
    this.username = name;
    this.imageUrl = imageUrl;
    this.mail ="";
    this.telno ="";
    this.imageUrl ="";

    this.messageList = [];
    this.newMessageCount = 0;

    //参加しているChatGroup
    this.ChatGroup = [];
  }
  
  push(msg: ChatMessage){
    this.messageList.push(msg);
  }

}