import { HooksObject } from '@feathersjs/feathers';

export default {
  before: {
    all: [
      (ctx: any) => {
        ctx.params.query.$populate = ['sender', 'reactions.users'];
        return ctx;
      },
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [
      // (ctx: any) => {
      //   ctx.params.query.$populate = ['sender'];
      //   return ctx;
      // },
    ],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
