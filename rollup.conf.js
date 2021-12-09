let bannerText = `
// ==UserScript==
// @name         DTF: Expand feed items
// @version      0.4.0
// @description  Expand feed items!
// @author       murphyne
// @namespace    https://github.com/murphyne
// @match        *://dtf.ru/*
// @grant        none
// ==/UserScript==
`;

module.exports = {
  input: 'src/main.js',
  output: {
    file: 'dist/dtf-expand.user.js',
    format: 'esm',
    banner: bannerText.trimStart(),
  },
};
