import config from 'config';

const mockData = {
  domain: config.get<string>(`domain`),
};

export { mockData };
