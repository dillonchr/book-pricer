(function() {
    'use strict';

    angular.module('ebay-searcher')
        .service('Search', function($http, $q) {
            var EBAY_API_KEY = 'DillonCh-4ce2-442c-b779-8d0905e2d5e4';
            var REGEX = {
                AUDIOBOOK: /audiobook|[^\w]cd[^\w]|cds/i,
                LEATHER: /[^\w]leather|deluxe/i,
                LOT: /[^\w]set[^\w]|lot of/i,
                SIGNED: /signed|inscribed|autograph/i
            };

            function transformEbayResponse(response) {
                var forSale = !!response.config.url.match(/findItemsAdvanced/);
                return response.data[Object.keys(response.data)[0]][0].searchResult[0].item
                    .filter(function(listing) {
                        return !!listing.galleryURL &&
                            listing.galleryURL.length > 0;
                    })
                    .map(function(listing) {
                        return {
                            price: parseFloat(listing.sellingStatus[0].convertedCurrentPrice[0].__value__),
                            imageUrl: (listing.galleryURL || [])[0],
                            name: listing.title[0],
                            sortDate: new Date(listing.listingInfo[0].endTime[0]).getTime(),
                            date: moment(listing.listingInfo[0].endTime[0]).fromNow(),
                            url: listing.viewItemURL[0],
                            signed: !!listing.title[0].match(REGEX.SIGNED),
                            lot: !!listing.title[0].match(REGEX.LOT),
                            audiobook: !!listing.title[0].match(REGEX.AUDIOBOOK),
                            leather: !!listing.title[0].match(REGEX.LEATHER),
                            forSale: forSale
                        };
                    });
            }

            function soldEbaySearch(q) {
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
                    .then(transformEbayResponse);
            }

            function liveEbaySearch(q) {
                return $http.jsonp("http://svcs.ebay.com/services/search/FindingService/v1" +
                    "?OPERATION-NAME=findItemsAdvanced" +
                    "&SERVICE-VERSION=1.0.0" +
                    "&SECURITY-APPNAME=" + EBAY_API_KEY +
                    "&GLOBAL-ID=EBAY-US" +
                    "&RESPONSE-DATA-FORMAT=JSON" +
                    "&callback=JSON_CALLBACK" +
                    "&REST-PAYLOAD" +
                    "&itemFilter(0).name=HideDuplicateItems" +
                    "&itemFilter(0).value=true" +
                    "&paginationInput.entriesPerPage=100" +
                    "&categoryId=267" +
                    "&keywords=" + q)
                    .then(transformEbayResponse);
            }

            function isbnSearch(isbn) {
                return $http.jsonp('https://openlibrary.org/api/books?jscmd=data&callback=JSON_CALLBACK&bibkeys=ISBN:' + isbn)
                    .then(function(response) {
                        for(var key in response.data) {
                            var data = response.data[key];
                            if(data.hasOwnProperty('title')) {
                                return data.title + ' ' + data.authors[0].name;
                            }
                        }
                    });
            }

            function searchForListings(q, liveListings) {
                var query = encodeURIComponent(q);
                var requests = [
                    soldEbaySearch(query)
                ];
                if(liveListings) {
                    requests.push(liveEbaySearch(query));
                }
                return $q.all(requests)
                    .then(function(results) {
                        var groupedListings = results
                            .reduce(function(coll, arr) {
                                return coll.concat(arr);
                            }, [])
                            .reduce(function(prices, listing) {
                                var price = Math.round(listing.price / 10) * 10 || 1;
                                var key = '$' + price;
                                if(!prices.hasOwnProperty(key)) {
                                    prices[key] = [];
                                }
                                prices[key].push(listing);
                                return prices;
                            }, {});
                        return Object.keys(groupedListings)
                                .map(function(key) {
                                    return [key, groupedListings[key]];
                                })
                                .sort(function(a, b) {
                                    if(a[1].length === b[1].length) {
                                        return b[0].substr(1) - a[0].substr(1);
                                    }
                                    return b[1].length - a[1].length;
                                });
                    });
            }

            this.search = function(q, includeLiveListings) {
                if(angular.isNumber(q)) {
                    return isbnSearch(q)
                        .then(function(query) {
                            return searchForListings(query, includeLiveListings);
                        });
                }
                if(!!q) {
                    return searchForListings(q, includeLiveListings);
                }
                return $q.reject();
            };
        });
}());
