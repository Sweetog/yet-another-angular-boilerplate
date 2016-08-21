
'use strict';

require('angularjs-toaster'); //node_module
require('.././blocks');

angular.module('app.core', [
    /*
     * Angular modules
     */
    'ngAnimate', //'ngRoute', 'ngSanitize',

    /*
     * Our reusable cross app code modules
     */
    'blocks.exception', 'blocks.logger', 'blocks.router',

    /*
     * 3rd Party modules
     */
     'toaster' //https://github.com/jirikavi/AngularJS-Toaster
    /*'ui.bootstrap', // ui-bootstrap (ex: carousel, pagination, dialog)
    'ui.router', //https://github.com/angular-ui/ui-router
    'angular-jwt', //https://jwt.io/
    'angular-storage', //https://github.com/auth0/angular-storage*/
    //'breeze.angular',   // tells breeze to use $q instead of Q.js
    //'breeze.directives',// breeze validation directive (zValidate)
    //'ngplus',           // ngplus utilities
    //'ngzWip'            // zStorage and zStorageWip
]);