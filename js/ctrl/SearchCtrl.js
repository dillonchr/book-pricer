(function() {
    'use strict';

    angular.module('ebay-searcher')
        .controller('SearchCtrl', function($scope, Search, $window) {
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
             * allow audiobooks/cd results
             * @type {boolean}
             */
            $scope.audiobooks = false;
            /**
             * include results from active etsy listings
             * @type {boolean}
             */
            $scope.forSale = false;
            /**
             * include results pertaining to leatherbound copies
             * @type {boolean}
             */
            $scope.leather = false;

            /**
             * fires off api call and does necessary math for price info
             * @param q
             * @returns {*}
             */
            function loadSoldListings(q) {
                return Search.search(q, $scope.forSale)
                    .then(function(listings) {
                        /**
                         * go to top of page to view all results
                         */
                        $window.scrollTo(0,0);
                        /**
                         * apply search filters to results
                         * @type {Array.<T>|*}
                         */
                        $scope.soldListings = listings;
                        /**
                         * get average price from filtered results
                         * @type {number}
                         */
                        $scope.averageSalePrice = $scope.soldListings
                                .reduce(function(sum, listing) {
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
                        $scope.commonSalePrice = mostCommonPrice;
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
                $window.open(listing.url, '_blank');
            };

            /**
             * clears search and prepares for new one
             */
            $scope.clearSearch = function() {
                $scope.q = $scope.soldListings = null;
            };
        });
}());
