<template lang="pug">
.q-pa-md.justify-between.column(style='width: 100%')
  .overflow-auto.q-pb-lg
    q-chat-message(
      v-for='message in messagesItems',
      :key='message._id',
      :name='message.sender.name',
      :text='[message.text]',
      :sent='message.sender.name === "Anton10"'
    )

  form.q-pa-md.fixed-bottom.bg-white(@submit.prevent='sendMessage')
    q-input.row.justify-end(v-model='messageData.text')
      q-btn(type='submit', label='Отправить', color='primary')
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMessages } from 'src/stores/services/messages';
import { useAuth } from 'src/stores/services/auth';

const authStore = useAuth();
const messagesStore = useMessages();

const messageData = ref({
  sender: authStore.getUser._id,
  text: '',
});

const user = ref(messageData.value.sender);

const messagesItems = computed(() => {
  return messagesStore.findInStore({}).data;
});

const sendMessage = async () => {
  const createMessage = messagesStore.Model;
  const message = new createMessage(messageData.value);
  const newMessage = await message.save();

  messageData.value.text = '';
};

onMounted(() => {
  messagesStore.find({
    // query: { $populate: ['sender'] },
    paginate: {
      default: 100,
      max: 200,
    },
  });
});
</script>
