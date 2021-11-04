import virtual from '@rollup/plugin-virtual';
import pkg from './package.json';

let bannerText = `
// ==UserScript==
// @name         DTF: Expand feed items
// @version      ${pkg.version}
// @description  Expand feed items!
// @license      MIT
// @author       murphyne
// @namespace    https://github.com/murphyne
// @match        *://dtf.ru/*
// @updateUrl    https://github.com/murphyne/dtf-expand/releases/latest/download/dtf-expand.meta.js
// @downloadUrl  https://github.com/murphyne/dtf-expand/releases/latest/download/dtf-expand.user.js
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
