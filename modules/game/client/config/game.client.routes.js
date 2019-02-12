'use strict';

// Setting up route
angular.module('game').config(['$stateProvider',
    function ($stateProvider) {
        // Users state routing
        $stateProvider
            .state('game', {
                abstract: true,
                url: '/game',
                template: '<ui-view/>'
            })
            .state('game.puzzle', {
                url: '/puzzle',
                templateUrl: 'modules/game/client/views/game-puzzle.client.view.html',
                data: {
                    hideHeader: true
                }
            });
    }
]);
