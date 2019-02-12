'use strict';

angular.module('posters').controller('PostersController', ['$scope', '$stateParams', '$http', '$state', 'Authentication',
    function ($scope, $stateParams, $http, $state, Authentication) {

        $scope.user = Authentication.user;

        $scope.postersList = [];
        $scope.lastCreatedDate = null;
        $scope.finished = false;
        $scope.commentsList = [];
        $scope.commentsInit = false;
        $scope.comment = {};
        $scope.selectedPoster = {};
        $scope.editingPoster = {};

        $scope.postersByUser = function (username) {
            if ($scope.postersByUser.doing) {
                return;
            }
            $scope.postersByUser.doing = true;
            $scope.postersError = null;
            var rows = 20;
            $http.get('/api/poster/list/' + (username || $stateParams.username), {
                params: {
                    lastCreatedDate: $scope.lastCreatedDate,
                    rows: rows
                }
            }).then(function (response) {
                $scope.selectedUser = response.data.selectedUser;
                $scope.postersList = $scope.postersList.concat(response.data.posters);
                $scope.isInited = true;
                var appendLength = response.data.posters.length;
                if (appendLength > 0) {
                    $scope.lastCreatedDate = response.data.posters[appendLength - 1].created;
                }
                if (appendLength < rows) {
                    $scope.finished = true;
                }
                $scope.postersByUser.doing = false;
            }, function (response) {
                // TODO
                if (response.status === 404) {
                    $state.go('not-found');
                    return;
                }
                $scope.postersError = response.data.message;
                $scope.postersByUser.doing = false;
            });
        };

        $scope.posterById = function (posterId) {
            $http.get('/api/poster/view/' + (posterId || $stateParams.posterId)).then(function (response) {
                $scope.selectedUser = response.data.selectedUser;
                $scope.selectedPoster = response.data.selectedPoster;
            }, function (response) {
                // TODO
                if (response.status === 404) {
                    $state.go('not-found');
                }
            });
        };

        $scope.commentsList = function (posterId) {
            $http.get('/api/comment/list/' + (posterId || $stateParams.posterId)).then(function (response) {
                $scope.commentsList = response.data;
                $scope.commentsInit = true;
            }, function (response) {
                // TODO
                if (response.status === 404) {
                    $state.go('not-found');
                }
            });
        };

        $scope.initPoster = function () {
            $scope.posterById();
            $scope.commentsList();
        };

        $scope.publishComment = function (formName, isValid) {
            if (!$scope.user) {
                $state.go('authentication.signin');
                return false;
            }
            if (!!formName && !isValid) {
                $scope.$broadcast('show-errors-check-validity', formName);
                return false;
            }
            $scope.comment.targetId = $scope.selectedPoster.id;
            $http.post('/api/comment/save', $scope.comment).then(function (response) {
                var comment = response.data;
                comment.username = $scope.user.username;
                comment.displayName = $scope.user.displayName;
                $scope.commentsList.unshift(comment);
                $scope.comment = {};
                $scope.$broadcast('show-errors-reset');
            }, function (response) {
                // TODO
            });
        };

        $scope.editPoster = function () {
            $scope.editingPoster = JSON.parse(JSON.stringify($scope.selectedPoster));
            $('#editingPoster').modal('show');
        };

        $scope.doEdit = function (formName, isValid) {
            if (!!formName && !isValid) {
                $scope.$broadcast('show-errors-check-validity', formName);
                return false;
            }

            $http.post('/api/poster/update/' + $scope.editingPoster.id, $scope.editingPoster).then(function (response) {
                $scope.selectedPoster.title = response.data.title;
                $scope.selectedPoster.content = response.data.content;
                $('#editingPoster').modal('hide');
            }, function (response) {
                // TODO
            });
        };

        $scope.deletePoster = function () {
            $('#deletePoster').modal('show');
        };

        $scope.doDelete = function () {
            $http.post('/api/poster/delete/' + $scope.selectedPoster.id).then(function (response) {
                if (response.data.id === $scope.selectedPoster.id) {
                    $('#deletePoster').modal('hide');
                    $state.go('poster.me');
                }
            }, function (response) {
                // TODO
            });
        };

    }]);