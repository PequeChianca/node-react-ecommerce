import mongoose from 'mongoose';
import config from '../config.js';

export class AppDataAccess {
    databaseName;
    url;

    constructor(databaseName) {
        this.databaseName = databaseName;
        this.url = `${config.MONGODB_URL}/${databaseName}`;
    }

    connect() {
        mongoose
            .connect(this.url)
            .then(() => {
                console.log(`Connected to database ${this.databaseName} at ${this.url}`)                
            })
            .catch((error) =>
                console.error(error));


    }
}