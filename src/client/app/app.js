require('angular'); //node_module
require('angular-animate'); //node_module
require('./core'); //core directory
require('./login'); //login directory


'use strict';

angular.module('app', [
    /*
     * Order is not important. Angular makes a
     * pass to register all of the modules listed
     * and then when app.mymodule tries to use app.core,
     * its components are available.
     */
     
    /*
     * Everybody has access to this section.
     * We could place these modules under every feature area,
     * but this is easier to maintain.
     */
    'app.core',


    /*
     * Feature areas
     */
    'app.login'
]);
