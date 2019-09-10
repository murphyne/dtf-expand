let bannerText = `
// ==UserScript==
// @name         DTF: Expand feed items
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @description  Expand feed items!
// @author       mr-m
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
