const MongoClient = require("mongodb").MongoClient

class MongoBot {
    constructor() {
      const url = "mongodb://localhost:27017/";
  
      this.client = new MongoClient(url);
    }
    async init() {
      await this.client.connect();
      console.log('Mongo connected');
  
      this.db = this.client.db("test-dbs");

    }
  }
module.exports = new MongoBot()