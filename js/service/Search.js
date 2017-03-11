module.exports = function Search($http, $q, $sce) {
    var EBAY_API_KEY = 'DillonCh-4ce2-442c-b779-8d0905e2d5e4',
        REGEX = {
            AUDIOBOOK: /audiobook|[^\w]cd[^\w]|cds/i,
            LEATHER: /[^\w]leather|deluxe/i,
            LOT: /[^\w]set[^\w]|lot of|[^\w]lot[^\w]/i,
            SIGNED: /signed|inscribed|autograph/i
        };

    return {
        search: search
    };

    function search(q, includeLiveListings) {
        if (angular.isNumber(q)) {
            return isbnSearch(q)
                .then(function (query) {
                    return searchForListings(query, includeLiveListings);
                });
        }

        if (!!q) {
            return searchForListings(q, includeLiveListings);
        }

        throw new Error('no search query');
    }

    function transformEbayResponse(response) {
        var forSale = !!response.config.url.match(/findItemsAdvanced/);
        return response.data[Object.keys(response.data)[0]][0].searchResult[0].item
            .filter(function (listing) {
                return !!listing.galleryURL &&
                    listing.galleryURL.length > 0;
            })
            .map(function (listing) {
                return {
                    price: parseFloat(listing.sellingStatus[0].convertedCurrentPrice[0].__value__),
                    imageUrl: (listing.galleryURL || [])[0],
                    name: listing.title[0],
                    sortDate: new Date(listing.listingInfo[0].endTime[0]).getTime(),
                    date: listing.listingInfo[0].endTime[0],
                    url: listing.viewItemURL[0],
                    signed: !!listing.title[0].match(REGEX.SIGNED),
                    lot: !!listing.title[0].match(REGEX.LOT),
                    audiobook: !!listing.title[0].match(REGEX.AUDIOBOOK),
                    leather: !!listing.title[0].match(REGEX.LEATHER),
                    forSale: forSale,
                    showTitle: false
                };
            })
            .sort(function (a, b) {
                return b.price - a.price;
            });
    }

    function getEbayApiUrl(options) {
        if (!options.filters) {
            options.filters = [];
        }
        options.filters.push({
            name: 'HideDuplicateItems',
            value: 'true'
        });
        var filters = options.filters.reduce(function (str, filter, i) {
            var varName = '&itemFilter(' + i + ')';
            return str + varName + '.name=' + filter.name + varName + '.value=' + filter.value;
        }, '');
        return "http://svcs.ebay.com/services/search/FindingService/v1" +
            "?OPERATION-NAME=" + options.controller +
            "&SERVICE-VERSION=1.0.0" +
            "&SECURITY-APPNAME=" + EBAY_API_KEY +
            "&GLOBAL-ID=EBAY-US" +
            "&RESPONSE-DATA-FORMAT=JSON" +
            "&callback=JSON_CALLBACK" +
            "&REST-PAYLOAD" +
            filters +
            "&paginationInput.entriesPerPage=100" +
            "&sortOrder=PricePlusShippingHighest" +
            "&categoryId=267" +
            "&keywords=" + encodeURIComponent(options.q);
    }

    function soldEbaySearch(q) {

        return $http.jsonp(getEbayApiUrl({
            controller: 'findCompletedItems',
            q: q,
            filters: [
                {
                    name: 'SoldItemsOnly',
                    value: 'true'
                }
            ]
        }))
            .then(transformEbayResponse);
    }

    function liveEbaySearch(q) {
        return $http.jsonp(getEbayApiUrl({
            q: q,
            controller: 'findItemsAdvanced'
        }))
            .then(transformEbayResponse);
    }

    function isbnSearch(isbn) {
        return $http.jsonp('https://openlibrary.org/api/books?jscmd=data&callback=JSON_CALLBACK&bibkeys=ISBN:' + isbn)
            .then(function (response) {
                for (var key in response.data) {
                    var data = response.data[key];
                    if (data.hasOwnProperty('title')) {
                        return data.title + ' ' + data.authors[0].name;
                    }
                }
            });
    }

    function searchForListings(q) {
        return $q.all([
            soldEbaySearch(q),
            liveEbaySearch(q)
        ])
            .then(function (response) {
                return {
                    sold: response[0],
                    active: response[1]
                };
            });
    }

};