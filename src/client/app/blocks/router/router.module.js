//require('angular-route'); //node_module ngRoute 
require('angular-ui-router'); //node_module ui-router https://github.com/angular-ui/ui-router

'use strict';

angular.module('blocks.router', [
    //'ngRoute', //uncomment if using Angular ngRoute
    'ui.router',
    'blocks.logger'
]);
