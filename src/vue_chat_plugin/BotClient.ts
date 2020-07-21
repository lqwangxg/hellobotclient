import ChatMessage  from "./ChatMessageObject";
import { IChatUser, ChatUser } from "./ChatUserObject";

interface IBotClient{
  connect(userid:string, ws_url: string):void;
  connectWebsocket(ws_url: string):void;
  connectWebHook():void;

  on(event: string, hander: Function);
  trigger(event:string, details: object);
  
  request(url: string, body: object);
  send(message: ChatMessage, event: Event);
}

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

class BotClient implements IBotClient{
  options: Options = {
    ws_url : (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host,
    use_sockets: true,
    max_reconnect :5,
    reconnect_timeout: 3000,
    enable_history:false,
    userid: Math.random().toString().substr(2, 6),
  };
  element: any = this.options.element;
  reconnect_count: number = 0;
  socket?: WebSocket;


  constructor(options?: Options){
    Object.assign(this.options, options);
    if(this.options.http_url){
      this.options.ws_url = this.options.http_url.replace("http","ws");
    }
  }

  connect(userid?: string, http_url?: string): void {
    if(userid){
      this.options.userid = userid;
    }
    this.setCookie("userid", this.options.userid, 1);
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

  connectWebsocket(): void {
    let that = this;
    that.socket = new WebSocket(that.options.ws_url);

    //接続イベント
    that.socket.addEventListener("open", function(event: Event){
      console.log("CONNECTED TO SOCKET");
      that.reconnect_count = 0;
      let msg = new ChatMessage({
        type: "hello",
        user:  that.options.userid
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
        var message = JSON.parse(event.data);
        message.received = true;
        let msg = new ChatMessage(message);
        console.log("on message received==msg=> ", msg);
        that.trigger(message.type, msg);
      } catch (err) {
        that.trigger("socket_error", err);
        return;
      }      
    });

  }

  connectWebHook(): void {
    var that = this;
    var eventname = "hello";
    var message = new ChatMessage({
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

  request(url: string, body: ChatMessage) {
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
  
  send(message: ChatMessage, event?: Event) {
    let that = this;
    if(event) event.preventDefault();
     
    message.user_profile = that.getUserProfile(message.author);
    if (that.options.use_sockets) {
      that.trySendMessage(message);
    } else {
      that.webhook(message);
    }
  }
  
  webhook(message: ChatMessage) {
    var that = this;
    that
    .request("/api/messages", message)
    .then(function(messages:ChatMessage| Array<ChatMessage>) {
      if(Array.isArray(messages)){
        messages.forEach((msg: ChatMessage) =>{
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

  trySendMessage(message: ChatMessage){
    console.log("socket send message: ", message);
    if(this.socket.readyState === 1){
      this.socket.send(JSON.stringify(message));
      return true;
    }else{
      setTimeout(this.trySendMessage, 100, message);
    }
  }
  
  getUserProfile(userid: string): IChatUser{
    if(this.options.userid){
      //localStorageへ検索
    }
    return new ChatUser(userid);
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