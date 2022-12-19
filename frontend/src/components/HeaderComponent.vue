<template lang="pug">
q-header.row.justify-end.items-center.q-pa-lg
  q-btn.q-mr-md(v-if='!props.isUserAuth', @click='changeForm("registration")') Регистрация
  q-btn(v-if='!props.isUserAuth', @click='changeForm("login")') Войти
  q-chip.q-mr-md(v-if='getAuthUser')
    q-avatar
      img(:src='getAvatarLink')
    span {{ getAuthUser.name }}
  q-btn(v-if='props.isUserAuth', @click='onLogout') Выйти
</template>

<script setup lang="ts">
import { useAuth } from 'src/stores/services/auth';
import { computed } from 'vue';

// --- Stores ---
const authStore = useAuth();

// --- Props ---
const props = defineProps({
  isUserAuth: { type: Boolean },
});

// --- Emits ---
const emit = defineEmits(['onLogout', 'activeForm']);

// --- Computed ---
const getAuthUser = computed(() => authStore.getUser);
const getAvatarLink = computed(
  () => `https://api.multiavatar.com/${authStore.getUser.name}.png`
);

// --- Methods ---
const changeForm = (name) => {
  emit('activeForm', name);
};

const onLogout = () => {
  emit('onLogout');
  authStore.logout();
};
</script>
