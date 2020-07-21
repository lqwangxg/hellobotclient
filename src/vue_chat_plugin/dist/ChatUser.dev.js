"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ChatUser =
/*#__PURE__*/
function () {
  function ChatUser(id, name, imageUrl) {
    _classCallCheck(this, ChatUser);

    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.mail = "";
    this.telno = "";
    this.imageUrl = "";
    this.messageList = [];
    this.newMessageCount = 0; //参加しているChatGroup

    this.ChatGroup = [];
  }

  _createClass(ChatUser, [{
    key: "push",
    value: function push(msg) {
      this.messageList.push(msg);
    }
  }]);

  return ChatUser;
}();

exports["default"] = ChatUser;