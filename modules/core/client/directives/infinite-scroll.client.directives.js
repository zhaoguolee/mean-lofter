'use strict';

angular.module('core').directive('infiniteScroll', [
    '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, elem, attrs) {
                var handler, scrollDistance;
                $window = angular.element($window);
                scrollDistance = 0;
                if (attrs.infiniteScrollDistance) {
                    scrollDistance = parseFloat(attrs.infiniteScrollDistance);
                }

                handler = function() {
                    var containerBottom, elementBottom, remaining, shouldScroll;

                    containerBottom = $(window).height() + $(window).scrollTop();
                    elementBottom = elem[0].offsetTop + elem[0].offsetHeight;
                    remaining = elementBottom - containerBottom;
                    shouldScroll = remaining <= scrollDistance && elementBottom > 0;
                    if (shouldScroll) {
                        if (attrs.infiniteScrollFinished && scope.$eval(attrs.infiniteScrollFinished)) {
                            return;
                        }
                        scope.$apply(attrs.infiniteScroll);
                    }
                };
                $(window).on('scroll', handler);
                scope.$on('$destroy', function() {
                    $(window).off('scroll', handler);
                });

                $timeout((function() {
                    handler();
                }), 0);
            }
        };
    }
]);