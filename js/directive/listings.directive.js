(function() {
    'use strict';

    angular.module('ebay-searcher')
        .directive('listings', ListingsDirective);

    function ListingsDirective() {
        return {
            restrict: 'E',
            scope: {
                listings: '=',
                remove: '&'
            },
            template: '<section class="listings">' +
                '<div class="listing" ng-repeat="listing in listings" ng-click="listing.showTitle = !listing.showTitle;">' +
                    '<img ng-src="{{ ::listing.imageUrl }}" class="thumb">' +
                    '<div class="details"> ' +
                        '<p class="price">{{ ::listing.price | currency:"$":0 }}</p>' +
                        '<p ng-show="listing.showTitle">{{ ::listing.name }}</p>' +
                    '</div>' +
                '</div>' +
            '</section>',
            link: function(scope) {
                scope.removeListing = function(listing) {
                    scope.remove()(listing.url);
                }
            }
        };
    }
}());
