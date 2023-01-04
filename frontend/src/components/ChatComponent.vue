<template lang="pug">
.justify-between.col(style='width: 100%', @load='scroll')
  q-scroll-area.fit.q-px-lg.q-pb-xl(ref='chatScroll')
    q-infinite-scroll(@load='onLoad', reverse)
      q-chat-message(
        v-for='message in messagesItems',
        :avatar='`https://api.multiavatar.com/${message.sender.name}.png`',
        :key='message._id',
        :sent='message.sender.name === authStore.getUser.name'
      )
        template(v-slot:name)
          .row.message-header
            div {{ message.sender.name }} &nbsp
            div {{ useMessageTime(message.createdAt) }}
        template(v-slot:default)
          div
            p.message-text.q-ma-none {{ message.text }}
            .row.message__images.justify-center(
              v-if='message.files.length',
              :style='message.files.length === 1 ? "width: 300px" : "width: 500px"'
            )
              .message__images-item.rounded-borders(
                v-for='(file, index) in message.files.slice(0, 4)',
                @click='onImagesPopup(message.files, file.name)',
                :style='`width: ${imageWidth(message.files.length)}`'
              )
                q-img(
                  v-if='index < 3',
                  fit='cover',
                  :ratio='5 / 4',
                  position='0 0',
                  :key='file._id',
                  :src='`http://localhost:3030/uploads/${file.name}` || `../../public/favicon.ico`',
                  crossorigin='anonymous'
                )
                q-img(
                  v-if='index === 3',
                  fit='cover',
                  :ratio='5 / 4',
                  position='0 0',
                  :key='file._id',
                  :src='`http://localhost:3030/uploads/${file.name}` || `../../public/favicon.ico`',
                  crossorigin='anonymous'
                )
                  .absolute-full.text-subtitle2.flex.flex-center
                    h3 {{ `+${message.files.length - 4}` }}

            .reactions-buttons.q-mt-sm
              q-btn.q-py-none.q-mr-sm(
                v-for='(reaction, index) in message.reactions',
                @click='onReactionButton(message._id, index)',
                :key='reaction.id',
                color='white',
                text-color='black',
                dense
              ) {{ `${reaction.smile} ${reaction.count}` }}
                q-tooltip(
                  anchor='bottom middle',
                  self='top middle',
                  :offset='[10, 10]'
                )
                  p
                    b(v-for='(user, index) in reaction.users', :key='index') {{ `${user._id === authStore.getUser._id ? "Вы" : user.name}${index + 2 === reaction.users.length ? " и " : index + 1 < reaction.users.length ? ", " : ""}` }}
                    br
                    b {{ ` :${reaction.users.length > 1 ? "Поставили" : "Поставил"} ${reaction.smile}` }}
              q-btn.q-py-none.q-mr-sm.add-reaction(
                @click='onReactions($event, message._id)',
                color='transparent',
                text-color='black',
                dense
              )
                q-img.add-reaction-img(src='../assets/smile-plus.svg')
                  q-menu
                    EmojiPicker.reactions(
                      clickable,
                      v-close-popup,
                      @select='onSelectReactions',
                      :native='true',
                      :hide-group-names='true',
                      :hide-group-icons='true',
                      :disabled-groups='["animals_nature", "food_drink", "activities", "travel_places", "objects", "symbols", "flags"]',
                      :disable-sticky-group-names='true',
                      :disable-skin-tones='true',
                      :static-texts='{ placeholder: "Поиск..." }'
                    )
  q-form.row.q-pa-md.fixed-bottom.bg-white(@submit='sendMessage')
    input(
      name='files',
      @change='handleFileUpload',
      label='Файл',
      type='file',
      multiple,
      append,
      counter,
      style='width: 10%'
    )
    q-input.row.justify-end.message-input(
      name='text',
      v-model='messageData.text',
      style='width: 90%'
    )
      q-btn.q-pa-none.q-mr-sm(
        @click='isEmojiPicker = !isEmojiPicker',
        style='width: 56px',
        unelevated
      )
        q-img(src='../assets/smile.svg')
          q-menu
            EmojiPicker(
              @select='onSelectEmoji',
              :native='true',
              :hide-group-names='true',
              :hide-group-icons='true',
              :disable-sticky-group-names='true',
              :disable-skin-tones='true',
              :static-texts='{ placeholder: "Поиск..." }'
            )
      q-btn(type='submit', label='Отправить', color='primary')

q-dialog(v-model='imagesPopup')
  q-carousel(
    fullscreen,
    swipeable,
    animated,
    v-model='slide',
    thumbnails,
    infinite,
    style='width: 100%'
  )
    q-carousel-slide(
      v-for='file in messageData.files',
      :key='file._id',
      :name='file.name',
      :img-src='`../../public/uploads/${file.name}`',
      crossorigin='anonymous',
      @click='imagesPopup = false'
    )
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useMessages } from 'src/stores/services/messages';
import { useAuth } from 'src/stores/services/auth';
import useSound from 'vue-use-sound';
import sendMessageSound from 'src/assets/send.mp3';
import getMessageSound from 'src/assets/get.mp3';
import EmojiPicker from 'vue3-emoji-picker';
import { useMessageTime } from 'src/hooks/useMessageTime';
import { api } from 'src/boot/axios';

import 'vue3-emoji-picker/css';
// import css
import 'vue3-emoji-picker/css';
// import css
import 'vue3-emoji-picker/css';
// --- Stores ---
const authStore = useAuth();
const messagesStore = useMessages();

const soundGet = useSound(getMessageSound);
const soundSend = useSound(sendMessageSound);

// --- Refs ---
const messageData = ref({
  sender: authStore.getUser._id,
  text: '',
  files: [],
});
const imagesPopup = ref(false);
const slide = ref('');
const submitEmpty = ref(false);
const submitResult = ref([]);

const files = ref([]);
const messageId = ref('');
const messagesLimit = ref(15);
const user = ref(messageData.value.sender);
const chatScroll = ref();
const isEmojiPicker = ref(false);
const isReactionPicker = ref(false);

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
const handleFileUpload = ({ target }) => {
  messageData.value.files = [];
  Object.values(target.files).forEach((file) =>
    messageData.value.files.push({
      name: `${new Date().toISOString().slice(0, -8)}${file.name}`,
    })
  );
};

const onImagesPopup = (files, name) => {
  imagesPopup.value = true;
  messageData.value.files = files;
  slide.value = name;
};

const imageWidth = (length) => {
  if (length === 1) return '98%';
  else if (length === 3) return '32%';
};

const sendMessage = async (event) => {
  const createMessage = messagesStore.Model;
  const message = new createMessage(messageData.value);
  const newMessage = await message.save();

  messageData.value.text = '';

  await api.post('http://localhost:3030/upload', new FormData(event.target));
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

const playNotifySound = (event: object) => {
  if (event.sender._id === user.value) {
    const [play] = soundSend;
    play();
  } else {
    const [play] = soundGet;
    play();
  }
};

const onSelectEmoji = ({ i }) => {
  messageData.value.text += i;
};

const createReaction = async (i, r) => {
  await messagesStore.patch(messageId.value, {
    $push: {
      reactions: {
        id: r,
        smile: i,
        count: 1,
        users: [authStore.getUser._id],
      },
    },
  });
};

const addReaction = async (reaction) => {
  const { id, count, users } = reaction;
  if (users.includes(authStore.getUser._id)) return;
  const usersArr = [...users, authStore.getUser._id];
  const query = { 'reactions.id': id };
  await messagesStore.patch(
    messageId.value,
    {
      'reactions.$.count': count + 1,
      'reactions.$.users': usersArr,
    },
    { query }
  );
};

const removeReaction = async (reaction) => {
  const { id, count, users } = reaction;
  const itemIndex = users.findIndex(
    (item) => item._id === authStore.getUser._id
  );
  const query = { 'reactions.id': id };
  users.splice(itemIndex, 1);

  await messagesStore.patch(
    messageId.value,
    {
      'reactions.$.count': count - 1,
      'reactions.$.users': users,
    },
    { query }
  );
};

const deleteReaction = async (id) => {
  await messagesStore.patch(messageId.value, {
    $pull: {
      reactions: {
        id,
      },
    },
  });
};

const getVariables = () => {
  const messageIndex = messagesItems.value.findIndex(
    (el) => el._id === messageId.value
  );
  const { reactions } = messagesItems.value[messageIndex];
  const isUserId = reactions.some((item) =>
    item.users.find((user) => user._id === authStore.getUser._id)
  );
  const reactionIndex = reactions.findIndex((item) =>
    item.users.find((user) => user._id === authStore.getUser._id)
  );
  return { reactions, isUserId, reactionIndex };
};

const onSelectReactions = async ({ i, r }) => {
  const { reactions, isUserId, reactionIndex } = getVariables();

  if (!reactions.length) createReaction(i, r);
  else {
    if (isUserId) {
      const reaction = reactions[reactionIndex];
      const { id, count } = reactions[reactionIndex];

      count > 1 ? removeReaction(reaction) : deleteReaction(id);
    }
    const reaction = reactions.find((el) => el.id === r);

    reaction ? addReaction(reaction) : createReaction(i, r);
  }

  isReactionPicker.value = !isReactionPicker.value;
};

const onReactionButton = (msgId, index) => {
  messageId.value = msgId;
  const { reactions, isUserId, reactionIndex } = getVariables();

  if (isUserId) {
    const currentReaction = reactions[reactionIndex];
    const { id, count } = currentReaction;

    if (currentReaction === reactions[index]) {
      count > 1 ? removeReaction(currentReaction) : deleteReaction(id);
    } else {
      count > 1 ? removeReaction(currentReaction) : deleteReaction(id);
      addReaction(reactions[index]);
    }
  } else addReaction(reactions[index]);
};

const onReactions = (e, id) => {
  const targetClass = e.target.__vueParentComponent.attrs.class;
  if (
    targetClass.includes('add-reaction-img') ||
    targetClass.includes('add-reaction')
  ) {
    isReactionPicker.value = !isReactionPicker.value;
    messageId.value = id;
  }
};

// --- Hooks ---
onMounted(() => {
  messagesStore.service.on('created', (chatEvent: object) => {
    scroll();
    playNotifySound(chatEvent);
  });
});
</script>


<style lang="sass">
.message-header
  background-color: transparent
.q-message-name--sent .message-header
  justify-content: flex-end
.message-text
  font-size: 16px
.message-input
  font-size: 16px
.message__images
  width: 500px
  gap: 10px
.message__images-item
  width: 49%
  height: auto
  cursor: pointer
  &:nth-child(4)
    b

      background-color: #fff

.reactions-buttons
  transition: all ease 0.3s
.reactions-buttons:hover
  .add-reaction
    opacity: 1
.add-reaction
  width: 27px
  padding: 6px
  opacity: 0
  transition: all ease 0.3s
</style>
