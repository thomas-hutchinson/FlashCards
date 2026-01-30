module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: ['**/tests/*.test.js'],
    testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
    collectCoverageFrom: ['app.js'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    testTimeout: 10000,
    moduleFileExtensions: ['js', 'json'],
    transform: {},
    globals: {
        'jest': true
    }
};
