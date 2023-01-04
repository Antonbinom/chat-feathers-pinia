// Initializes the `upload` service on path `/upload`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Upload } from './upload.class';
import createModel from '../../models/upload.model';
import hooks from './upload.hooks';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },

  filename: (req, file, cb) => cb(null, `${new Date().toISOString().slice(0, -8)}${file.originalname}`)

});

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'upload': Upload & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  const upload = multer({ storage }).array('files', 10);

  // Initialize our service with any options it requires
  app.use('/upload', upload, new Upload(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('upload');

  service.hooks(hooks);
}
