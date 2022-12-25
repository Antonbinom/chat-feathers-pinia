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
            p {{ message.text }}
            .reactions-buttons
              q-btn.q-py-none.q-mr-sm(
                v-for='(reaction, index) in message.reactions',
                @click='onReactionButton(message._id, message.reactions, reaction.id, index)',
                :key='reaction.id',
                color='white',
                text-color='black',
                dense
              ) {{ `${reaction.smile} ${reaction.count}` }}
              q-btn.q-py-none.q-mr-sm.add-reaction(
                @click='onReactions($event, message._id, message.reactions)',
                color='transparent',
                text-color='black',
                dense
              )
                q-img.add-reaction-img(src='../assets/smile-plus.svg')
          pre {{ message.reactions }}
      EmojiPicker.reactions(
        v-if='isReactionPicker',
        @select='onSelectReactions',
        :native='true',
        :hide-group-names='true',
        :hide-group-icons='true',
        :disabled-groups='["animals_nature", "food_drink", "activities", "travel_places", "objects", "symbols", "flags"]',
        :disable-sticky-group-names='true',
        :disable-skin-tones='true',
        :static-texts='{ placeholder: "Поиск..." }'
      )
  EmojiPicker.fixed-bottom.emoji(
    v-show='isEmojiPicker',
    @select='onSelectEmoji',
    :native='true',
    :hide-group-names='true',
    :hide-group-icons='true',
    :disable-sticky-group-names='true',
    :disable-skin-tones='true',
    :static-texts='{ placeholder: "Поиск..." }'
  )

  form.q-pa-md.fixed-bottom.bg-white(@submit.prevent='sendMessage')
    q-input.row.justify-end(v-model='messageData.text')
      q-btn.q-pa-none.q-mr-sm(
        @click='isEmojiPicker = !isEmojiPicker',
        style='width: 56px',
        unelevated
      )
        q-img(src='../assets/smile.svg')
      q-btn(type='submit', label='Отправить', color='primary')
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
});
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
const sendMessage = async () => {
  const createMessage = messagesStore.Model;
  const message = new createMessage(messageData.value);
  const newMessage = await message.save();

  messageData.value.text = '';
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
  const itemIndex = users.indexOf(authStore.getUser._id);
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

const onSelectReactions = async ({ i, r }) => {
  const messageIndex = messagesItems.value.findIndex(
    (el) => el._id === messageId.value
  );
  const { reactions } = messagesItems.value[messageIndex];

  if (!reactions.length) createReaction(i, r);
  else {
    const isUserId = reactions.some((item) =>
      item.users.includes(authStore.getUser._id)
    );

    if (isUserId) {
      const reactionIndex = reactions.findIndex((item) =>
        item.users.includes(authStore.getUser._id)
      );
      const reaction = reactions[reactionIndex];
      const { id, count, users } = reactions[reactionIndex];

      count > 1 ? removeReaction(reaction) : deleteReaction(id);
    }
    // если в массиве уже находится эта реакция
    const reaction = reactions.find((el) => el.id === r);

    reaction ? addReaction(reaction) : createReaction(i, r);
  }

  isReactionPicker.value = !isReactionPicker.value;
};

const onReactionButton = (msgId, reaction, reactionId, index) => {
  const { id, users, count } = reaction[index];
  const currentReaction = reaction[index];

  messageId.value = msgId;

  users.includes(authStore.getUser._id)
    ? count > 1
      ? removeReaction(currentReaction)
      : deleteReaction(reactionId)
    : addReaction(currentReaction);
};

const onReactions = (e, id, reaction) => {
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

.emoji
  position: absolute
  margin: 0
  right: 140px
  left: 140px
  width: auto
  bottom: 86px
  .v3-emojis
    button
      flex-basis: 4% !important
      max-width: 50px !important
.reactions
  position: absolute
  top: 50%
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
