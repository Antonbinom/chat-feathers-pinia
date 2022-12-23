export const onSelectReactions = async ({ i, r }) => {
  if (messageItem.value.reaction.length) {
    if (messageItem.value.reaction.find((el) => el.id === r)) {
      const reactionsItem = messageItem.value.reaction.find(
        (el) => el.id === r
      );
      const query = { 'reactions.id': r };
      messagesStore.patch(
        messageItem.value.id,
        { 'reactions.$.count': reactionsItem.count + 1 },
        { query }
      );
    } else {
      pushReaction(i, r, authStore.getUser._id);
    }
  } else {
    pushReaction(i, r, authStore.getUser._id);
  }
  isReactionPicker.value = !isReactionPicker.value;
};
