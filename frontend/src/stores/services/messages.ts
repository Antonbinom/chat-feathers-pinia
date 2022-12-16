import { defineStore, BaseModel } from '..'; // .. равно index
import { api } from 'src/feathers';

export class Messages extends BaseModel {
  // static modelName = 'Message'
  // static instanceDefaults() {
  //   return {
  //     text: ''
  //   }
  // }
  // static setupInstance(data: any) {
  //   if (data.createdAt) {
  //     data.createdAt = new Date(data.createdAt)
  //   }
  //   return data
  // }
}

const servicePath = 'messages';
export const useMessages = defineStore({ servicePath, Model: Messages });

api.service(servicePath).hooks({});
