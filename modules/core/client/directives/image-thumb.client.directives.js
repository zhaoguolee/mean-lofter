'use strict';

angular.module('core')
    .directive('imageThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.imageThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var img = element[0];

                var windowUrl = window.URL || window.webkitURL;
                if (windowUrl && windowUrl.createObjectURL) {
                    img.src = windowUrl.createObjectURL(params.file);
                    //windowUrl.revokeObjectURL(img.url);
                    return;
                }

                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    img.src = event.target.result;
                }
            }
        };
    }]);