<template lang="pug">
q-header.row.justify-end.items-center.q-pa-lg
  q-btn.q-mr-md(v-if='!props.isUserAuth', @click='changeForm("registration")') Регистрация
  q-btn(v-if='!props.isUserAuth', @click='changeForm("login")') Войти
  text-caption.q-mr-md(v-if='getAuthUser') {{ getAuthUser.name }}
  q-btn(v-if='props.isUserAuth', @click='onLogout') Выйти
</template>

<script setup lang="ts">
// import { useUsers } from 'src/stores/services/users';
import { useAuth } from 'src/stores/services/auth';
import { computed } from 'vue';

// --- Stores ---
// const usersStore = useUsers();
const authStore = useAuth();

// --- Props ---
const props = defineProps({
  isUserAuth: { type: Boolean },
});

// --- Emits ---
const emit = defineEmits(['onLogout', 'activeForm']);

// --- Computed ---
const getAuthUser = computed(() => authStore.getUser);

// --- Methods ---
const changeForm = (name) => {
  emit('activeForm', name);
};

const onLogout = () => {
  emit('onLogout');
  authStore.logout();
};
</script>
