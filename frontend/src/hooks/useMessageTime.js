export const useMessageTime = (date) => {
  const messageDate = new Date(date).toLocaleDateString();
  const messageTime = new Date(date).toLocaleTimeString().slice(0, -3);
  const time = new Date(date)
  const dateNow = new Date();

  if (dateNow.getUTCMinutes() === time.getUTCMinutes()) return 'Только что';
  else if (dateNow - time > 8640000) return `${messageDate} ${messageTime}`;
  else return `${messageTime}`;
};
