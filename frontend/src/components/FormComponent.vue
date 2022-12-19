<template lang="pug">
q-form.q-gutter-md(
  v-if='(activeForm === "registration") & !isUserAuth',
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
    q-btn(label='Отправить', type='submit', color='primary')

q-form.q-gutter-md(
  v-if='(activeForm === "login") & !isUserAuth',
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
    q-btn(label='Войти', type='submit', color='primary')
</template>

<script setup lang="ts">
import { ref } from 'vue';

// --- Refs --
const userData = ref({
  name: '',
  email: '',
  password: '',
});

// --- Props ---
const props = defineProps({
  isUserAuth: { type: Boolean },
  activeForm: { type: String },
});

// --- Emits ---
const emit = defineEmits(['createUser', 'authUser']);

// --- Methods ---
const createUser = () => {
  emit('createUser', userData.value);
  if (props.isUserAuth) clearUserData();
};

const authUser = () => {
  emit('authUser', userData.value);

  if (props.isUserAuth) clearUserData();
  console.log(props.isUserAuth);
};

const clearUserData = () => {
  userData.value = {
    name: '',
    email: '',
    password: '',
  };
};
</script>
