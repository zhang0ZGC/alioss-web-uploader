module.exports = {
  preset: 'ts-jest',
  // https://jestjs.io/docs/en/configuration#testenvironment-string
  // testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  // testRegex: '/tests/.*.test.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
   "^@/(.*)$": "<rootDir>/src/$1"
  }
};
