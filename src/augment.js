import {
  retrieveContentFromSite,
} from '../src/retrieve-site.js';

export {
  augmentFeedItems,
  augmentWithContent,
};

import {
  selectorItem,
  classItemContentShort,
  classItemContentFull,
  classItemHeader,
  selectorItemHeaderButtons,
  classItemContainer,
  classItemTitle,
  classItemLink,
  classItemLinkInline,
} from "./selectors.js";

/**
 * @param {Array<Element>} items
 * @returns {Array<Promise>}
 */
function augmentFeedItems (items) {
  items.forEach(async function (feedItem) {
    let html = `
      <button class="button button--size-s button--type-minimal" type="button">
        Весь текст
      </button>
    `;

    let buttonElement = await Promise.resolve(html)
      .then(str => new DOMParser().parseFromString(str, 'text/html'))
      .then(doc => doc.body.firstElementChild);

    buttonElement.addEventListener('click', async function (event) {
      event.preventDefault();

      let feedItem = event.target.closest(selectorItem);
      await augmentWithContent(feedItem);

      //TODO: Fix initialization of `.andropov-video` elements.
    });

    let headerInfo = feedItem.querySelector(selectorItemHeaderButtons);
    headerInfo.appendChild(buttonElement);
  });
}

/**
 * @param {Element} item
 * @throws {TypeError}
 */
async function augmentWithContent (item) {
  console.log('ExpandDTF: item %o', item);

  var itemContentShort = item.getElementsByClassName(classItemContentShort)[0];
  var itemContentFull = item.getElementsByClassName(classItemContentFull)[0];
  var itemHeader = item.getElementsByClassName(classItemHeader)[0];
  var itemContainer = item.getElementsByClassName(classItemContainer)[0];
  var itemTitle = item.getElementsByClassName(classItemTitle)[0];
  var itemLink = item.getElementsByClassName(classItemLink)[0];

  if (!itemContentFull) {
    var responseContent = await retrieveContentFromSite(itemLink.href);
    responseContent.classList.remove(classItemContentShort);
    responseContent.classList.add(classItemContentFull);
    responseContent.hidden = true;
    itemContentShort.insertAdjacentElement('afterend', responseContent);
    itemContentFull = responseContent;
  }

  if (itemContentFull.hidden) {
    itemContentShort.hidden = true;
    itemContentFull.hidden = false;
    itemLink.classList.add(classItemLinkInline);
    itemLink && itemHeader.insertAdjacentElement('afterend', itemLink);
    itemTitle && itemLink.insertAdjacentElement('afterbegin', itemTitle);
  }
  else {
    itemContentShort.hidden = false;
    itemContentFull.hidden = true;
    itemLink.classList.remove(classItemLinkInline);
    itemLink && itemContainer.insertAdjacentElement('beforeend', itemLink);
    itemTitle && itemContainer.insertAdjacentElement('afterbegin', itemTitle);
  }
}
