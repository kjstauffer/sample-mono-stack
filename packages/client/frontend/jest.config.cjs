const jestConfig = require(`../../../testing/jest-client.cjs`);
const { URL_PATHS } = require(`./src/static/urlPaths.cjs`);
const babelConfig = require(`../../../babel.config.cjs`)({
  env: () => { return `test`},
});

module.exports = {
  ...jestConfig,
  globals: {
    ...jestConfig.globals,
    URL_PATHS,
  },
  displayName: `c:frontend`,
  // setupFiles: [`<rootDir>/src/testing/setup.ts`],
  transformIgnorePatterns: [`node_modules/(?!(~.+)/)`],
  transform: {
    '^.+\\.cjs$': `babel-jest`,
		/* Transform jsx & tsx files to CommonJS using babel. */
		'\\.[jt]sx?$': [
			'babel-jest',
			{
				presets: babelConfig.presets.map(preset => {
					if (Array.isArray(preset) && preset[0] === "@babel/preset-env") {
						return [
							"@babel/preset-env",
							{
								...preset[1],
								modules: "commonjs",
							}
						]
					}
					return preset;
				}),
			},
		],
	},
};
