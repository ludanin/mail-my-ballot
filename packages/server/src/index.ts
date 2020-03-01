import * as Express from 'express';
import * as Morgan from 'morgan';
import { Request, Response } from 'express';
import { AddressInfo } from 'net';
import * as cors from 'cors'

import { VbmRpc } from './trpc';
import { registerExpressHandler } from '@tianhuil/simple-trpc/dist/handler/express'

const App = Express();

// logging middleware
App.use(Morgan('combined'));

App.use(cors())

App.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

registerExpressHandler(App, new VbmRpc())

// https://github.com/GoogleCloudPlatform/nodejs-getting-started/tree/master/1-hello-world
if (module === require.main) {
  const server = App.listen(process.env.PORT || 8080, () => {
    const port = (<AddressInfo>server.address()).port;
    console.log(`App listening on port ${port}`);
  });
}

export default App;
