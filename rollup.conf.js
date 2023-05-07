import virtual from '@rollup/plugin-virtual';

let bannerText = `
// ==UserScript==
// @name         DTF: Expand feed items
// @version      0.7.0
// @description  Expand feed items!
// @author       murphyne
// @namespace    https://github.com/murphyne
// @match        *://dtf.ru/*
// @grant        GM_addStyle
// ==/UserScript==
`;

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/dtf-expand.user.js',
      format: 'esm',
      banner: bannerText.trimStart(),
    },
  },
  {
    input: 'entry',
    plugins: [
      virtual({ entry: '' }),
    ],
    output: {
      file: 'dist/dtf-expand.meta.js',
      format: 'esm',
      banner: bannerText.trim(),
    },
  },
];
