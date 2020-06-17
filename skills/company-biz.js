/* This module kicks in if no Botkit Studio token has been provided */
const utils = require("../service/utils");
const { BotkitConversation } = require("botkit");
module.exports = function(controller) {

  let convo = new BotkitConversation('iot', controller);
  
  //console.log(`convo:${JSON.stringify(convo)}`);
  // set up a menu thread which other threads can point at.
  convo.say({
    text: '自動回答ができない場合、人工へ切り替わります。'
  });
  convo.ask('先に、お名前を教えて下さい', async(resp, convo, bot)=>{
    console.log('お名前：', resp);
  },'name');

  convo.addAction('next_question');
  
  // set up docs threads
  convo.addMessage({
    text: '{{vars.name}}様、 [Iot案例資料 ](http://112.126.67.102:30006/news/)',
  },'iot_docs');
  convo.addQuestion('ご質問の内容は何でしょうか？', async(resp, convo, bot)=>{
    console.log('新質問：', resp);
  },'new_question','next_question');

  convo.addAction('confirmation','next_question');

  // do a simple conditional branch looking for user to say "no"
  convo.addQuestion('{{vars.name}} 様の質問内容：「 {{vars.new_question}}」.これで人工応答へ切り替えしますね?', [
    {
      //Noの場合、再度質問
        pattern: 'no|いいえ',
        handler: async(response, convo, bot) => {
            // if user says no, go back to favorite color.
            await convo.gotoThread('next_question');
        }
    },
    {
        default: true,
        handler: async(response, convo, bot) => {
          console.log('新質問：', response);
          // do nothing, allow convo to complete.
          //TODO：人工へ切り替わります。
          
        }
    }
  ], 'confirm', 'confirmation');
  
 
  controller.addDialog(convo);
  controller.hears(/^iot関連$/, 'message,user_say', async function(bot, message) {
    await bot.beginDialog('iot');
  });

  /*

  // set up community thread
  convo.addMessage({
    text: '[一般社団法人AI・IoT普及推進協会](https://www.aipa.jp/)',
  },'iot_community');

  convo.addMessage({
    text: '[組み込みシステム技術協会](https://www.jasa.or.jp/tech/iotm2m/)',
  },'iot_community');

  convo.addMessage({
    text: '[経済産業省、情報化・情報産業](https://www.meti.go.jp/policy/mono_info_service/joho/index.html)',
  },'iot_community');

  convo.addMessage({
    action: 'default'
  }, 'iot_community');
  
  // use the before handler to delay the next message 
  convo.before('iot_community',  async () => {
    return new Promise((resolve) => {
        // simulate some long running process
        setTimeout(resolve, 3000);
    });
  });
  */

}
