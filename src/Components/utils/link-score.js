const localforage = require('localforage');

let websiteWeights =
    [{
        href: 'youtube.com',
        weight: 0.2
    }, {
        href: 'youtu.be',
        weight: 0.2
    }, {
        href: 'medium.com',
        weight: 1.2
    }];

export let linkScore = {
    getOPWeight(thread) {
        //Amount of links in the Original Post
        let opLinksObject = thread.links.find(link => link.postNo === 0);
        if (!opLinksObject) {
            return 0;
        }

        let opLinkCount = opLinksObject.linksInPost.length;

        //let weightedHrefsFoundArray = [];
        let weightedHrefsFoundArray = opLinksObject.linksInPost.reduce((arr, link) => {
            let found = websiteWeights.find(website => link.href.toLowerCase().includes(website.href));
            if (found) {
                arr.push(found.href);
            }
            return arr;
        }, []);


        let totalWeight = websiteWeights.reduce((sum, weightedWebsite) => {
            let count = weightedHrefsFoundArray.filter(href => href === weightedWebsite.href).length;
            return sum + count * weightedWebsite.weight;
        }, 0);

        let opLinkWeight = (opLinkCount - weightedHrefsFoundArray.length) + totalWeight;

        return opLinkWeight;
    },
    getAllWeight(thread) {
        //Exclude the OP post from link counting
        let filteredLinks = thread.links.filter(post => post.postNo !== 0);
        //Amount of links in all posts
        let linkCount = filteredLinks.reduce((counter, links) => counter + links.linksInPost.length, 0);

        let weightedHrefsFoundArray = filteredLinks.map(post => {
            let hrefsArray = post.linksInPost.reduce((arr, link) => {
                let found = websiteWeights.find(website => link.href.toLowerCase().includes(website.href));
                if (found) {
                    arr.push(found.href);
                }
                return arr;
            }, []);
            return hrefsArray;
        });
        weightedHrefsFoundArray = weightedHrefsFoundArray.flat();

        let totalWeight = websiteWeights.reduce((sum, weightedWebsite) => {
            let count = weightedHrefsFoundArray.filter(href => href === weightedWebsite.href).length;
            return sum + count * weightedWebsite.weight;
        }, 0);

        let linkWeight = (linkCount - weightedHrefsFoundArray.length) + totalWeight;

        return linkWeight;
    }
}