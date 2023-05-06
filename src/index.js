export {
  dtfExpandFeed,
};

import {
  augmentFeedItems,
} from '../src/augment.js';

const config = {
  idPageWrapper: 'page_wrapper',
  classFeedContainer: 'feed__container',
  classFeedItem: 'feed__item',
};

const cssStyle = `
.content-link-inline {
  display: revert;
  /* width: revert; */
  /* height: revert; */
  position: revert;
}
`;

async function dtfExpandFeed () {
  "use strict";

  GM_addStyle(cssStyle);

  //We need the pageWrapper to acquire feedContainer
  const pageWrapper = document.getElementById(config.idPageWrapper);
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
  const feedContainer = pageWrapper.getElementsByClassName(config.classFeedContainer)[0];
  if (feedContainer) {
    console.log('ExpandDTF: feedContainer found %o', feedContainer);

    processFeedItems(feedContainer);

    observeFeedItems(feedContainer);
  }

  /**
   * @param {MutationRecord[]} mutations
   * @param {MutationObserver} observer
   */
  function pageWrapperCallback (mutations, observer) {
    outer_loop:
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];

        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        const feedContainer = node.getElementsByClassName(config.classFeedContainer)[0];
        if (feedContainer) {
          console.log('ExpandDTF: feedContainer found %o', feedContainer);

          processFeedItems(feedContainer);

          observeFeedItems(feedContainer);

          break outer_loop;
        }
      }
    }
  }

  /**
   * @param {MutationRecord[]} mutations
   * @param {MutationObserver} observer
   */
  function pageWrapperCallbackGenerator (mutations, observer) {
    for (let node of traverseAddedNodes(mutations)) {

      if (node.nodeType !== Node.ELEMENT_NODE) continue;

      const feedContainer = node.getElementsByClassName(config.classFeedContainer)[0];
      if (feedContainer) {
        console.log('ExpandDTF: feedContainer found %o', feedContainer);

        processFeedItems(feedContainer);

        observeFeedItems(feedContainer);

        break;
      }
    }
  }

  /**
   * @param {MutationRecord[]} mutations
   * @param {MutationObserver} observer
   */
  function feedContainerCallback (mutations, observer) {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];
        processFeedItems(node);
      }
    }
  }

  /**
   * @param {MutationRecord[]} mutations
   * @param {MutationObserver} observer
   */
  function feedContainerCallbackGenerator (mutations, observer) {
    for (let node of traverseAddedNodes(mutations)) {
      processFeedItems(node);
    }
  }

  /**
   * Unwrap mutations array into nodes array
   * @param {MutationRecord[]} mutations
   * @yields {Node}
   */
  function* traverseAddedNodes (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];
        yield node;
      }
    }
  }

  /**
   * Process existing feed items in node
   * @param {Element} node
   */
  function processFeedItems (node) {
    const feedItems = getFeedItems(node);
    augmentFeedItems(feedItems);
  }

  /**
   * Wait for new feed items to appear in node
   * @param {Element} node
   */
  function observeFeedItems (node) {
    feedContainerObserver.disconnect();
    feedContainerObserver.observe(node, {childList: true});
  }

  /**
   * Get all existing feed items in node
   * @param {Element} node
   * @returns {Element[]}
   */
  function getFeedItems (node) {
    return Array.from(node.getElementsByClassName(config.classFeedItem));
  }
}
