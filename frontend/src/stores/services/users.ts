import { defineStore, BaseModel } from '..'; // . равно index
import { api } from 'src/feathers';

export class User extends BaseModel { }

const servicePath = 'users';
export const useUsers = defineStore({ servicePath, Model: User });

api.service(servicePath).hooks({});
