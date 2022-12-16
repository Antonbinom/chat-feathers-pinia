<template lang="pug">
q-header.row.justify-end.items-center.q-pa-lg
  q-btn.q-mr-md(v-if='!isUserAuth', @click='onRegistration') Регистрация
  q-btn(v-if='!isUserAuth', @click='onLogin') Войти
  text-caption.q-mr-md(v-if='getAuthUser') {{ getAuthUser.name }}
  q-btn(v-if='isUserAuth', @click='onLogout') Выйти
</template>
