'use strict';

var config = {
    appErrorPrefix: '[Empire App Error] ', //Configure the exceptionHandler decorator
    appTitle: 'Empire App',
    version: '0.0.1',
    debugEnabled: true
};

angular
    .module('app.core')
    .value('config', config)
    .config(configure);

/* @ngInject */
function configure ($logProvider, $routeProvider, $locationProvider, routehelperConfigProvider, exceptionHandlerProvider) {
    // turn debugging off/on (info or warn will NOT be disabled, only debug)
    $logProvider.debugEnabled(config.debugEnabled);

    // Configure the common route provider
    routehelperConfigProvider.config.$routeProvider = $routeProvider;
    routehelperConfigProvider.config.docTitle = 'Empire App: ';
    var resolveAlways = { 
        ready: function() {
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
