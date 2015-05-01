(function() {
    'use strict';

    angular.module('ebay-searcher')
        .controller('SearchCtrl', function($scope, $http, $window) {
            $scope.q = '';

            $scope.showSoldListings = function() {
                $('[ng-model="q"]').blur();
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
                        "&keywords=" + encodeURIComponent($scope.q))
                    .then(function(response) {
                        var listings = response.data.findCompletedItemsResponse[0].searchResult[0].item
                            .filter(function(listing) {
                                var signed = /signed|inscribed|autograph/i;
                                var lot = /set|lot/i;
                                return (!!$scope.q.match(signed) || !listing.title[0].match(signed))
                                    && (!!$scope.q.match(lot) || !listing.title[0].match(lot));
                            });
                        $scope.soldListings = listings.map(function(listing) {
                            return {
                                price: parseFloat(listing.sellingStatus[0].convertedCurrentPrice[0].__value__),
                                imageUrl: (listing.galleryURL || [])[0],
                                name: listing.title[0],
                                date: moment(listing.listingInfo[0].endTime[0]).fromNow(),
                                url: listing.viewItemURL[0]
                            };
                        });
                        $scope.averageSalePrice = $scope.soldListings.reduce(function(sum, listing) {
                            return sum + listing.price;
                        }, 0) / listings.length;
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
            };

            $scope.viewListing = function(listing) {
                $window.open(listing.url, null, '_blank');
            };

            $scope.clearSearch = function() {
                $scope.q = null;
                $('[ng-model="q"]').focus();
            };
        });
}());