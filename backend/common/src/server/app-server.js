import express from 'express';
import bodyParser from 'body-parser';

export function CreateAppRouter(){
    return express.Router();
}

export class AppServer{

    serverName;
    serverPort;
    routes;
    
    constructor(serverName, serverPort){
        this.serverName = serverName;
        this.serverPort = serverPort;
        this.routes = [];
    }

    registerRoute(path, handler){
        this.routes.push({path, handler});

        return this;
    }
    
    startServer(){
        const app = express();
        app.use(bodyParser.json());

        this.routes.forEach(route => {
            app.use(route.path, route.handler);
        });

        app.listen(this.serverPort, () => {
        console.log(`${this.serverName} server started at http://localhost:${this.serverPort}`);
        });
    }

}
  
