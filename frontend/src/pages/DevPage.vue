<template lang="pug">
q-page(class="row items-center justify-evenly")
  q-btn(@click="createUser") Создать
  q-btn Войти

</template>

<script lang="ts">
import { useUsers } from "src/stores/services/users";

const usersStore = useUsers();

const userData = { name: "Anton", email: "123@mail.ru", password: "1234" };

export default {
  methods: {
    async createUser() {
      const Users = usersStore.Model;
      const user = new Users(userData);
      const newUser = await user.save();
      debugger;
    },
  },
};
</script>
