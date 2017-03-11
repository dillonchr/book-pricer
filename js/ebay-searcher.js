(function() {
    'use strict';

    window.jQuery = window.$ = require('jquery');
    require('angular');
    require('bootstrap');
    require('angular-touch');
    require('moment');

    angular
        .module('ebay-searcher', ['ngTouch'])
        .controller('SearchCtrl', require('./ctrl/SearchCtrl'))
        .directive('dropdownCheckbox', require('./directive/DropdownCheckbox'))
        .directive('focusField', require('./directive/focus-field.directive.js'))
        .directive('infiniteScroll', require('./directive/infinite-scroll.directive.js'))
        .directive('listings', require('./directive/listings.directive.js'))
        .service('Search', require('./service/Search.js'));
}());
