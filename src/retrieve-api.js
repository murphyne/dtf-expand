export {
  retrieveContentFromApi,
}

/**
 * @param {string} itemLink
 * @returns {Promise<Element>}
 * @throws {TypeError}
 */
async function retrieveContentFromApi (itemLink) {
  var response = await fetch(`https://api.dtf.ru/v1.8/entry/locate?url=${itemLink}`);
  var responseJson = await response.json();
  var responseText = responseJson.result.entryContent.html;
  var responseDoc = new DOMParser().parseFromString(responseText, 'text/html');
  var responseContent = responseDoc.getElementsByClassName('content--full')[0];

  responseContent.classList.remove('content--full');
  responseContent.classList.add('content--short');

  return responseContent;
}
