(function() {
    'use strict';

    angular.module('ebay-searcher')
        .controller('SearchCtrl', function($scope, $http, $window) {
            /**
             * query holder
             * @type {string}
             */
            $scope.q = '';
            /**
             * toggles progress bar
             * @type {boolean}
             */
            $scope.loading = false;
            /**
             * collection of results to display to user
             * @type {Array}
             */
            $scope.soldListings = null;
            /**
             * sale prices average for listings
             * @type {number}
             */
            $scope.averageSalePrice = 0;
            /**
             * most common sale price in increments of ten
             * @type {string}
             */
            $scope.commonSalePrice = null;
            /**
             * allowed signed/autographed/inscribed results
             * @type {boolean}
             */
            $scope.signed = false;
            /**
             * allow lot/set results
             * @type {boolean}
             */
            $scope.lots = false;

            /**
             * fires off api call and does necessary math for price info
             * @param q
             * @returns {*}
             */
            function loadSoldListings(q) {
                return $http.jsonp("http://svcs.ebay.com/services/search/FindingService/v1" +
                    "?OPERATION-NAME=findCompletedItems" +
                    "&SERVICE-VERSION=1.0.0" +
                    "&SECURITY-APPNAME=DillonCh-4ce2-442c-b779-8d0905e2d5e4" +
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
                    "&keywords=" + encodeURIComponent(q))
                    .then(function(response) {
                        /**
                         * go to top of page to view all results
                         */
                        $window.scrollTo(0,0);
                        $scope.soldListings = response.data.findCompletedItemsResponse[0].searchResult[0].item
                            .filter(function(listing) {
                                var signed = /signed|inscribed|autograph/i;
                                var lot = /set|lot/i;
                                return ($scope.signed || !listing.title[0].match(signed))
                                    && ($scope.lots || !listing.title[0].match(lot));
                            })
                            .map(function(listing) {
                                return {
                                    price: parseFloat(listing.sellingStatus[0].convertedCurrentPrice[0].__value__),
                                    imageUrl: (listing.galleryURL || [])[0],
                                    name: listing.title[0],
                                    date: moment(listing.listingInfo[0].endTime[0]).fromNow(),
                                    url: listing.viewItemURL[0]
                                };
                            })
                            .sort(function(a, b) {
                                return b.price - a.price;
                            });
                        $scope.averageSalePrice = $scope.soldListings.reduce(function(sum, listing) {
                                return sum + listing.price;
                            }, 0) / $scope.soldListings.length;
                        /**
                         * quick and dirty way of finding the lowest common price in increments of 10
                         * @type {{}}
                         */
                        var priceCollection = {};
                        var mostCommonCount = 0;
                        var mostCommonPrice = '';
                        $scope.soldListings.forEach(function(listing) {
                            var price = '$' + (Math.round(listing.price / 10) * 10).toString();
                            if(!priceCollection[price]) {
                                priceCollection[price] = 1;
                            } else {
                                priceCollection[price]++;
                            }
                            if(mostCommonCount < priceCollection[price]) {
                                mostCommonCount = priceCollection[price];
                                mostCommonPrice = price;
                            }
                        });
                        $scope.commonSalePrice = mostCommonPrice || '--';
                    });
            }

            /**
             * hides the loading bar
             */
            function doneLoading() {
                $scope.loading = false;
            }

            /**
             * triggered from dom, prepares page and fires off search
             * @returns {*}
             */
            $scope.showSoldListings = function() {
                /**
                 * blur the input field to allow full screen real estate for results
                 */
                $('[ng-model="q"]').blur();
                /**
                 * clear the results from the previous search
                 * @type {Array}
                 */
                $scope.soldListings = [];
                /***
                 * show progress bar
                 * @type {boolean}
                 */
                $scope.loading = true;
                /**
                 * make the api call to ebay
                 */
                loadSoldListings($scope.q)
                    .then(doneLoading, doneLoading);
            };

            /**
             * opens listing in new tab
             * @param listing
             */
            $scope.viewListing = function(listing) {
                $window.open(listing.url, null, '_blank');
            };

            /**
             * clears search and prepares for new one
             * @param e
             */
            $scope.clearSearch = function(e) {
                $scope.q = null;
                $('[ng-model="q"]').focus();
                e.stopPropagation();
                e.stopImmediatePropagation();
            };
        });
}());