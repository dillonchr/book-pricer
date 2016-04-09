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
                '<div class="listing" ng-repeat="listing in listings" ng-class="{\'show-title\': listing.showTitle}" ng-click="listing.showTitle = !listing.showTitle;">' +
                    '<div class="always-showing">' +
                        '<img ng-src="{{ ::listing.imageUrl }}" class="thumb">' +
                        '<p class="price">{{ ::listing.price | currency:"$":0 }}</p>' +
                    '</div>' +
                    '<p class="title">{{ ::listing.name }}</p>' +
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
