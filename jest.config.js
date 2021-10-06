module.exports = {
    collectCoverage: true,
    coverageReporters: ["lcov"],
    collectCoverageFrom: ["src/**/*.js"],
    testMatch: ["**/**.spec.js", "**/**/**.spec.js", "tests/**/**.spec.js", "tests/**/**/**.spec.js"],
    transform: { '^.+\\.jsx?$': 'babel-jest' }
};
