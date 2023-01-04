import { defineStore, BaseModel } from '..'; // .. равно index
import { api } from 'src/feathers';

export class Upload extends BaseModel {
}

const servicePath = 'upload';
export const useUpload = defineStore({ servicePath, Model: Upload });
api.service(servicePath).hooks({});
