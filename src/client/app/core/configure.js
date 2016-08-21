'use strict';

var config = {
    appErrorPrefix: '[My App Error] ', //Configure the exceptionHandler decorator
    appTitle: 'My App',
    version: '0.0.1',
    debugEnabled: true
};

angular
    .module('app.core')
    .value('config', config)
    //.config(configureNgRoute)
    .config(configureUiRouter);

/* @ngInject */
function configureUiRouter ($logProvider, $stateProvider, $urlRouterProvider, $locationProvider, routehelperConfigProvider, exceptionHandlerProvider) {
    console.debug('configure.configureUiRouter()');
    // turn debugging off/on (info or warn will NOT be disabled, only debug)
    $logProvider.debugEnabled(config.debugEnabled);

    // Configure the common route provider
    routehelperConfigProvider.config.$routeProvider = $stateProvider;
    routehelperConfigProvider.config.docTitle = 'My App: ';
    var resolveAlways = { 
        ready: function() {
            //called for any module config.route that does not pass in a resolve
        }
    };
    routehelperConfigProvider.config.resolveAlways = resolveAlways;

    // Configure the common exception handler
    exceptionHandlerProvider.configure(config.appErrorPrefix);


    if (!!(window.history && history.pushState)) { //same check modernizer users
        //console.debug('remember to add html5 mode back');
        $locationProvider.html5Mode(true);
    }
}

//add the nGInject hint if using
function configureNgRoute ($logProvider, $routeProvider, $locationProvider, routehelperConfigProvider, exceptionHandlerProvider) {
    // turn debugging off/on (info or warn will NOT be disabled, only debug)
    $logProvider.debugEnabled(config.debugEnabled);

    // Configure the common route provider
    routehelperConfigProvider.config.$routeProvider = $routeProvider;
    routehelperConfigProvider.config.docTitle = 'My App: ';
    var resolveAlways = { 
        ready: function() {
            //called for any module config.route that does not pass in a resolve
        }
    };
    routehelperConfigProvider.config.resolveAlways = resolveAlways;

    // Configure the common exception handler
    exceptionHandlerProvider.configure(config.appErrorPrefix);


    if (!!(window.history && history.pushState)) {
        //console.debug('remember to add html5 mode back');
        $locationProvider.html5Mode(true);
    }
}
