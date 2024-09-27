export {
  retrieveContentFromSite,
}

import {
  selectorItemContent,
} from "./selectors.js";

/**
 * @param {string} itemUrl
 * @returns {Promise<Element>}
 * @throws {TypeError}
 */
async function retrieveContentFromSite (itemUrl) {
  var response = await fetch(itemUrl);
  var responseText = await response.text();
  var responseDom = new DOMParser().parseFromString(responseText, 'text/html');
  var responseContent = responseDom.querySelector(selectorItemContent);

  return responseContent;
}
