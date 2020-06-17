const utils = require("../service/utils");
const detectTextIntent = require("../service/df-intent");
const getMovieDetail = require("../service/movie");

module.exports = function(controller) {

  //ユーザからのメッセージを解析
  controller.on('user_say,message',  onUnknowMessage);
  
  async function onUnknowMessage(bot, message){
    console.log(`onUnknowMessage :${message.type}, ${message.user} `);
    if (message.origin_user && message.user ==="admin" &&  message.user != message.origin_user){
      //admin ->bot -> user
      controller.trigger('fallback', bot, message);
      return;
    }
    let ret = await detectTextIntent([message.text]);

    Object.assign(message, ret);
    message.actionName = utils.getAction(ret);
    message.fulfillmentText = utils.getfulfillmentText(ret);
    message.parameters = utils.getParameters(ret);

    // GOOGLE DialogFlowより回答が来た場合、ユーザへ返す
    if(message.fulfillmentText){
      bot.reply(message, {
        reply_user: message.user,
        text: message.fulfillmentText,
        fulfillmentText: message.fulfillmentText,
        quick_replies: [
            {
              title: 'Help',
              payload: 'help',
            },
        ]
      });
    }else if (message.actionName && message.parameters){
      //映画の情報を取得する
      const title = utils.getParameterValue(message, "movie");
      if(title){
        const movie = await getMovieDetail(title);
        onMovieBack(movie, bot, message);
      }else{
        console.log("unknown===action:", message.actionName);
        controller.trigger('unknown', bot, message);
      }
    }else{
      controller.trigger('unknown', bot, message);
    }
  }
  
  async function onMovieBack(movie, bot, message){
    const text =`${movie.Title} is a ${movie.Actors} starer ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}`;
    console.log(`movie=============:${JSON.stringify(movie)}`);
    console.log(`text=============:${text}`);
    const jsonBody = { 
      text: text, 
      "fulfillmentText": text,
      "payload": {
        "google": {
          "expectUserResponse": true,
          "richResponse": {
            "items": [
              {
                "simpleResponse": {
                  "textToSpeech": text
                }
              }
            ]
          }
        }
      }
    };
    await bot.reply(message, jsonBody);
  }

  //センターからのメッセージを解析、基本は転送するだけ。
  //controller.hears('.*', 'message_received', function(bot, message) {
  controller.on('message', function(bot, message) {
    //センターの場合、処理終了
    if(!message.user.match(/admin/i)) return;

    console.log(`==============センターからのメッセージ===================`, message);
    /*
    bot.startConversation(message, function(err, convo) {
      convo.ask({
        text: 'ご回答内容['+ message.text +']をそのまま['+ message.callbackUser +']ユーザへお返しますか？',
        quick_replies: [
          {
            title: 'はい',
            payload: 'はい'
          },
          {
            title: 'いいえ',
            payload: 'いいえ'
          }
        ]
      },
      [
        {
          pattern: 'はい',
          callback: function(res, convo) {
            //人工応答へ送信
            let msg = {
              text : message.text,
              user: message.callbackUser,
              answerUser: true
            };
            controller.transferMessage (msg, message.callbackUser);
            convo.say({text:"ユーザ様に返答しました。", transferSkip: true});
            convo.next();
          }
        },
        {
          default: true,
          callback: function(res, convo) {
            utils.helpDesk(convo);
            convo.next();
          }
        }
      ]);
    });
    */

  
  });
}