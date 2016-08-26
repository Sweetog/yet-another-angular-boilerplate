'use strict';

angular
    .module('blocks.router')
    .provider('routehelperConfig', routehelperConfig)
    .factory('routehelper', routehelper);

//routehelper.$inject = ['$location', '$rootScope', '$route', 'logger', 'routehelperConfig'];

// Must configure via the routehelperConfigProvider
function routehelperConfig() {
    /* jshint validthis:true */
    this.config = {
        // These are the properties we need to set
        // $routeProvider: undefined
        // docTitle: ''
        // resolveAlways: {ready: function(){ } }
        // $urlRouterProvider
        // $state
        //debugEnabled
    };

    this.$get = function() {
        return {
            config: this.config
        };
    };
}

function routehelper($location, $rootScope, logger, routehelperConfig) {
    var handlingRouteChangeError = false;
    var routeCounts = {
        errors: 0,
        changes: 0
    };
    var routes = [];
    var $routeProvider = routehelperConfig.config.$routeProvider;
    var $urlRouterProvider = routehelperConfig.config.$urlRouterProvider;
    var debugEnabled = routehelperConfig.config.debugEnabled;

    var service = {
        configureRoutes: configureRoutes, //for ngRoute use configureRoutesNgRoute
        getRoutes: getRoutes,
        routeCounts: routeCounts
    };

    init();

    return service;
    ///////////////

    function configureRoutes(routes) {
        routes.forEach(function(route) {
            route.config.resolve =
                angular.extend(route.config.resolve || {}, routehelperConfig.config.resolveAlways);
            $routeProvider.state(route.state, route.config);

            if(debugEnabled)
                 logger.debug('route added', route.state);
        });

        $urlRouterProvider.otherwise("/"); //not sure we even need this - Brian Ogden 8-21-2016
    }

    function handleRoutingErrors() {
        // Route cancellation:
        // On routing error, go to root.
        // Provide an exit clause if it tries to do it twice.
        $rootScope.$on('$stateChangeError',
            function(event, toState, toParams, fromState, fromParams, error) {
                if (handlingRouteChangeError) {
                    return;
                }
                routeCounts.errors++;
                handlingRouteChangeError = true;
                var destination = (toState && (toState.title || toState.state)) ||
                    'unknown target';
                var msg = 'Error routing to ' + destination + '. ' + (error.msg || '');
                logger.error(msg, [toState]);
                $location.path('/');
            }
        );
    }
    
    function init() {
        handleRoutingErrors();
        updateDocTitle();
    }

    function getRoutes() {
        for (var prop in $route.routes) {
            if ($route.routes.hasOwnProperty(prop)) {
                var route = $route.routes[prop];
                var isRoute = !!route.title;
                if (isRoute) {
                    routes.push(route);
                }
            }
        }
        return routes;
    }

    function updateDocTitle() {
        $rootScope.$on('$stateChangeSuccess',
            function(event, toState, toParams, fromState, fromParams) {
                routeCounts.changes++;
                handlingRouteChangeError = false;
                var title = routehelperConfig.config.docTitle + ' ' + (toState.title || '');
                $rootScope.title = title; // data bind to <title>

                if(debugEnabled)
                    logger.debug('route/state changed fromState: ' + fromState.name + ', toState: ' + toState.name, toState);
            }
        );
    }
}