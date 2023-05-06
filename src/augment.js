import {
  retrieveContentFromApi,
} from '../src/retrieve-api.js';

export {
  augmentFeedItems,
  augmentWithContent,
};

const config = {
  classItemContent: 'content',
  classItemContentShort: 'content--short',
  classItemContentFull: 'content--full',
  classItemHeader: 'content-header',
  classItemTitle: 'content-title',
  classItemLink: 'content-link',
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

  var itemContentShort = item.getElementsByClassName(config.classItemContentShort)[0];
  var itemContentFull = item.getElementsByClassName(config.classItemContentFull)[0];
  var itemHeader = item.getElementsByClassName(config.classItemHeader)[0];
  var itemTitle = item.getElementsByClassName(config.classItemTitle)[0];
  var itemLink = item.getElementsByClassName(config.classItemLink)[0];

  if (!itemContentFull) {
    var responseContent = await retrieveContentFromApi(itemLink.href);

    itemContentShort.hidden = true;
    responseContent.classList.remove(config.classItemContentShort);
    responseContent.classList.add(config.classItemContentFull);
    itemHeader.insertAdjacentElement('afterend', responseContent);
    itemLink.classList.remove(config.classItemLink);
    itemHeader.insertAdjacentElement('afterend', itemLink);
    itemLink.insertAdjacentElement('afterbegin', itemTitle);

    itemContentFull = responseContent;
  }
}
