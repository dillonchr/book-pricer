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
            
            function loadSoldListings() {
                var listings = filterListings($scope.soldListings);
                $scope.topSoldListings = getTopListings(listings, 1);
                $scope.averageSoldPrice = getAveragePrice(listings);
                $scope.commonSoldPrice = getMostCommonPrice(listings);
            }
            
            function loadActiveListings() {
                var listings = filterListings($scope.activeListings);
                $scope.topActiveListings = getTopListings(listings, 6);
                $scope.averagePrice = getAveragePrice(listings);
                $scope.commonPrice = getMostCommonPrice(listings);
            }

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
                    var price = '$' + (Math.round(listing.price / 10) * 10).toString();
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
                    .sort(function(a, b) {
                        return b.price - a.price;
                    })
                    .slice(0, count || 1);
            }

            $scope.removeSoldListing = function(listingUrl) {
                removeListings([listingUrl], true);
            };

            $scope.removeActiveListing = function(listingUrl) {
                removeListings([listingUrl]);
            };

            $scope.removeTopActiveListings = function() {
                removeListings($scope.topActiveListings.map(function(l) { return l.url; }));
            };

            function removeListings(listingUrls, sold) {
                var propName = (sold ? 'sold' : 'active') + 'Listings';
                $scope[propName] = $scope[propName]
                    .filter(function(listing) {
                        return listingUrls.indexOf(listing.url) === -1;
                    });
                if(sold) {
                    loadSoldListings();
                } else {
                    loadActiveListings();
                }
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
                console.log(searchPieces, $scope.signed, $scope.leather);
                return Search.search(searchPieces[0])
                    .then(function(listings) {
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
                $scope.q = $scope.soldListings = $scope.activeListings = null;
            };
        });
}());
