'use strict';

angular.module('core')
    .directive('videoThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isVideo: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|mp4|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.videoThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isVideo(params.file)) return;

                var video = element[0];

                var windowUrl = window.URL || window.webkitURL;
                if (windowUrl && windowUrl.createObjectURL) {
                    video.src = windowUrl.createObjectURL(params.file);
                    //windowUrl.revokeObjectURL(video.url);
                    return;
                }

                var reader = new FileReader();

                reader.onload = function (event) {
                    video.src = event.target.result;
                };
                reader.readAsDataURL(params.file);

            }
        };
    }]);