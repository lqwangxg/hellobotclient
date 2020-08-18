"use strict";
exports.__esModule = true;
var ChatMessageObject = /** @class */ (function () {
    function ChatMessageObject(msg) {
        this.type = msg.type ? msg.type : "message";
        this.received = msg.received ? msg.received : false;
        this.channel = msg.channel ? msg.channel : "socket";
        if (msg.text) {
            this.data = { text: msg.text };
            this.text = msg.text;
        }
        else if (msg.data && msg.data.text) {
            this.data = { text: msg.data.text };
            this.text = msg.data.text;
        }
        else {
            this.data = { text: "" };
            this.text = "";
        }
        if (msg.user) {
            this.user = msg.user;
            this.author = msg.user;
        }
        else if (msg.author) {
            this.user = msg.author;
            this.author = msg.author;
        }
        else {
            this.user = "bot";
            this.author = "bot";
        }
        if (msg.recipient) {
            this.recipient = msg.recipient;
        }
        else {
            this.recipient = "bot";
        }
        if (msg.file) {
            this.file = msg.file;
        }
        if (msg.quick_replies) {
            this.suggestions = msg.quick_replies.map(function (qr) { return qr.title; });
        }
    }
    return ChatMessageObject;
}());
exports["default"] = ChatMessageObject;
