import 'dotenv/config';
import { buildTestSchemaUrl } from './helpers';

const directUrl = process.env.DIRECT_URL;

if (directUrl) {
  process.env.DATABASE_URL = buildTestSchemaUrl(directUrl);
}

process.env.NODE_ENV = 'testing';
