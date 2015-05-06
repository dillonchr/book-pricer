(function() {
    'use strict';

    angular.module('ebay-searcher')
        .service('Search', function($http, $q) {
            var EBAY_API_KEY = 'DillonCh-4ce2-442c-b779-8d0905e2d5e4';
            var ETSY_API_KEY = '6bgkt070ccbgvrxn6ze6oj59';
            var REGEX = {
                AUDIOBOOK: /audiobook|[^\w]cd[^\w]|cds/i,
                LEATHER: /[^\w]leather|deluxe/i,
                LOT: /[^\w]set[^\w]|[^\w]lot[^\w]/i,
                SIGNED: /signed|inscribed|autograph/i
            };

            function ebaySearch(q) {
                return $http.jsonp("http://svcs.ebay.com/services/search/FindingService/v1" +
                    "?OPERATION-NAME=findCompletedItems" +
                    "&SERVICE-VERSION=1.0.0" +
                    "&SECURITY-APPNAME=" + EBAY_API_KEY +
                    "&GLOBAL-ID=EBAY-US" +
                    "&RESPONSE-DATA-FORMAT=JSON" +
                    "&callback=JSON_CALLBACK" +
                    "&REST-PAYLOAD" +
                    "&itemFilter(0).name=SoldItemsOnly" +
                    "&itemFilter(0).value=true" +
                    "&itemFilter(1).name=HideDuplicateItems" +
                    "&itemFilter(1).value=true" +
                    "&paginationInput.entriesPerPage=100" +
                    "&sortOrder=PricePlusShippingHighest" +
                    "&categoryId=267" +
                    "&keywords=" + q)
                    .then(function(response) {
                        return response.data.findCompletedItemsResponse[0].searchResult[0].item
                            .map(function(listing) {
                                return {
                                    price: parseFloat(listing.sellingStatus[0].convertedCurrentPrice[0].__value__),
                                    imageUrl: (listing.galleryURL || [])[0],
                                    name: listing.title[0],
                                    date: moment(listing.listingInfo[0].endTime[0]).fromNow(),
                                    url: listing.viewItemURL[0],
                                    signed: !!listing.title[0].match(REGEX.SIGNED),
                                    lot: !!listing.title[0].match(REGEX.LOT),
                                    audiobook: !!listing.title[0].match(REGEX.AUDIOBOOK),
                                    leather: !!listing.title[0].match(REGEX.LEATHER)
                                };
                            });
                    });
            }

            function etsySearch(q) {
                return $http.jsonp('https://openapi.etsy.com/v2/listings/active.js' +
                    '?callback=JSON_CALLBACK' +
                    '&limit=100' +
                    '&includes=Images:1' +
                    '&api_key=' + ETSY_API_KEY +
                    '&keywords=' + q)
                    .then(function(response) {
                        return response.data.results.map(function(listing) {
                            var searchableText = listing.title + ' ' + listing.description;
                            return {
                                price: parseFloat(listing.price),
                                imageUrl: (listing.Images || [{url_170x135: null}])[0].url_170x135,
                                name: listing.title,
                                date: moment.unix(listing.creation_tsz).fromNow(),
                                url: listing.url,
                                signed: !!searchableText.match(REGEX.SIGNED),
                                lot: !!searchableText.match(REGEX.LOT),
                                audiobook: !!searchableText.match(REGEX.AUDIOBOOK),
                                leather: !!searchableText.match(REGEX.LEATHER),
                                etsy: true
                            };
                        });
                    });
            }

            this.search = function(q, includeEtsy) {
                var query = encodeURIComponent(q);
                var requests = [ebaySearch(query)];
                if(includeEtsy) {
                    requests.push(etsySearch(query));
                }
                return $q.all(requests)
                    .then(function(results) {
                        return results.reduce(function(coll, arr) {
                            return coll.concat(arr);
                        }, [])
                            .sort(function(a, b) {
                                return b.price - a.price;
                            });
                    });
            };
        });
}());