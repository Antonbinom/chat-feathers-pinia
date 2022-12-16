<template lang="pug">
q-page.row.wrap.justify-evenly.q-pa-lg
  q-header.row.justify-end.items-center.q-pa-lg
    q-btn.q-mr-md(v-if='!isUserAuth', @click='onRegistration') Регистрация
    q-btn(v-if='!isUserAuth', @click='onLogin') Войти
    text-caption.q-mr-md(v-if='getAuthUser') {{ getAuthUser.name }}
    q-btn(v-if='isUserAuth', @click='onLogout') Выйти
  q-form.q-gutter-md(
    v-if='createUserMenu & !isUserAuth',
    @submit.prevent='createUser'
  )
    q-input(
      name='name',
      v-model='userData.name',
      color='primary',
      label='name',
      filled,
      clearable
    )
    q-input(
      name='email',
      v-model='userData.email',
      color='primary',
      label='Email',
      filled,
      clearable
    )
    q-input(
      name='password',
      v-model='userData.password',
      color='primary',
      label='password',
      filled,
      clearable
    )
    div
      q-btn(label='Submit', type='submit', color='primary')

  q-form.q-gutter-md(
    v-if='loginUserMenu & !isUserAuth',
    @submit.prevent='authUser'
  )
    q-input(
      name='email',
      v-model='userData.email',
      color='primary',
      label='Email',
      filled,
      clearable
    )
    q-input(
      name='password',
      v-model='userData.password',
      color='primary',
      label='password',
      filled,
      clearable
    )
    div
      q-btn(label='Submit', type='submit', color='primary')

  ChatComponent(v-if='isUserAuth')
</template>

<script lang="ts">
import { useUsers } from 'src/stores/services/users';
import { useAuth } from 'src/stores/services/auth';
import ChatComponent from 'src/components/ChatComponent.vue';
// Stores
const usersStore = useUsers();
const authStore = useAuth();

//

export default {
  components: { ChatComponent },
  data() {
    return {
      userData: {
        name: '',
        email: '',
        password: '',
      },
      createUserMenu: false,
      loginUserMenu: false,
      isUserAuth: false,
    };
  },
  // Computed
  computed: {
    getAuthUser() {
      return authStore.getUser;
    },
  },
  //

  // Methods
  methods: {
    onRegistration() {
      this.createUserMenu = true;
      this.loginUserMenu = false;
    },
    onLogin() {
      this.createUserMenu = false;
      this.loginUserMenu = true;
    },
    onLogout() {
      this.createUserMenu = false;
      this.loginUserMenu = true;
    },
    clearUserData() {
      this.userData.name = '';
      this.userData.email = '';
      this.userData.password = '';
    },

    async createUser() {
      const Users = await usersStore.Model;
      const user = await new Users(this.userData);
      const newUser = await user.save();
      this.isUserAuth = true;
      this.authUser();
    },

    async authUser() {
      const authRes = await authStore.authenticate({
        strategy: 'local',
        email: this.userData.email,
        password: this.userData.password,
      });
      this.isUserAuth = true;
    },
  },
  //
};
</script>
