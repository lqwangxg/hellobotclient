import ChatMessage from "./ChatMessageObject";

export default class ChatUser {
  readonly id: string;
  name: string;
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
    this.name = name;
    this.imageUrl = imageUrl;

    this.messageList = [];
    this.newMessageCount = 0;

    //参加しているChatGroup
    this.ChatGroup = [];
  }
  
  push(msg: ChatMessage){    
    this.messageList.push(msg);
  }
}