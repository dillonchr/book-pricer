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
                '<div class="listing" ng-repeat="listing in listings">' +
                    '<img ng-src="{{ ::listing.imageUrl }}" class="thumb">' +
                    '<div class="details"> ' +
                        '<p class="price">{{ ::listing.price | currency:"$":0 }}</p>' +
                        '<p>{{ ::listing.name }}</p>' +
                    '</div>' +
                    '<div class="remove-button" ng-click="removeListing(listing)">&times;</div>' +
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