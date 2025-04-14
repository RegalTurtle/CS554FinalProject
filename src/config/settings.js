import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../env') });

export const env = process.env


export const mongoConfig = {
  serverUrl: 'mongodb://localhost:27017/',
  database: 'CS554_Final_Project'
};
