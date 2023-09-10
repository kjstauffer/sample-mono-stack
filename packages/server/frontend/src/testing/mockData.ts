import config from 'config';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet(`1234567890abcdef`, 12);
const mockPassword = `password`;

const getMockData = () => {
  const randomId = nanoid();
  const domain = config.get<string>(`domain`);

  return {
    domain,
    user: {
      username: `validUser-${randomId}`,
      password: mockPassword,
      name: `Valid User`,
      email: `validUser-${randomId}@${domain}`,
    },
  };
};

export { getMockData, mockPassword };
