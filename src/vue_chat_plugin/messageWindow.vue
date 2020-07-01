<template>
  <div id="messageCenter">
    <MessageList
      :messages="messages"
      :participants="participants"
      :show-typing-indicator="''"
      :colors="availableColors"
      :always-scroll-to-bottom="false"
      :show-edition="true"
      :show-deletion="true"
      :message-styling="false"
      @scrollToTop="$emit('scrollToTop')"
      @remove="$emit('remove', $event)"
    >
      <template v-slot:user-avatar="scopedProps">
        <slot name="user-avatar" :user="scopedProps.user" :message="scopedProps.message"></slot>
      </template>
      <template v-slot:text-message-body="scopedProps">
        <slot
          name="text-message-body"
          :message="scopedProps.message"
          :messageText="scopedProps.messageText"
          :messageColors="scopedProps.messageColors"
          :me="scopedProps.me"
        ></slot>
      </template>
      <template v-slot:system-message-body="scopedProps">
        <slot name="system-message-body" :message="scopedProps.message"></slot>
      </template>
      <template v-slot:text-message-toolbox="scopedProps">
        <slot name="text-message-toolbox" :message="scopedProps.message" :me="scopedProps.me"></slot>
      </template>
    </MessageList>
    <UserInput
      :show-emoji="false"
      :on-submit="onUserInputSubmit"
      :suggestions="getSuggestions()"
      :show-file="false"
      placeholder="input here please."
      :colors="availableColors"
      @onType="$emit('onType')"
      @edit="$emit('edit', $event)"
    />
  </div>
</template>

<script>
import Colors from "../data/colors";
import chatParticipants from "../data/chatProfiles";
import MessageList from "./MessageList";
import UserInput from "./UserInput";

export default {
  name: "MessageCenter",
  props: {
    messageList: {
      type: Array,
      default: () => []
    }
  },
  components: {
    MessageList,
    UserInput
  },
  data() {
    return {
      participants: chatParticipants,
      availableColors: Colors.blue
    };
  },
  computed: {
    messages() {
      let messages = this.messageList;

      return messages;
    }
  },
  methods: {
    getSuggestions() {
      return this.messages.length > 0
        ? this.messages[this.messages.length - 1].suggestions
        : [];
    },
    onUserInputSubmit() {
      console.log("onUserInputSubmit");
    }
  }
};
</script>
<style>
#messageCenter{
  width: 100%;
  height: 100%;
}
</style>