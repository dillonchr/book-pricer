(function() {
    'use strict';

    angular.module('ebay-searcher')
        .controller('SearchCtrl', function($scope, Search, $window, $timeout) {
            var VISIBLE_LISTING_COUNT_INCREMENT = 6;
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
             * collection of results of active listings on ebay
             * @type {null}
             */
            $scope.activeListings = null;
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
             * include results pertaining to leatherbound copies
             * @type {boolean}
             */
            $scope.leather = false;
            /**
             * placeholder for the search box
             * @type {string}
             */
            $scope.placeholder = $window.localStorage.getItem('LAST_SEARCH') || 'What\'s the Bookworth?';

            function getListingCountIncrement() {
                if($($window).width() >= 768) {
                    return VISIBLE_LISTING_COUNT_INCREMENT * 2.5;
                }
                return VISIBLE_LISTING_COUNT_INCREMENT;
            }

            function loadSoldListings(amount) {
                var listings = filterListings($scope.soldListings);
                $scope.highestSoldPrice = listings[0].price;
                $scope.lowestSoldPrice = listings[listings.length - 1].price;
                $scope.topSoldListings = getTopListings(listings, amount || getListingCountIncrement());
                $scope.averageSoldPrice = getAveragePrice(listings);
                $scope.commonSoldPrice = getMostCommonPrice(listings);
            }

            $scope.loadMoreSoldListings = function() {
              if($scope.soldListings.length > $scope.topSoldListings.length) {
                $scope.topSoldListings = getTopListings(filterListings($scope.soldListings), $scope.topSoldListings.length + getListingCountIncrement());
              }
            };

            function loadActiveListings(amount) {
                var listings = filterListings($scope.activeListings);
                $scope.highestActivePrice = listings[0].price;
                $scope.lowestActivePrice = listings[listings.length - 1].price;
                $scope.topActiveListings = getTopListings(listings, amount || getListingCountIncrement());
                $scope.averagePrice = getAveragePrice(listings);
                $scope.commonPrice = getMostCommonPrice(listings);
            }

            $scope.loadMoreActiveListings = function() {
              if($scope.activeListings.length > $scope.topActiveListings.length) {
                $scope.topActiveListings = getTopListings(filterListings($scope.activeListings), $scope.topActiveListings.length + getListingCountIncrement());
              }
            };

            function filterListings(listings) {
                return listings
                    .filter(function(listing) {
                        return (!listing.signed || $scope.signed) &&
                            (!listing.lot || $scope.lots) &&
                            (!listing.audiobook || $scope.audiobooks) &&
                            (!listing.leather || $scope.leather);
                    });
            }

            function getAveragePrice(listings) {
                return listings
                    .reduce(function(sum, listing) {
                        return sum + listing.price;
                    }, 0) / listings.length;
            }

            function getMostCommonPrice(listings) {
                var mostCommonCount = 0,
                    mostCommonPrice = '';
                listings.reduce(function(priceCollection, listing) {
                    var newPrice = Math.round(listing.price / 10) * 10 || 1;
                    var price = '$' + (newPrice).toString();
                    if(!priceCollection[price]) {
                        priceCollection[price] = 0;
                    }
                    priceCollection[price]++;
                    if(mostCommonCount < priceCollection[price]) {
                        mostCommonCount = priceCollection[price];
                        mostCommonPrice = price;
                    }
                    return priceCollection;
                }, {});
                return {price: mostCommonPrice, count: mostCommonCount};
            }

            function getTopListings(listings, count) {
                return listings
                    .slice(0, count || 1);
            }

            /**
             * fires off api call and does necessary math for price info
             * @param q
             * @returns {*}
             */
            function getListings(q) {
                var searchPieces = q.split(',').map(function(s) { return s.trim(); }),
                    option = (searchPieces[1] || '').toLowerCase();
                $scope.signed = option === 'signed';
                $scope.leather = option === 'leather';
                return Search.search(searchPieces[0])
                    .then(function(listings) {
                        ga('send', 'event', 'search', 'loaded', $scope.q, listings.sold + listings.active);
                        /**
                         * go to top of page to view all results
                         */
                        $window.scrollTo(0,0);
                        /**
                         * save listings to scope
                         */
                        $scope.soldListings = listings.sold;
                        $scope.activeListings = listings.active;
                        /**
                         * update ui to show current listings
                         */
                        loadSoldListings();
                        loadActiveListings();
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
            $scope.search = function() {
                if(!$scope.q) {
                    return;
                }
                $window.localStorage.setItem('LAST_SEARCH', $scope.q);
                $scope.placeholder = $scope.q;

                ga('send', 'event', 'search', 'search', $scope.q);
                /**
                 * blur the input field to allow full screen real estate for results
                 */
                $('[ng-model="q"]')
                    .blur();
                /**
                 * clear the results from the previous search
                 * @type {Array}
                 */
                $scope.soldListings = $scope.activeListings = [];
                /***
                 * show progress bar
                 * @type {boolean}
                 */
                $scope.loading = true;
                /**
                 * make the api call to ebay
                 */
                getListings($scope.q)
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
              $timeout(function() {
                $scope.q = $scope.soldListings = $scope.activeListings = null;
                $scope.$broadcast('focus-field');
              });
            };
        });
}());
