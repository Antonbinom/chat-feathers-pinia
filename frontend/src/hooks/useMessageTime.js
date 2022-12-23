export const useMessageTime = (date) => {
  const messageDate = new Date(date);
  const dateNow = new Date();
  const year = messageDate.getFullYear();
  const month = messageDate.getMonth();
  const day = messageDate.getDate();
  const hour = messageDate.getHours();
  const minute = messageDate.getMinutes();
  if (dateNow.getUTCMinutes() === messageDate.getUTCMinutes())
    return 'Только что';
  else if (dateNow - messageDate > 8640000)
    return `${day}.${month}.${year} ${hour}:${minute}`;
  else return `${hour}:${minute}`;
};
