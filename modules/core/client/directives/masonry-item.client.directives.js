'use strict';

angular.module('core')
    .directive('masonry', function($parse) {
        return {
            restrict: 'C',
            link: function (scope, element, attributes) {

                var params = scope.$eval(attributes.masonryData);
                params.itemSelector = '.masonry-item';

                $('.masonry').masonry(params);
            }
        };
    })
    .directive('masonryItem', ['$timeout', function($timeout) {
        return {
            restrict: 'C',
            link: function(scope, element, attributes) {

                if (scope.$last === true) {
                    $timeout(function () {
                        $('.masonry').masonry('reloadItems').masonry();
                    });
                }
            }
        };
    }]);