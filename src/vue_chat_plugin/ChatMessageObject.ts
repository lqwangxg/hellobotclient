import { IChatUser } from "./ChatUserObject";
type quick_reply={
  title:string,
  payload:string,
  content_type: "text"
}
type MessageDataType = {
  type?: string,
  text?: string,
  channel?: string,
  user: string,
  quick_replies?:Array<quick_reply>,
  file?: {
    name: string,
    url: string
  },
  data?:{text?: string},
  author?:string,
  received?:boolean
}
export default class ChatMessage {
  readonly type: string;
  readonly text: string;
  readonly user: string;
  readonly channel: string;
  readonly author: string;
  readonly suggestions?:Array<string>;
  readonly received?:boolean
  data?: MessageDataType;

  recipient?: string | string[];
  user_profile?: IChatUser;

  constructor(msg: MessageDataType) {
    this.type = msg.type ? msg.type : "message";
    this.text = msg.text;
    this.received = msg.received ? msg.received : false;
    
    this.channel = msg.channel ? msg.channel : "socket";
    this.data = Object.assign({}, this.data, msg);
    if(!msg.user){
      if(msg.author){
        this.user = msg.author;
        this.author = msg.author;
      }else{
        this.user = "bot";
        this.author ="bot";
      }      
    }else{
      this.user = msg.user;
      this.author = msg.user;
    }
    if(msg.data && msg.data.text && !msg.text){
      this.text = msg.data.text;
    }
        
    if(msg.quick_replies){
      this.suggestions = msg.quick_replies.map((qr:quick_reply)=> {return qr.title });
    }
    this.author = this.user;
  }

}