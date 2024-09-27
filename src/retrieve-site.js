export {
  retrieveContentFromSite,
}

let config = {
  classItemContentShort: 'content__blocks',
};

/**
 * @param {string} itemUrl
 * @returns {Promise<Element>}
 * @throws {TypeError}
 */
async function retrieveContentFromSite (itemUrl) {
  var response = await fetch(itemUrl);
  var responseText = await response.text();
  var responseDom = new DOMParser().parseFromString(responseText, 'text/html');
  var responseContent = responseDom.getElementsByClassName(config.classItemContentShort)[0];

  return responseContent;
}
