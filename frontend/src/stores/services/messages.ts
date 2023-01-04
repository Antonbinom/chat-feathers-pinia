import { defineStore, BaseModel } from '..'; // .. равно index
import { api } from 'src/feathers';

export class Messages extends BaseModel {
}

const servicePath = 'messages';
export const useMessages = defineStore({ servicePath, Model: Messages });
api.service(servicePath).hooks({});
