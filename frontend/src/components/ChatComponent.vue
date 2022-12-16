<template lang="pug">
.q-pa-md.justify-between.column(style='width: 100%')
  div
    q-chat-message(name='me', :text='["hey, how are you?"]', sent)
    q-chat-message(name='Jane', :text='["doing fine, how r you?"]')
    q-chat-message(name='me', :text='["hey, how are you?"]', sent)
    q-chat-message(name='Jane', :text='["doing fine, how r you?"]')
  form.q-pa-md(@submit.prevent='sendMessage')
    q-input.row.justify-end(v-model='messageData.text')
      q-btn.q-mt-md(type='submit', label='Отправить', color='primary')
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMessage } from 'src/stores/services/message';
import { useAuth } from 'src/stores/services/auth';

const authStore = useAuth();
const messageStore = useMessage();

const messageData = ref({
  name: 'Anton',
  text: '',
});

const sendMessage = async () => {
  const createMessage = messageStore.Model;
  const message = new createMessage(messageData.value);
  const newMessage = await message.save();

  messageData.value.text = '';
};
</script>
