/* This module kicks in if no Botkit Studio token has been provided */
module.exports = function(controller) {
  
  //初回接続、再度接続、途中helpの場合、ヘルプディスクへmessage_received
  controller.on('hello,welcome_back', onboarding);
  controller.on('hello,welcome_back', onConnected);
  controller.hears(['help','ヘルプ'], 'message', onboarding);
  
  async function onboarding(bot, message) {
    console.log(`onboarding :${message.type}, ${message.user} `);
    await bot.reply(message, {
      text:`こんにちは、MBP Smartec ロボです。 `,
      reply_user: message.user,
      quick_replies: [
        {
          title: 'iot関連',
          payload: 'iot関連',
        },
        {
          title: 'bigdata関連',
          payload: 'bigdata関連',
        },
        {
          title: '会社案内',
          payload: '会社案内',
        },{
          title: '事業内容',
          payload: '事業内容',
        },{
          title: '最新ニュース',
          payload: '最新ニュース',
        },{
          title: 'ログイン',
          payload: 'ログイン',
        }
      ]
    });

  }

  async function onConnected(bot, message){
    //controller.botClients
    let client = controller.botClients.find(element => message.user === element.user);
    //送信先が見つからない場合、飛ばす
    if(!client){
      client = {user: message.user, bot: bot, message: message};
      controller.botClients.push(client);
    };
    // 管理センターへお知らせ
    tranferToMMC(bot, message, "online");
  }

  // handle the custom event
  controller.on('unknown', async(bot, message) => {
    tranferToMMC(bot, message, "unknown");
  });
  controller.on('known', async(bot, message) => {
    tranferToMMC(bot, message, "known");
  });
  // handle the custom event
  controller.on('fallback', async(bot, message) => {
    tranferToUser(bot, message);
  });

  async function tranferToMMC(bot, message, event){
    let admin = controller.botClients.find(element => "admin" === element.user);
    if(!admin){
      //管理センターはOfflineのため、伝送できません。
      bot.say({
        text:"管理センターはOfflineしています、Online後お知らせいたします。",
        reply_user: message.user
      });
      return;
    }

    let client = controller.botClients.find(element => message.user === element.user);
    if(client){
      if(!event){
        if(message.event){
          event = message.event;
        }else{
          event = "unknown";
        }
      }
      if (client.user != admin.user){
        await admin.bot.changeContext(admin.message.reference);
        admin.bot.say({
          type:"notified",
          event: event,
          text: message.text, 
          user: "bot",
          reply_user: admin.user,
          origin_user: message.user 
        });   
      }else if(event!="online") {
        bot.say({
          type:"notified",
          event: event,
          text: `「${message.text}」は何の意味でしょうか？教えて下さい。`, 
          user: "bot",
          reply_user: admin.user,
          origin_user: message.user 
        });  
      }
    }
  }

  async function tranferToUser(bot, message, event){
    let client = controller.botClients.find(element => message.origin_user === element.user);
    if(client){
      if(!event){
        if(message.event){
          event = message.event;
        }else{
          event = "unknown";
        }
      }
      await client.bot.changeContext(client.message.reference);
      client.bot.say(message.text);
    }
  }
  
}
