const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use Node file crawler instead of Watchman to avoid macOS fd-limit issues.
config.resolver.useWatchman = false;

module.exports = config;