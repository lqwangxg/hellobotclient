module.exports = function(controller) {
  
  controller.middleware.receive.use(function(bot, message, next) {
    //ユーザからの受信メッセージをセンターへ転送
    if(message.user){
      if(message.user!="admin"){  
        //ユーザからの情報をセンターへ転送、センターからには無視
        if(message.event && message.event!="unknown"){
          //unknownは要回答メッセージで、専用ルートにより発送します。
          controller.trigger('known', bot, message);
        }
      }else if(message.origin_user && message.origin_user !="admin"){
        //センターからの情報を特定ユーザへ転送
        controller.trigger('to_user', bot, message);
      }
    }
    console.log("middleware.receive=========type/event/text/user/reply_user/origin_user:", 
    message.type, message.event, message.text, message.user, message.reply_user, message.origin_user);
    console.log("receive ==========message", message);
    
    next();
  });

  controller.middleware.send.use(function(bot, message, next) {
    //ユーザへの送信メッセージをセンターへ転送
    if(!message.channelData.user){
      message.channelData.user= "bot";
    }
    if(message.reply_user){
      if(message.reply_user!="admin"){
        //ユーザへ送る情報をセンターへ転送、センターへ送る情報を既存通り
        controller.trigger('known', bot, message);
      }
    }
    console.log("middleware.send=========type/event/text/user/reply_user/origin_user:", 
    message.type, message.event, message.text, message.user, message.reply_user, message.origin_user);
    console.log("send ==========message", message);
    
    next();
  });

}
