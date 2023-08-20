import path from 'path';
import { fileURLToPath } from 'url';

export const getDirname = () => {
  return path.dirname(fileURLToPath(import.meta.url));
};
