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
  var responseContent = responseDom.getElementsByClassName('content--full')[0];

  responseContent.getElementsByClassName('l-fa-center')[0] &&
    responseContent.getElementsByClassName('l-fa-center')[0].remove();

  responseContent.classList.remove('content--full');
  responseContent.classList.add('content--short');

  return responseContent;
}
