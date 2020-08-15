<template>
  <div class="sc-message--text" :style="messageColors">
    <template>
      <div class="sc-message--toolbox" :style="{background: messageColors.backgroundColor}">
        <button
          v-if="showEdition && me && message.id != null && message.id != undefined"
          :disabled="isEditing"
          @click="edit"
        >
          <IconBase :color="isEditing ? 'black' : messageColors.color" width="10" icon-name="edit">
            <IconEdit />
          </IconBase>
        </button>
        <button
          v-if="showDeletion && me && message.id != null && message.id != undefined"
          @click="$emit('remove')"
        >
          <IconBase :color="messageColors.color" width="10" icon-name="remove">
            <IconCross />
          </IconBase>
        </button>
        <slot name="text-message-toolbox" :message="message" :me="me"> </slot>
      </div>
    </template>
    
    <slot :message="message" :messageText="messageText" :messageColors="messageColors" :me="me">
      <div v-if="message.url">
        <a :href="message.url" target="_blank">
          <p class="sc-message--text-content" v-html="messageText"></p>
        </a> 
      </div>
      <div v-else>
        <p class="sc-message--text-content" v-html="messageText"></p>
      </div>

      <p v-if="message.data.meta" class="sc-message--meta" :style="{color: messageColors.color}">
        {{ message.data.meta }}
      </p>
      <p v-if="message.isEdited" class="sc-message--edited">
        <IconBase width="10" icon-name="edited">
          <IconEdit />
        </IconBase>
        edited
      </p>
    </slot>
  </div>
</template>

<script>
import IconBase from './../components/IconBase.vue'
import IconEdit from './../components/icons/IconEdit.vue'
import IconCross from './../components/icons/IconCross.vue'
import {htmlEscape} from 'escape-goat'
import Autolinker from 'autolinker'
import store from './../store/'
const fmt = require('msgdown')

export default {
  components: {
    IconBase,
    IconCross,
    IconEdit
  },
  props: {
    message: {
      type: Object,
      required: true
    },
    messageColors: {
      type: Object,
      required: true
    },
    messageStyling: {
      type: Boolean,
      required: true
    },
    showEdition: {
      type: Boolean,
      required: true
    },
    showDeletion: {
      type: Boolean,
      required: true
    },
    mmc_uid: {
      type: String,
      default: "information"
    }
  },
  data() {
    return {
      store
    }
  },
  computed: {
    messageText() {
      if(!this.message.data || !this.message.data.text){
        return "";
      }
      let escaped = htmlEscape(this.message.data.text)

      return Autolinker.link(this.messageStyling ? fmt(escaped) : escaped, {
        className: 'chatLink',
        truncate: {length: 50, location: 'smart'}
      })
    },
    currentUserId(){
      if(!this.store.currentUser){
        return this.mmc_uid;
      }
      return this.store.currentUser.id;
    },
    me() {
      return this.message.author === this.currentUserId
    },
    isEditing() {
      return (store.editMessage && store.editMessage.id) == this.message.id
    }
  },
  methods: {
    edit() {
      this.store.editMessage = this.message
    }
  }
}
</script>

<style scoped>
a.chatLink {
  color: inherit !important;
}
</style>
