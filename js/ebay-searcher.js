(function() {
    'use strict';

    require('jquery');
    require('angular');
    require('bootstrap');
    require('angular-touch');
    require('moment');

    // require('directive/DropdownCheckbox.js');
    // require('directive/focus-field.directive.js');
    // require('directive/infinite-scroll.directive.js');
    // require('directive/listings.directive.js');
    // require('service/Search.js');

    angular
        .module('ebay-searcher', ['ngTouch'])
        .controller('SearchCtrl', require('js/ctrl/SearchCtrl'));
}());
