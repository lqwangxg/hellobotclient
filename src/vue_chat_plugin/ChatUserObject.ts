import ChatMessage from "./ChatMessageObject";

export interface IChatUser{
  username: string;
  password?: string;
  realname?: string;
  nickname?: string;

  mail?: string;
  telno?: string;
  imageUrl?: string;

  messageList?: Array<ChatMessage>;
}

export class ChatUser implements IChatUser{
  readonly username: string;
  realname: string;
  nickname: string;

  constructor(user: string){
    this.username = user;
    this.realname = user;
    this.nickname = user;
  }
    
}