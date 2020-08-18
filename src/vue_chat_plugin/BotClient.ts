import ChatMessageObject  from "./ChatMessageObject";
import ChatUserObject from "./ChatUserObject";
import { createLocalStorage } from "localstorage-ponyfill";

/**
 * Interface of BotClient. public methods:
 * connect(userid:string, ws_url: string):void;
 * connectWebsocket(ws_url: string):void;  
 * connectWebhook()void;
 * 
 * on(event:string, handler: Function): void;
 * trigger(event:string, details: object:) void;
 * 
 * request(url:string, body:object):void;
 * send(message:ChatMessageObject, event:Event):void;
 */
interface IBotClient{
  /**
   * connect to server with userid and ws_url. 
   * @param userid 
   * @param ws_url 
   */
  connect(userid:string, ws_url: string):void;
  /**
   * connect server by websocket.
   * change http prefix to ws prefix. like http=>ws, https=>wss.
   * @param ws_url 
   */
  connectWebsocket(ws_url: string):void;
  /**
   * connect server by webhook.
   */
  connectWebHook():void;

  /**
   * on open, close, send, receive, error, do something.
   * @param event 
   * @param hander 
   */
  on(event: string, hander: Function):void;
  /**
   * on trigger event coming.  
   * @param event 
   * @param details 
   */
  trigger(event:string, details: object):void;
  
  /**
   * request for receive response. 
   * @param url 
   * @param body 
   */
  request(url: string, body: object):void;
  /**
   * send message. if(event) event.preventDefault();
   * @param message 
   * @param event 
   */
  send(message: ChatMessageObject, event: Event):void;
}

/**
 * connect options of BotClient.
 */
type Options = {
  ws_url:string,
  http_url?: string,
  use_sockets?: boolean,
  max_reconnect?: number,
  reconnect_timeout?: number,
  enable_history?:boolean,
  userid?:string,
  element?: any,
}

/**
 * Botclient.
 */
class BotClient implements IBotClient{
  /**
   * options of Botclient.
   */
  options: Options = {
    ws_url : (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host,
    use_sockets: true,
    max_reconnect :5,
    reconnect_timeout: 3000,
    enable_history:false,
    userid: Math.random().toString().substr(2, 6),
  };

  /**
   * htmlElement for BotClient event handler. 
   */
  element: any = this.options.element;
  /**
   * try to reconnect count 
   */
  reconnect_count: number = 0;
  /**
   * socket of connect to server.
   */
  socket?: WebSocket;
  /**
   * localStorage for saving user info under.
   */ 
  localStorage= createLocalStorage();
  /**
   * BotClient user infomation.
   */
  user_profile?:ChatUserObject = null;

  /**
   * constructor of BotClient.
   * @param options 
   */
  constructor(options?: Options){
    Object.assign(this.options, options);
    if(this.options.http_url){
      this.options.ws_url = this.options.http_url.replace("http","ws");
    }
  }

  /**
   * connect to server with userid and ws_url. 
   * @param userid 
   * @param http_url 
   */
  connect(userid?: string, http_url?: string): void {
    if(userid){
      this.options.userid = userid;
    }
    this.setCookie("userid", this.options.userid, 1);
    this.user_profile = this.getUserProfile( this.options.userid);
    //TODO:ユーザーIDにより、ユーザ基本情報を取得
    
    if(http_url){
      this.options.ws_url = http_url.replace("http", "ws");
    }

    if(this.options.use_sockets){
      this.connectWebsocket();
    }else{
      this.connectWebHook();
    }
  }

  /**
   * connect to sever by websocket.
   */
  connectWebsocket(): void {
    let that = this;
    that.socket = new WebSocket(that.options.ws_url);

    /**
     * addEventListener for open connect event.
     */
    that.socket.addEventListener("open", function(event: Event){
      console.log("CONNECTED TO SERVER BY SOCKET");
      that.reconnect_count = 0;
      let msg = new ChatMessageObject({
        type: "hello",
        user:  that.options.userid,
        text: "CONNECTED TO SERVER BY SOCKET" 
      });      
      that.send(msg, event);
      that.trigger("connected", msg); 
    });

    that.socket.addEventListener("error", function(event: Event){
      console.error("ERROR", event);
    });

    that.socket.addEventListener("close", function(event: CloseEvent){
      console.log("SOCKET CLOSED!");
      that.trigger("closed", event);
      if (that.reconnect_count < that.options.max_reconnect) {
        setTimeout(function() {
          console.log("RECONNECTING ATTEMPT ", ++that.reconnect_count);
          that.connectWebsocket();
        }, that.options.reconnect_timeout);
      } else {
        console.log("socket addEventListener closed...");
      }
    });

    // Listen for messages received.
    that.socket.addEventListener("message", function(event: MessageEvent) {
      try {
        let message = JSON.parse(event.data);
        console.log("addEventListener ==event.data=> ", event.data);
        message.received = true;
        
        let msg = new ChatMessageObject(message);
        console.log("addEventListener ==msg=> ", msg);
        that.trigger(message.type, msg);
        let msgArray:Array<ChatMessageObject> = []; 
        let messageList = localStorage.getItem("messageList");
        if(messageList){
          msgArray = JSON.parse(messageList);
        }
        msgArray.push(msg);
        localStorage.setItem("messageList", JSON.stringify(msgArray));
      } catch (err) {
        that.trigger("socket_error", err);
        return;
      }      
    });

  }

  connectWebHook(): void {
    var that = this;
    var eventname = "hello";
    var message = new ChatMessageObject({
      type: eventname,
      user: that.options.userid,
      channel:"webhook"
      //channel: { type: "webhook", id: that.options.userid },
    });

    that.webhook(message);
    // connect immediately
    that.trigger("connected", message);    
  }

  on(event: string, handler?: (event: string, ev: any) => any) {
    this.element.$on(event, function(details:any){
      handler(event, details);
    });
  }
  trigger(event: string, details: object) {
    this.element.$emit(event, details);
  }

  request(url: string, body: ChatMessageObject) {
    return new Promise(function(resolve, reject) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
          if (xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            if (response != "") {
              try {
                var message = JSON.parse(response);
                resolve(message);
              } catch (err) {
                reject(err);
                return;
              }
            } else {
              resolve({});
            }
          } else {
            reject(new Error("status_" + xmlhttp.status));
          }
        }
      };

      xmlhttp.open("POST", url, true);
      xmlhttp.setRequestHeader("Content-Type", "application/json");
      xmlhttp.send(JSON.stringify(body));
    });
  }
  
  send(message: ChatMessageObject, event?: Event) {
    let that = this;
    if(event) event.preventDefault();

    message.user_profile = that.getUserProfile(message.author);
    if (that.options.use_sockets) {
      that.trySendMessage(message);
    } else {
      that.webhook(message);
    }
  }
  
  trySendMessage(message: ChatMessageObject){
    let that = this;
    console.log("socket send message: ", message);
    if(that.socket.readyState === 1){
      that.socket.send(JSON.stringify(message));
      return true;
    }else{
      setTimeout(that.trySendMessage, 100, message);
    }
  }

  webhook(message: ChatMessageObject) {
    var that = this;
    that
    .request("/api/messages", message)
    .then(function(messages:ChatMessageObject| Array<ChatMessageObject>) {
      if(Array.isArray(messages)){
        messages.forEach((msg: ChatMessageObject) =>{
          that.trigger(msg.type, msg);
        })
      }else{
        that.trigger(messages.type, messages);
      }
    })
    .catch(function(err) {
      that.trigger("webhook_error", err);
    });
  }
  
  getUserProfile(userid: string): ChatUserObject{
    if(this.options.userid){
      //localStorageへ検索
      let userinfo = localStorage.getItem(this.options.userid);
      if(!userinfo){
        let ui = new ChatUserObject(userid);
        localStorage.setItem("userid", JSON.stringify(ui));
        return ui;
      }else{
        return JSON.parse(userinfo)
      }
    }

    return new ChatUserObject(userid);
  }
  //==============================================
  /**
   * Cookie set/get
  */
  setCookie(cname:string, cvalue:any, exdays:number) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  getCookie(cname: string) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
}
let client = new BotClient();
export default client;