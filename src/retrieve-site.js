export {
  retrieveContentFromSite,
}

/**
 * @param {string} itemUrl
 * @returns {Promise<Element>}
 * @throws {TypeError}
 */
async function retrieveContentFromSite (itemUrl) {
  var response = await fetch(itemUrl);
  var responseText = await response.text();
  var responseDom = new DOMParser().parseFromString(responseText, 'text/html');
  var responseContent = responseDom.getElementsByClassName('content__blocks')[0];

  return responseContent;
}
