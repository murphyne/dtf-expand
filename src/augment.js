import {
  retrieveContentFromSite,
} from '../src/retrieve-site.js';

export {
  augmentFeedItems,
  augmentWithContent,
};

const config = {
  classItemContentShort: 'content__blocks',
  classItemContentFull: 'content__blocks-full',
  classItemHeader: 'content-header',
  classItemContainer: 'content__body',
  classItemTitle: 'content-title',
  classItemLink: 'content__link',
  classItemLinkInline: 'content__link-inline',
};

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

      let feedItem = event.target.closest('.content');
      await augmentWithContent(feedItem);

      //Apparently Air modules are run before augmentation fulfills.
      //Here, we force the modules to run again after the augmentation.
      unsafeWindow.Air.get("module.quiz").refresh();
      unsafeWindow.Air.get("module.andropov").refresh();
      unsafeWindow.Air.get("module.gallery").refresh();
    });

    let headerInfo = feedItem.querySelector('.content-header__actions');
    headerInfo.appendChild(buttonElement);
  });
}

/**
 * @param {Element} item
 * @throws {TypeError}
 */
async function augmentWithContent (item) {
  console.log('ExpandDTF: item %o', item);

  var itemContentShort = item.getElementsByClassName(config.classItemContentShort)[0];
  var itemContentFull = item.getElementsByClassName(config.classItemContentFull)[0];
  var itemHeader = item.getElementsByClassName(config.classItemHeader)[0];
  var itemContainer = item.getElementsByClassName(config.classItemContainer)[0];
  var itemTitle = item.getElementsByClassName(config.classItemTitle)[0];
  var itemLink = item.getElementsByClassName(config.classItemLink)[0];

  if (!itemContentFull) {
    var responseContent = await retrieveContentFromSite(itemLink.href);
    responseContent.classList.remove(config.classItemContentShort);
    responseContent.classList.add(config.classItemContentFull);
    responseContent.hidden = true;
    itemContentShort.insertAdjacentElement('afterend', responseContent);
    itemContentFull = responseContent;
  }

  if (itemContentFull.hidden) {
    itemContentShort.hidden = true;
    itemContentFull.hidden = false;
    itemLink.classList.add(config.classItemLinkInline);
    itemLink && itemHeader.insertAdjacentElement('afterend', itemLink);
    itemTitle && itemLink.insertAdjacentElement('afterbegin', itemTitle);
  }
  else {
    itemContentShort.hidden = false;
    itemContentFull.hidden = true;
    itemLink.classList.remove(config.classItemLinkInline);
    itemLink && itemContainer.insertAdjacentElement('afterend', itemLink);
    itemTitle && itemContainer.insertAdjacentElement('afterbegin', itemTitle);
  }
}
