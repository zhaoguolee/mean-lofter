'use strict';

angular.module('posters').controller('MyPosterController', ['$scope', '$state', '$http', 'Authentication', 'FileUploader',
    function ($scope, $state, $http, Authentication, FileUploader) {
        $scope.user = Authentication.user;
        $scope.postersList = [];
        $scope.editingPoster = {};

        $scope.postersRecommend = function () {
            $http.get('/api/poster/recommend').then(function (response) {
                $scope.postersList = response.data.posters;
                $scope.isInited = true;
            }, function (response) {
                // TODO
            });
        };

        $scope.deletePoster = function (poster) {
            $scope.selectedPoster = poster;
            $('#deletePoster').modal('show');
        };

        $scope.doDelete = function () {
            $http.post('/api/poster/delete/' + $scope.selectedPoster.id).then(function (response) {
                for (var i = 0; i < $scope.postersList.length; i++) {
                    if (response.data.id === $scope.postersList[i].id) {
                        $scope.postersList.splice(i, 1);
                        break;
                    }
                }
                $('#deletePoster').modal('hide');
            }, function (response) {
                // TODO
            });
        };

        $scope.editPoster = function (poster) {
            $scope.editingPoster = JSON.parse(JSON.stringify(poster));
            $('#editingPoster').modal('show');
        };

        $scope.doEdit = function (formName, isValid) {
            if (!!formName && !isValid) {
                $scope.$broadcast('show-errors-check-validity', formName);
                return false;
            }

            $http.post('/api/poster/update/' + $scope.editingPoster.id, $scope.editingPoster).then(function (response) {
                for (var i = 0; i < $scope.postersList.length; i++) {
                    if (response.data.id === $scope.postersList[i].id) {
                        $scope.postersList[i].title = response.data.title;
                        $scope.postersList[i].content = response.data.content;
                        break;
                    }
                }
                $('#editingPoster').modal('hide');
            }, function (response) {
                // TODO
            });
        };

        $scope.creatingPoster = {};
        $scope.mediasUploaded = [];

        $scope.uploader = new FileUploader({
            queueLimit: 12
        });

        // FILTERS
        $scope.uploader.filters.push({
            name: 'typeFilter',
            fn: function (item, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                if (options.alias === 'image') {
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
                if (options.alias === 'video') {
                    return '|mp4|'.indexOf(type) !== -1;
                }
                return true;
            }
        });

        // CALLBACKS
        $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
            $scope.mediasUploaded.push(response.id);
        };
        $scope.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (status === 401) {
                $state.go('authentication.signin');
            }
        };
        $scope.uploader.onCompleteAll = function () {
            createMediaPoster();
        };

        $scope.setPosterType = function (type) {
            if (type === $scope.creatingPoster.type) {
                return;
            }
            clear();
            $scope.creatingPoster.type = type;
        };

        $scope.submit = function (formName, isValid) {
            $scope.createError = null;

            if (!!formName && !isValid) {
                $scope.$broadcast('show-errors-check-validity', formName);
                return false;
            }

            if ($scope.creatingPoster.type === 0) {
                createTextPoster();
            } else {
                $scope.uploader.uploadAll();
            }
        };

        $scope.cancel = function () {
            clear();
        };

        function createTextPoster() {
            $http.post('/api/poster/text', $scope.creatingPoster).success(function (response) {
                $scope.postersList.unshift(response);
                clear();
            }).error(function (response) {
                $scope.createError = response.message;
            });
        }

        function createMediaPoster() {
            $scope.creatingPoster.medias = $scope.mediasUploaded;
            $http.post('/api/poster/media', $scope.creatingPoster).success(function (response) {
                $scope.postersList.unshift(response);
                clear();
            }).error(function (response) {
                $scope.createError = response.message;
            });
        }

        function clear() {
            $scope.uploader.cancelAll();
            $scope.uploader.clearQueue();
            $scope.mediasUploaded = [];
            $scope.creatingPoster = {};

            $scope.$broadcast('show-errors-reset');
        }

    }
]);