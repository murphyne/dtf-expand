import {
  retrieveContentFromApi,
} from '../src/retrieve-api.js';

export {
  augmentFeedItems,
  augmentWithContent,
};

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
      window.Air.get("module.quiz").refresh();
      window.Air.get("module.andropov").refresh();
    });

    let headerLeft = feedItem.querySelector('.content-header__left');
    headerLeft.appendChild(aElement);
  });
}

async function augmentWithContent (item) {
  console.log('ExpandDTF: item %o', item);

  var itemContent = item.getElementsByClassName('content')[0];
  var itemHeader = item.getElementsByClassName('content-header')[0];
  var itemTitle = item.getElementsByClassName('content-title')[0];
  var itemLink = item.getElementsByClassName('content-link')[0];

  var responseContent = await retrieveContentFromApi(itemLink.href);

  itemContent.remove();
  responseContent.classList.remove('content--short');
  responseContent.classList.add('content--full');
  itemHeader.insertAdjacentElement('afterend', responseContent);
  itemLink.classList.remove('content-link');
  itemHeader.insertAdjacentElement('afterend', itemLink);
  itemLink.insertAdjacentElement('afterbegin', itemTitle);
}
