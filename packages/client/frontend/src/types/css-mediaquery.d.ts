/* Type definitions for css-mediaquery */

/* eslint-disable-next-line quotes */
declare module 'css-mediaquery' {
  export const match: (
    mediaQuery: string,
    values: { type?: string; width?: string | number },
  ) => boolean;
}
