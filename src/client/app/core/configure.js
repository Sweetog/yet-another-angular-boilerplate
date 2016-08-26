'use strict';

var config = {
    appErrorPrefix: '[My App] ', //Configure the exceptionHandler decorator
    appTitle: 'My App',
    docTitle: 'My App: ',
    version: '0.0.1',
    debugEnabled: true,
    serviceUrl: 'http://localhost:59777/',
    /**
    * this will override any other routes and go to the  
    * feature folder for your development
    * some possibilities: 
    * * '' default which will route to '/'
    * * 'sandbox_movie_list' - see component-example
    */
    startWithRoute: 'sandbox_movie_list', 
    /**
    * default: false, specific to debugging routing and kept separate from general debug logging
    * as routing debugging can be console verbose & infrequent
    */
    debugRouting: false
};

angular
    .module('app.core')
    .value('config', config)
    .config(configure);

/* @ngInject */
function configure ($logProvider, $stateProvider, $urlRouterProvider, routehelperConfigProvider, exceptionHandlerProvider, $httpProvider) {
    // turn debugging off/on (info or warn will NOT be disabled, only debug)
    $logProvider.debugEnabled(config.debugEnabled);

    // Configure the common route provider
    routehelperConfigProvider.config.$routeProvider = $stateProvider;
    routehelperConfigProvider.config.$urlRouterProvider = $urlRouterProvider;
    routehelperConfigProvider.config.docTitle = config.docTitle;
    routehelperConfigProvider.config.debugEnabled = config.debugRouting;

    var resolveAlways = { 
        ready: function() {
            //called for any module config.route that does not pass in a resolve
        }
    };

    routehelperConfigProvider.config.resolveAlways = resolveAlways;

    // Configure the common exception handler
    exceptionHandlerProvider.configure(config.appErrorPrefix);

    $httpProvider.interceptors.push('httpInterceptor');

    if (!!(window.history && history.pushState)) { //same check modernizer users
        /**
        * Not sure if we are going to use this or not, definitely will be easier to develop
        * localhost with html5Mode(false) because automatic browser-sync browser refreshes
        * on code changes will go to the current page you are on
        * for production we might want html5Mode set to true, more of a business decision to make
        * http://stackoverflow.com/questions/16677528/location-switching-between-html5-and-hashbang-mode-link-rewriting/16678065#16678065
        * -- Brian Ogden - 8-24-2016
        **/
        //$locationProvider.html5Mode(true);
    }
}