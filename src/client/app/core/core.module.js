
'use strict';

require('angular-animate'); //node_module
require('angular-ui-bootstrap'); //node_module
require('angularjs-toaster'); //node_module
require('.././blocks');

angular.module('app.core', [
    /*
     * Angular modules
     */
    'ngAnimate',

    /*
     * Our reusable cross app code modules
     */
    'blocks.exception', 'blocks.logger', 'blocks.router',

    /*
     * 3rd Party modules
     */
    'toaster', //https://github.com/jirikavi/AngularJS-Toaster
    'ui.bootstrap' // ui-bootstrap (ex: carousel, pagination, dialog)
    /*'angular-jwt', //https://jwt.io/
    'angular-storage', //https://github.com/auth0/angular-storage*/
]);

//add functionality to app.core that are not separate angular modules
require('./support');