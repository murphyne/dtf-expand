// ==UserScript==
// @name         DTF: Expand feed items
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @description  Expand feed items!
// @author       mr-m
// @match        *://dtf.ru/*
// @grant        none
// ==/UserScript==

;(async function dtfExpandFeed () {
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
})();

function toChunks (arr, chunkSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
}

async function augmentFeedItems (items) {
    for (let chunk of toChunks(items, 3)) {
        const promises = chunk.map(function (feedItem) {
            return augmentWithContent(feedItem)
                .catch(function (reason) { return reason; });
        });
        await Promise.all(promises);

        //Apparently quiz module is initialized before augmentation fulfills.
        //Here, we force the module to initialize again after the augmentation.
        window.Air.get("module.quiz").init();
    }
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

async function retrieveContentFromSite (itemLink) {
    var response = await fetch(itemLink);
    if (response.ok) {
        var responseText = await response.text();
        var responseDoc = new DOMParser().parseFromString(responseText, 'text/html');
        var responseContent = responseDoc.getElementsByClassName('content--full')[0];

        responseContent.getElementsByClassName('l-fa-center')[0] &&
            responseContent.getElementsByClassName('l-fa-center')[0].remove();

        responseContent.classList.remove('content--full');
        responseContent.classList.add('content--short');

        return responseContent;
    }
    else {
        console.error('ExpandDTF: fetch failed ' + response.status);
    }
}

async function retrieveContentFromApi (itemLink) {
    var response = await fetch(`https://api.dtf.ru/v1.8/entry/locate?url=${itemLink}`);
    if (response.ok) {
        var responseJson = await response.json();
        var responseText = responseJson.result.entryContent.html;
        var responseDoc = new DOMParser().parseFromString(responseText, 'text/html');
        var responseContent = responseDoc.getElementsByClassName('content--full')[0];

        responseContent.classList.remove('content--full');
        responseContent.classList.add('content--short');

        return responseContent;
    }
    else {
        console.error('ExpandDTF: fetch failed ' + response.status);
    }
}
