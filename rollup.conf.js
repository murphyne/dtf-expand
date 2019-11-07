let bannerText = `
// ==UserScript==
// @name         DTF: Expand feed items
// @namespace    http://tampermonkey.net/
// @version      0.4.0
// @description  Expand feed items!
// @author       mr-m
// @match        *://dtf.ru/*
// @grant        none
// ==/UserScript==
`;

module.exports = {
  input: 'src/src.js',
  output: {
    file: 'dist/dtf-expand.user.js',
    format: 'esm',
    banner: bannerText.trimStart(),
  },
};
