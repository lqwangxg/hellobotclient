"use strict";
exports.__esModule = true;
var ChatMessage = /** @class */ (function () {
    function ChatMessage(msg) {
        this.type = msg.type ? msg.type : "message";
        this.text = msg.text;
        this.received = msg.received ? msg.received : false;
        this.from = msg.from;
        this.channel = msg.channel ? msg.channel : "socket";
        this.data = Object.assign({}, this.data, msg);
        if (!msg.user) {
            if (msg.author) {
                this.user = msg.author;
                this.author = msg.author;
            }
            else {
                this.user = "bot";
                this.author = "bot";
            }
        }
        else {
            this.user = msg.user;
            this.author = msg.user;
        }
        if (msg.data) {
            if (msg.data.text && !msg.text) {
                this.text = msg.data.text;
            }
        }
        if (msg.file) {
            this.file = msg.file;
        }
        if (msg.received) {
            this.from = this.user;
        }
        if (msg.quick_replies) {
            this.suggestions = msg.quick_replies.map(function (qr) { return qr.title; });
        }
        this.author = this.user;
    }
    return ChatMessage;
}());
exports["default"] = ChatMessage;
