<template>
  <div class="user-list" :style="{background: userListColor.userList.bg}">
    <table style="padding-top: 5px;">
      <tbody>
        <tr v-for="user in showUserList" :key="user.id">
            <td style="text-align: center;">
              <img :src="user.imageUrl" class="img-msg"  @click="onSelect(user)"/>              
            </td>
            <td class="user-element" :style="{color: userListColor.userList.text}">
              <el-badge :value="user.newMessageCount" :hidden="user.newMessageCount<1">
                <el-link type="primary" :underline="false"  @click="onSelect(user)">{{ user.name }}</el-link>
              </el-badge>
            </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    participants: {
      type: Array,
      required: true
    },
    colors: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    userListColor() {
      const defaultColors = {
        userList: {
          bg: '#FFFFFF',
          text: '#000000'
        }
      }
      return Object.assign(defaultColors, this.colors)
    },
    showUserList(){
      return this.participants.filter(user => !user.hidden)
    }
  },
  methods:{
    onSelect(user){
      user.newMessageCount = 0;
      this.$emit("userClick",user);
    }
  }
}
</script>

<style scoped>
.user-list {
  height: 98%;
  overflow: auto;
  padding-left: 5px;
  padding-top: 10px;
}
.img-msg {
  border-radius: 50%;
  width: 50px;
  margin-right: 5px;
}
.user-element {
  font-size: 20px;
  vertical-align: middle;
}

</style>
