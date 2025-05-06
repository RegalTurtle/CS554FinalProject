import { MongoClient } from 'mongodb';
import { mongoConfig, env } from '@/src/config/settings.js';

let _connection = undefined;
let _db = undefined;

const dbConnection = async () => {
  // env.MONGO_URI Azure DataStorage
  const mongoURI = env.MONGO_URI || mongoConfig.serverUrl;
  if (!_connection) {
    _connection = await MongoClient.connect(mongoURI);
    _db = _connection.db(mongoConfig.database);
  }

  return _db;
};
const closeConnection = async () => {
  await _connection.close();
};

export { dbConnection, closeConnection };