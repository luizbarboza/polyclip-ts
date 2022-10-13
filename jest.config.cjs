module.exports = {
    collectCoverage: true,
    testEnvironment: "node",
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transformIgnorePatterns: [
        "node_modules/(?!splaytree-ts)"
    ],
}