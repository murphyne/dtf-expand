export {
  retrieveContentFromApi,
}

/**
 * @param {string} itemUrl
 * @returns {Promise<Element>}
 * @throws {TypeError}
 */
async function retrieveContentFromApi (itemUrl) {
  var response = await fetch(`https://api.dtf.ru/v1.8/entry/locate?url=${itemUrl}`);
  var responseText = await response.text();
  var responseJson = JSON.parse(responseText);
  var responseHtml = responseJson.result.entryContent.html;
  var responseDom = new DOMParser().parseFromString(responseHtml, 'text/html');
  var responseContent = responseDom.getElementsByClassName('content--full')[0];

  responseContent.classList.remove('content--full');
  responseContent.classList.add('content--short');

  return responseContent;
}
