module.exports = {
  testEnvironment: "node", // Use Node.js environment
  setupFilesAfterEnv: ["./jest.setup.js"], // Files to run after the environment is set up
  transform: {
    "^.+\\.js$": "babel-jest", // Use Babel to transform .js files
  },
  transformIgnorePatterns: [
    "/node_modules/(?!your-module-name)", // Ignore node_modules except specific modules
  ],
  // Coverage configuration
  collectCoverage: true, // Enable coverage collection
  coverageDirectory: "coverage", // Directory where coverage reports will be saved
  collectCoverageFrom: [
    "**/controllers/**/*.js", // Include all JavaScript files
    "!**/node_modules/**", // Exclude node_modules
    "!**/coverage/**", // Exclude the coverage directory
    "!**/jest.config.js", // Exclude Jest config file
    "!**/jest.setup.js", // Exclude Jest setup file
    "!**/tests/**", // Exclude test files
  ],
  coverageReporters: ["text", "lcov", "html"], // Report formats
};