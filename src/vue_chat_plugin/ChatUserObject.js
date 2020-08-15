"use strict";
exports.__esModule = true;
var ChatUser = /** @class */ (function () {
    function ChatUser(id, name, imageUrl) {
        this.id = id;
        this.username = name;
        this.imageUrl = imageUrl;
        this.mail = "";
        this.telno = "";
        this.imageUrl = "";
        this.messageList = [];
        this.newMessageCount = 0;
        //参加しているChatGroup
        this.ChatGroup = [];
    }
    ChatUser.prototype.push = function (msg) {
        this.messageList.push(msg);
    };
    return ChatUser;
}());
exports["default"] = ChatUser;
