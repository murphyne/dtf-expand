export {
  dtfExpandFeed,
};

import {
  retrieveContentFromApi,
} from '../src/retrieve-api.js';

async function dtfExpandFeed () {
  "use strict";

  //We need the pageWrapper to acquire feedContainer
  const pageWrapper = document.getElementById('page_wrapper');
  if (!pageWrapper) {
    //It seems that a pageWrapper is always present on the page.
    //Yet, if we are unable to find it, we can't continue.
    console.error('ExpandDTF: pageWrapper not found');
    return;
  }

  //While you browse the site, feedContainer can be deleted or added.
  //That's why we need to track DOM mutations in pageWrapper.
  const pageWrapperObserver = new MutationObserver(pageWrapperCallback);
  pageWrapperObserver.observe(pageWrapper, {childList: true});

  const feedContainerObserver = new MutationObserver(feedContainerCallback);

  //More info on the lifetime of MutationObserver
  //https://stackoverflow.com/q/35253565

  //Check if feedContainer is already present on the page
  const feedContainer = pageWrapper.getElementsByClassName('feed__container')[0];
  if (feedContainer) {
    console.log('ExpandDTF: feedContainer present %o', feedContainer);

    //Augment existing feed items
    const feedItems = Array.from(feedContainer.getElementsByClassName('feed__item'));
    augmentFeedItems(feedItems);

    //Wait for new feed items
    feedContainerObserver.disconnect();
    feedContainerObserver.observe(feedContainer, {childList: true});
  }

  function pageWrapperCallback (mutations) {
    outer_loop:
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];

        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const feedContainer = node.getElementsByClassName('feed__container')[0];
        if (!feedContainer) continue;

        console.log('ExpandDTF: feedContainer found %o', feedContainer);

        //Augment existing feed items
        const feedItems = Array.from(feedContainer.getElementsByClassName('feed__item'));
        augmentFeedItems(feedItems);

        //Wait for new feed items
        feedContainerObserver.disconnect();
        feedContainerObserver.observe(feedContainer, {childList: true});

        break outer_loop;
      }
    }
  }

  function pageWrapperCallbackGenerator (mutations) {
    for (let node of traverseAddedNodes(mutations)) {

      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const feedContainer = node.getElementsByClassName('feed__container')[0];
      if (!feedContainer) continue;

      console.log('ExpandDTF: feedContainer found %o', feedContainer);

      //Augment existing feed items
      const feedItems = Array.from(feedContainer.getElementsByClassName('feed__item'));
      augmentFeedItems(feedItems);

      //Wait for new feed items
      feedContainerObserver.disconnect();
      feedContainerObserver.observe(feedContainer, {childList: true});

      break;
    }
  }

  function feedContainerCallback (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];

        //Augment new feed items
        const feedItems = Array.from(node.getElementsByClassName('feed__item'));
        augmentFeedItems(feedItems);
      }
    }
  }

  function feedContainerCallbackGenerator (mutations) {
    for (let node of traverseAddedNodes(mutations)) {

      //Augment new feed items
      const feedItems = Array.from(node.getElementsByClassName('feed__item'));
      augmentFeedItems(feedItems);
    }
  }

  function* traverseAddedNodes (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];
        yield node;
      }
    }
  }
}

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
  var itemTitle = item.getElementsByClassName('content-header__title')[0];
  var itemLink = item.getElementsByClassName('content-feed__link')[0];

  var responseContent = await retrieveContentFromApi(itemLink.href);

  itemContent.remove();
  itemHeader.insertAdjacentElement('afterend', responseContent);
  itemLink.classList.remove('content-feed__link');
  itemHeader.insertAdjacentElement('beforeend', itemLink);
  itemLink.insertAdjacentElement('afterbegin', itemTitle);
}
