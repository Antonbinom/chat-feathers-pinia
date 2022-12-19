<template lang="pug">
q-page.row.wrap.justify-evenly.q-pa-lg
  HeaderComponent(
    :isUserAuth='isUserAuth',
    @active-form='changeActiveForm',
    @on-logout='onLogout'
  )
  FormComponent(
    :isUserAuth='isUserAuth',
    :activeForm='activeForm',
    @create-user='createUser',
    @auth-user='authUser'
  )
  ChatComponent(v-if='isUserAuth')
</template>

<script setup lang="ts">
import { useUsers } from 'src/stores/services/users';
import { useAuth } from 'src/stores/services/auth';
import ChatComponent from 'src/components/ChatComponent.vue';
import HeaderComponent from 'src/components/HeaderComponent.vue';
import FormComponent from 'src/components/FormComponent.vue';
import { computed, ref, onBeforeMount } from 'vue';

// --- Stores ---
const usersStore = useUsers();
const authStore = useAuth();

// --- Emits ---
const emit = defineEmits(['customChange']);

// --- Refs ---
const isUserAuth = ref();
const activeForm = ref('login');

// --- Computed ---
const getAuthUser = computed(() => authStore.getUser);

// --- Methods ---
const changeActiveForm = (name: string) => {
  activeForm.value = name;
};

const onLogout = () => {
  authStore.logout();
  isUserAuth.value = false;
};

const createUser = async (data) => {
  const Users = await usersStore.Model;
  const user = await new Users(data);
  const newUser = await user.save();
  authUser(data);
};

const authUser = async ({ email, password }) => {
  await authStore.authenticate({
    strategy: 'local',
    email: email,
    password: password,
  });
  isUserAuth.value = true;
};

// --- Hooks ---
onBeforeMount(async () => {
  if (localStorage.getItem('feathers-jwt')) {
    await authStore.authenticate({
      strategy: 'jwt',
      accessToken: localStorage.getItem('feathers-jwt'),
    });
    isUserAuth.value = true;
  }
});
</script>
