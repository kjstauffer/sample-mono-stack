import config from 'config';

import type { CorsOptions } from 'cors';

/**
 * Returns supported CORS options.
 * Loops through all supported domains and makes them available for CORS.
 */
export const corsOptions: CorsOptions = {
  origin(
    requestOrigin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) {
    /* Verify the request origin. */
    if (requestOrigin) {
      const supportedOrigins = [config.get<string>(`domain`)];
      const port = config.has(`domainPort`) ? config.get<number>(`domainPort`) : ``;

      const domainRegexStrings: string[] = [];
      supportedOrigins.reduce((regexStrings, supportedOrigin) => {
        if (port) {
          regexStrings.push(`(.${supportedOrigin}(:${port})?$)`);
        } else {
          regexStrings.push(`(.${supportedOrigin}$)`);
        }

        return regexStrings;
      }, domainRegexStrings);

      const regexStr = domainRegexStrings.join(`|`);
      const regex = new RegExp(regexStr);

      callback(null, regex.test(requestOrigin));
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 600,
};
