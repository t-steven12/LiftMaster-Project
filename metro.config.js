// Code for this component/file based on the following tutorials by Simon Grimm:
// 1. https://www.youtube.com/watch?v=ONAVmsGW6-M&t=1172s
// 2. https://www.youtube.com/watch?v=TwxdOFcEah4&t=1225s

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push('cjs')

module.exports = defaultConfig;
