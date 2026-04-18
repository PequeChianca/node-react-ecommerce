import mongoose from 'mongoose';


export class AppDataRepository {
    modelName;
    schema;
    #dataModel;

    constructor(modelName, schema) {
        this.modelName = modelName;
        this.schema = schema;
        this.#dataModel = this.#createModel();
    }

    #createModel() {
        const mongoSchema = new mongoose.Schema(this.schema);
        return mongoose.model(this.modelName, mongoSchema);
    }

    findById(id) {
        return this.#dataModel.findById(id);
    }

    findOne(filter) {
        return this.#dataModel.findOne(filter);
    }

    find(filter) {
        return this.#dataModel.find(filter);
    }

    async createNewAsync(data) {
        const newData = new this.#dataModel(data);

        await newData.save();

        return newData;
    }

    exportModel() {
        return this.#dataModel;
    }

    static createSchema(schemaDefinition, options) {
        return new mongoose.Schema(schemaDefinition, options);
    }

    static Types = mongoose.Schema.Types;
}

