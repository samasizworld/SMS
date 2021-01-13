import express, { Express } from 'express';
import { Router } from 'express';
export class ExpressServer {
  private app: Express;
  constructor() {
    const server = express();
    this.app = server;
  }

  applyPortListen(port) {
    this.app.listen(port, () => {
      console.log(`Live at port ${port}`);
    });
  }
  applyJSONandBodyParser() {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }
  applyRoutingMiddleware(urlpattern, module) {
    this.app.use(urlpattern, module);
  }
  routerr() {
    return Router();
  }
}
