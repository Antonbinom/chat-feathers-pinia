<template lang="pug">
.justify-between.column(style='width: 100%', @load='scroll')
  q-scroll-area.fit.q-px-lg.q-pb-xl(ref='chatScroll')
    q-infinite-scroll(@load='onLoad', reverse)
      q-chat-message(
        v-for='message in messagesItems',
        :key='message._id',
        :name='message.sender.name',
        :text='[message.text]',
        :sent='message.sender.name === authStore.getUser.name'
      )
  form.q-pa-md.fixed-bottom.bg-white(@submit.prevent='sendMessage')
    q-input.row.justify-end(v-model='messageData.text')
      q-btn(type='submit', label='Отправить', color='primary')
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMessages } from 'src/stores/services/messages';
import { useAuth } from 'src/stores/services/auth';

// --- Stores ---
const authStore = useAuth();
const messagesStore = useMessages();

// --- Refs ---
const messageData = ref({
  sender: authStore.getUser._id,
  text: '',
});
const messagesLimit = ref(15);
const user = ref(messageData.value.sender);
const chatScroll = ref();

// --- Computed ---
const messagesItems = computed(() => {
  const { data } = messagesStore.findInStore({
    query: {
      $sort: {
        createdAt: 1,
      },
    },
  });
  return data;
});

// --- Methods ---
const sendMessage = async () => {
  const createMessage = messagesStore.Model;
  const message = new createMessage(messageData.value);
  const newMessage = await message.save();

  messageData.value.text = '';
  scroll();
};

const scroll = () => {
  const { getScrollTarget, setScrollPosition } = chatScroll.value;
  const { scrollHeight } = getScrollTarget();
  setScrollPosition('vertical', scrollHeight, 0);
};

const onLoad = async (index, done) => {
  await messagesStore.find({
    query: {
      $populate: ['sender'],
      $sort: {
        createdAt: -1,
      },
      $limit: messagesLimit.value,
    },
  });
  done();
  messagesLimit.value += 15;
};
</script>
