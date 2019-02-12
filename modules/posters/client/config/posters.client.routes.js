'use strict';

// Setting up route
angular.module('posters').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider
            .state('poster', {
                abstract: true,
                url: '/poster',
                template: '<ui-view/>'
            })
            .state('poster.view', {
                url: '/view/:posterId',
                templateUrl: 'modules/posters/client/views/posters/poster-view.client.view.html',
                data: {
                    hideHeader: true
                }
            })
            .state('poster.me', {
                url: '/me',
                templateUrl: 'modules/posters/client/views/posters/my-poster.client.view.html',
                data: {
                    roles: ['user']
                }
            })
            .state('poster.list', {
                url: '/list/:username',
                templateUrl: 'modules/posters/client/views/posters/poster-list.client.view.html',
                data: {
                    hideHeader: true
                }
            });
    }
]);
