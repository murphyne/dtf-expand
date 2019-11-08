export {
  retrieveContentFromSite,
}

/**
 * @param {string} itemLink
 * @returns {Promise<Element>}
 * @throws {TypeError}
 */
async function retrieveContentFromSite (itemLink) {
  var response = await fetch(itemLink);
  var responseText = await response.text();
  var responseDoc = new DOMParser().parseFromString(responseText, 'text/html');
  var responseContent = responseDoc.getElementsByClassName('content--full')[0];

  responseContent.getElementsByClassName('l-fa-center')[0] &&
    responseContent.getElementsByClassName('l-fa-center')[0].remove();

  responseContent.classList.remove('content--full');
  responseContent.classList.add('content--short');

  return responseContent;
}
