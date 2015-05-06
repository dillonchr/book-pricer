(function() {
    'use strict';

    angular.module('ebay-searcher')
        .directive('dropdownCheckbox', function() {
            return {
                template: '<a ng-click="model = !model; $event.stopPropagation();">' +
                    '<span class="glyphicon" ng-class="{\'glyphicon-ok\': model, \'glyphicon-remove\': !model}"></span>' +
                    ' {{ ::label }}' +
                '</a>',
                scope: {
                    label: '@',
                    model: '=dropdownCheckbox'
                }
            }
        });
}());