export {
  retrieveContentFromApi,
}

/**
 * @param {string} itemId
 * @returns {Promise<Element>}
 * @throws {TypeError}
 */
async function retrieveContentFromApi (itemId) {
  var response = await fetch(`https://api.dtf.ru/v2.31/content?id=${itemId}`);
  var responseText = await response.text();
  var responseJson = JSON.parse(responseText);
  var responseHtml = responseJson.result.html.layout;
  var responseDom = new DOMParser().parseFromString(responseHtml, 'text/html');
  var responseContent = responseDom.getElementsByClassName('content--full')[0];

  responseContent.classList.remove('content--full');
  responseContent.classList.add('content--short');

  return responseContent;
}
