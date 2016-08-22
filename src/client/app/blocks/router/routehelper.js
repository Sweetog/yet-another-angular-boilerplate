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

    var service = {
        configureRoutes: configureRoutesUiRouter, //for ngRoute use configureRoutesNgRoute
        getRoutes: getRoutes,
        routeCounts: routeCounts
    };

    init();

    return service;
    ///////////////

    function configureRoutesUiRouter(routes) {
        routes.forEach(function(route) {
            route.config.resolve =
                angular.extend(route.config.resolve || {}, routehelperConfig.config.resolveAlways);
            logger.debug("route", route);
            $routeProvider.state(route.state.name, route.config);
        });
        //$routeProvider.otherwise({redirectTo: '/'}); need to inject $urlRouterProvider for ui-router
    }

    function configureRoutesNgRoute(routes) {
        routes.forEach(function(route) {
            route.config.resolve =
                angular.extend(route.config.resolve || {}, routehelperConfig.config.resolveAlways);
            logger.debug("route", route);
            $routeProvider.when(route.url, route.config);
        });
        $routeProvider.otherwise({
            redirectTo: '/'
        });
    }

    function handleRoutingErrors() {
        // Route cancellation:
        // On routing error, go to root.
        // Provide an exit clause if it tries to do it twice.
        $rootScope.$on('$stateChangeError',
            function(event, toState, toParams, fromState, fromParams, error) {
                if (handlingRouteChangeError) {
                    +logger.debug('routerhelper.stateChangeError');
                    return;
                }
                routeCounts.errors++;
                handlingRouteChangeError = true;
                var destination = (toState && (toState.title || toState.state)) ||
                    'unknown target';
                var msg = 'Error routing to ' + destination + '. ' + (error.msg || '');
                logger.warning(msg, [toState]);
                $location.path('/');
            }
        );
    }

    function init() {
        handleRoutingErrors();
        //updateDocTitleNgRoute();
        updateDocTitleUiRoute();
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

    function updateDocTitleUiRoute() {
        $rootScope.$on('$stateChangeSuccess', //ngRoute - $routeChangeSuccess
            function(event, toState, toParams, fromState, fromParams) { //ngRoute - function(event, current, previous)
                routeCounts.changes++;
                handlingRouteChangeError = false;
                var title = routehelperConfig.config.docTitle + ' ' + (toState.title || '');
                $rootScope.title = title; // data bind to <title>
            }
        );
    }

    function updateDocTitleNgRoute() {
        $rootScope.$on('$routeChangeSuccess',
            function(event, current, previous) {
                routeCounts.changes++;
                handlingRouteChangeError = false;
                var title = routehelperConfig.config.docTitle + ' ' + (current.title || '');
                $rootScope.title = title; // data bind to <title>
            }
        );
    }
}