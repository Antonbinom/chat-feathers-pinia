import { defineStore, BaseModel } from '..'; // .. равно index
import { api } from 'src/feathers';

export class Message extends BaseModel {
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

const servicePath = 'message';
export const useMessage = defineStore({ servicePath, Model: Message });

api.service(servicePath).hooks({});
