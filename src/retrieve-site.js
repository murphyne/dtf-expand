export {
  retrieveContentFromSite,
}

import {
  classItemContentShort,
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
  var responseContent = responseDom.getElementsByClassName(classItemContentShort)[0];

  return responseContent;
}
