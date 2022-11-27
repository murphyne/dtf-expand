export {
  dtfExpandFeed,
};

import {
  augmentFeedItems,
} from '../src/augment.js';

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

    processFeedItems(feedContainer);

    observeFeedItems(feedContainer);
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

        processFeedItems(feedContainer);

        observeFeedItems(feedContainer);

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

      processFeedItems(feedContainer);

      observeFeedItems(feedContainer);

      break;
    }
  }

  function feedContainerCallback (mutations) {
    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      for (let j = 0; j < mutation.addedNodes.length; j++) {
        const node = mutation.addedNodes[j];
        processFeedItems(node);
      }
    }
  }

  function feedContainerCallbackGenerator (mutations) {
    for (let node of traverseAddedNodes(mutations)) {
      processFeedItems(node);
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
    return Array.from(node.getElementsByClassName('feed__item'));
  }
}
