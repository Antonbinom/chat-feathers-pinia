import { defineAuthStore } from 'feathers-pinia';
import { api as feathersClient } from 'src/feathers';
import { User } from './users';

export const useAuth = defineAuthStore({
  feathersClient,
  state: () => ({
    userId: null
  }),

  getters: {
    getUser(): any {
      return this.userId ? User.getFromStore(this.userId) : null
    },
  },

  actions: {
    logout() {
      localStorage.removeItem('feathers-jwt');
      this.userId = null;
    },
    handleResponse(response: any) {
      this.userId = response.user.id || response.user._id
      User.addToStore(response.user)
      return response
    },
  },
})
