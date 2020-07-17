/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// import showdown from "showdown"
// var converter = new showdown.Converter();
// converter.setOption('openLinksInNewWindow', true);
import ChatMessage from "./ChatMessage.js";
export default {
  config: {
    ws_url:
      (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host,
    reconnect_timeout: 3000,
    max_reconnect: 5
  },
  options: {
    use_sockets: true,
    enable_history: false
  },
  reconnect_count: 0,
  guid: null,
  current_user: null,
  //画面表示オブジェクト
  element: null,

  on: function(event, handler) {
    //eventが発生した場合、handlerで処理
    this.element.$on(event, function(details) {
      handler(event, details);
    });
  },
  trigger: function(event, details) {
    // client内部eventが発生、外へ知らせ
    //console.log("trigger====>eventType", event, " message:", details);
    this.element.$emit(event, details);
  },
  request: function(url, body) {
    return new Promise(function(resolve, reject) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
          if (xmlhttp.status == 200) {
            var response = xmlhttp.responseText;
            if (response != "") {
              var message = null;
              try {
                message = JSON.parse(response);
              } catch (err) {
                reject(err);
                return;
              }
              resolve(message);
            } else {
              resolve([]);
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
  },
  
  send: function(msg, e) {
    var that = this;
    if (e) e.preventDefault();
    if (!msg) {
      return;
    }

    msg.user = that.current_user.id,
    msg.user_profile = that.current_user,
    msg.channel = this.options.use_sockets
    ? { type: "socket", id: that.current_user.id }
    : { type: "webhook", id: that.current_user.id }
    
    that.deliverMessage(msg);
    return false;
  },
  deliverMessage: function(message) {
    console.log("deliverMessage To ChatBotServer===>", message);
    if (this.options.use_sockets) {
      this.trySendMessage(message);
    } else {
      this.webhook(message);
    }
  },
  trySendMessage:function(message){
    if(this.socket.readyState ===1){
      this.socket.send(JSON.stringify(message));
      return true;
    }else{
      setTimeout(this.trySendMessage(message), 100);
    }
  },
  getHistory: function() {
    var that = this;
    if (that.current_user) {
      var url= that.config.ws_url.replace("ws", "http")+"/botkit/history";
      console.log("getHistory =======url:",url);
      that
        .request(url, {
          user: that.current_user.id,
        })
        .then(function(history) {
          if (history.success) {
            that.trigger("history_loaded", history.history);
          } else {
            that.trigger("history_error", new Error(history.error));
          }
        })
        .catch(function(err) {
          that.trigger("history_error", err);
        });
    }
  },
  webhook: function(message) {
    var that = this;

    that
      .request("/api/messages", message)
      .then(function(messages) {
        messages.forEach((message) => {
          that.trigger(message.type, message);
        });
      })
      .catch(function(err) {
        that.trigger("webhook_error", err);
      });
  },
  connect: function(userid, ws_url) {
    var that = this;
    if (!userid) {
      userid = Math.random()
        .toString()
        .substr(2, 6);
    }

    //同じ端末に同時に複数のクライアントを接続できるため
    const cookieID = "botkit_userid_" + userid;
    this.setCookie(cookieID, userid, 1);
    that.current_user = {
      id: userid,
      timezone_offset: new Date().getTimezoneOffset(),
    };
    //console.log("client connect :", userid);

    // connect to the chat server!
    if (ws_url) {
      that.config.ws_url = ws_url.replace("http", "ws");
    }
    if (that.options.use_sockets) {
      that.connectWebsocket(that.config.ws_url);
    } else {
      that.connectWebhook();
    }
  },
  connectWebhook: function() {
    var that = this;
    var connectEvent = "hello";
    if (this.getCookie("botkit_guid")) {
      that.guid = this.getCookie("botkit_guid");
    } else {
      that.guid = that.generate_guid();
      this.setCookie("botkit_guid", that.guid, 1);
    }

    if (this.options.enable_history) {
      that.getHistory();
    }

    // connect immediately
    that.trigger("connected", {});
    that.webhook({
      type: connectEvent,
      user: that.guid,
      channel: { type: "webhook", id: that.current_user.id },
    });
  },
  connectWebsocket: function(ws_url) {
    var that = this;
    // Create WebSocket connection.
    that.socket = new WebSocket(ws_url);

    var connectEvent = "hello";
    if (this.getCookie("botkit_guid")) {
      that.guid = this.getCookie("botkit_guid");
    }

    if (this.options.enable_history) {
      that.getHistory();
    }
    //console.log("ws_url:", ws_url);
    // Connection opened
    that.socket.addEventListener("open", function(event) {
      console.log("CONNECTED TO SOCKET");
      that.reconnect_count = 0;
      that.trigger("connected", event);
      let msg = new ChatMessage({
        type: connectEvent,
        user: that.current_user.id,
        channel: "socket",
        user_profile: that.current_user ? that.current_user : null,
      });
      that.deliverMessage(msg);
    });

    that.socket.addEventListener("error", function(event) {
      console.error("ERROR", event);
    });

    that.socket.addEventListener("close", function(event) {
      console.log("SOCKET CLOSED!");
      that.trigger("disconnected", event);
      if (that.reconnect_count < that.config.max_reconnect) {
        setTimeout(function() {
          console.log("RECONNECTING ATTEMPT ", ++that.reconnect_count);
          that.connectWebsocket(that.config.ws_url);
        }, that.config.reconnect_timeout);
      } else {
        console.log("socket addEventListener closed...");
      }
    });

    // Listen for messages
    that.socket.addEventListener("message", function(event) {
      var message = null;
      try {
        message = JSON.parse(event.data);
      } catch (err) {
        that.trigger("socket_error", err);
        return;
      }
      let msg = new ChatMessage(message);
      console.log("addEventListener==event=> ",event);
      that.trigger(message.type, msg);
    });
  },
  sendEvent: function(event) {
    if (this.parent_window) {
      this.parent_window.postMessage(event, "*");
    }
  },
  setCookie: function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  },
  getCookie: function(cname) {
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
  },
};
