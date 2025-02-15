// jest.config.ts
import type { InitialOptionsTsJest } from 'ts-jest';

const config: InitialOptionsTsJest = {
  verbose: true,
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: { '^.+\\.tsx ? $': 'ts-jest' },
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      isolatedModules: true,
      diagnostics: false,
      babelConfig: true
    }
  },
  testTimeout: 60000,
  globalSetup: './tests/setup.ts'
};

export default config;
