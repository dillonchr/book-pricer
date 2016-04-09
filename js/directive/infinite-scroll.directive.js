(function() {
  'use strict';

  angular.module('ebay-searcher')
  .directive('infiniteScroll', function($window) {
          return {
              template: '<div style="float:left;">&nbsp;</div>',
              replace: true,
              scope: {
                  action: '&'
              },
              link: function(scope, elem) {
                  $($window)
                    .scroll(function() {
                        if($(this).scrollTop() + $(this).height() >= elem.offset().top) {
                            scope.$evalAsync(function() {
                              scope.action();
                            });
                        }
                    });
              }
          };
      });
}());
