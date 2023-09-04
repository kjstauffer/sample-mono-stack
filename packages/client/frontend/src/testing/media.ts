import mediaQuery from 'css-mediaquery';

export const breakpoints = {
  xs: 1,
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
} as const;

export type MediaWidth = number | keyof typeof breakpoints;

/**
 * Returns a function that mocks the `matchMedia` function on the Window object.
 */
export const createMatchMedia =
  (width: number) =>
  (query: string): MediaQueryList => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    dispatchEvent() {
      return true;
    },
    onchange() {
      return true;
    },
    addListener() {
      return true;
    },
    removeListener() {
      return true;
    },
    addEventListener() {
      return true;
    },
    removeEventListener() {
      return true;
    },
  });

/**
 * Override the Window object's `matchMedia` function with the mocked function.
 */
export const setMatchMedia = (width: MediaWidth) => {
  window.matchMedia = createMatchMedia(typeof width === `number` ? width : breakpoints[width]);
};

afterEach(() => {
  /**
   * Needs to be set back to `undefined` after each test to ensure each test is clean.
   */
  (window.matchMedia as unknown) = undefined;
});
