import {
  retrieveContentFromApi,
} from '../src/retrieve-api.js';

export {
  augmentFeedItems,
  augmentWithContent,
};

const config = {
  classItemContent: 'content',
  classItemContentFeed: 'content-feed',
  classItemContentShort: 'content--short',
  classItemContentFull: 'content--full',
  classItemHeader: 'content-header',
  classItemContainer: 'content-container',
  classItemTitle: 'content-title',
  classItemLink: 'content-link',
  classItemLinkInline: 'content-link-inline',
};

/**
 * @param {Array<Element>} items
 * @returns {Array<Promise>}
 */
function augmentFeedItems (items) {
  items.forEach(async function (feedItem) {
    let html = `
      <a class="content-header-number content-header__item">
        <div class="content-header-author__avatar">
          <svg class="icon icon--favorite_marker" width="18" height="18" viewBox="0 0 24 24" style="fill:none;stroke-width:2;stroke:currentColor">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
        <div class="content-header-author__name">Весь текст</div>
      </a>
    `;

    let aElement = await Promise.resolve(html)
      .then(str => new DOMParser().parseFromString(str, 'text/html'))
      .then(doc => doc.body.firstElementChild);

    aElement.addEventListener('click', async function (event) {
      event.preventDefault();

      let feedItem = event.target.closest('.feed__item');
      await augmentWithContent(feedItem);

      //Apparently Air modules are run before augmentation fulfills.
      //Here, we force the modules to run again after the augmentation.
      unsafeWindow.Air.get("module.quiz").refresh();
      unsafeWindow.Air.get("module.andropov").refresh();
      unsafeWindow.Air.get("module.gallery").refresh();
    });

    let headerInfo = feedItem.querySelector('.content-header__info');
    headerInfo.appendChild(aElement);
  });
}

/**
 * @param {Element} item
 * @throws {TypeError}
 */
async function augmentWithContent (item) {
  console.log('ExpandDTF: item %o', item);

  var itemContentFeed = item.getElementsByClassName(config.classItemContentFeed)[0];
  var itemContentShort = item.getElementsByClassName(config.classItemContentShort)[0];
  var itemContentFull = item.getElementsByClassName(config.classItemContentFull)[0];
  var itemHeader = item.getElementsByClassName(config.classItemHeader)[0];
  var itemContainer = item.getElementsByClassName(config.classItemContainer)[0];
  var itemTitle = item.getElementsByClassName(config.classItemTitle)[0];
  var itemLink = item.getElementsByClassName(config.classItemLink)[0];

  if (!itemContentFull) {
    var responseContent = await retrieveContentFromApi(itemContentFeed.dataset.contentId);
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
