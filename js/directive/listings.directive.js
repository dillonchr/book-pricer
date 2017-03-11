module.exports = function ListingsDirective() {
    return {
        restrict: 'E',
        scope: {
            listings: '=',
            remove: '&'
        },
        template: '<section class="listings">' +
        '<div class="listing" ng-repeat="listing in listings" ng-class="{\'show-title\': listing.showTitle}" ng-click="listing.showTitle = !listing.showTitle;" style="background-image: url({{ ::listing.imageUrl }})">' +
        '<div class="always-showing">' +
        '<p class="price">{{ ::listing.price | currency:"$":0 }}</p>' +
        '</div>' +
        '<p class="title"><a href="{{ ::listing.url }}" target="_blank">{{ ::listing.name }}</a></p>' +
        '</div>' +
        '</section>',
        link: function (scope) {
            scope.removeListing = function (listing) {
                scope.remove()(listing.url);
            }
        }
    };
};