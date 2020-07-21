<template>
  <div id="chat">
    <el-button type="primary" @click="auth">
      <img src="./assets/close-icon.png"/>
    </el-button>
    <a href="/auth">
      <img src="./assets/close-icon.png"/>
    </a>    
  </div>
</template>
<script>
  //const line_login = require("line-login");
  import line_login from "line-login"
  
  export default {
    
    computed:{
      loginHander (){
        // 認証の設定。
        const login = new line_login({
          channel_id: this.$config.LINE_LOGIN_CHANNEL_ID,
          channel_secret:  this.$config.LINE_LOGIN_CHANNEL_SECRET,
          callback_url:  this.$config.LINE_LOGIN_CALLBACK_URL,
          prompt: "consent",
          bot_prompt: "aggressive" // 追加
        });
        return login;
      }
    },
    methods:{
      auth(){
        this.$router.push('/auth', this.loginHander.auth());
        this.$router.push('/callback', this.line_login_callback);
      },
      line_login_callback(req, res, next, token_response){
        this.loginHander.get_friendship_status(token_response.access_token).then((response) => {
          let resp = res.json(response);
          console.log(resp); //{"friendFlag": true} //友だちになっていなければfalse
        })
      }
    }
  }
</script>
