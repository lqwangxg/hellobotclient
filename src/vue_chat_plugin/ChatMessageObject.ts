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
  author?:string,
  user: string,
  quick_replies?:Array<quick_reply>,
  file?: fileType,
  received?:boolean,
  channel?: string
}
export default class ChatMessageObject {
  readonly type: string;
  readonly text: string;
  readonly author: string;
  readonly user: string;
  readonly suggestions?:Array<string>;
  readonly file?: fileType;
  readonly received?:boolean;
  readonly channel: string;
  
  user_profile?: ChatUserObject;
  data?:{text:string};

  constructor(msg: any) {
    this.type = msg.type ? msg.type : "message";
    this.received = msg.received ? msg.received : false;
    this.channel = msg.channel ? msg.channel : "socket";

    if(msg.text){
      this.data = { text: msg.text }
      this.text = msg.text; 
    }else if(msg.data && msg.data.text){
      this.data ={ text: msg.data.text }
      this.text = msg.data.text
    }else {
      this.data ={text:""}
      this.text = ""
    }

    if(msg.user){
      this.user = msg.user;
      this.author = msg.user;
    }else if(msg.author){
      this.user = msg.author;
      this.author = msg.author;
    }else{
      this.user = "bot";
      this.author ="bot";
    }    
    
    if(msg.file){
      this.file = msg.file;
    }
    
    if(msg.quick_replies){
      this.suggestions = msg.quick_replies.map((qr:quick_reply)=> {return qr.title });
    }
  }
}