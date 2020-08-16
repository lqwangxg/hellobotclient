import  ChatUserObject  from "./ChatUserObject";

/**
 * message of quick_reply.
 */
type quick_reply={
  title:string,
  payload:string,
  content_type: "text"
}

/**
 * message type of file.
 */
type fileType={
  name: string,
  url: string
}
/**
 * 
 */
type MessageDataType = {
  type?: string,
  text?: string,
  channel?: string,
  user: string,
  quick_replies?:Array<quick_reply>,
  file?: fileType,
  author?:string,
  received?:boolean,
  from?:string
}
export default class ChatMessageObject {
  readonly type: string;
  readonly text: string;
  readonly user: string;
  readonly channel: string;
  readonly author: string;
  readonly suggestions?:Array<string>;
  readonly received?:boolean;
  readonly file?: fileType;
  from?:string;

  recipient?: string | string[];
  user_profile?: ChatUserObject;
  data?:MessageDataType;

  constructor(msg: any) {
    this.type = msg.type ? msg.type : "message";
    this.text = msg.text;
    this.received = msg.received ? msg.received : false;
    this.from = msg.from;
    
    this.channel = msg.channel ? msg.channel : "socket";
    this.data = Object.assign({}, msg);
    
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
    if(msg.data){
      if(msg.data.text && !msg.text){
        this.text = msg.data.text;
      }
    }
    if(msg.file){
      this.file = msg.file;
    }
    if(msg.received){
      this.from = this.user;
    }
    if(msg.quick_replies){
      this.suggestions = msg.quick_replies.map((qr:quick_reply)=> {return qr.title });
    }
    this.author = this.user;
  }

}