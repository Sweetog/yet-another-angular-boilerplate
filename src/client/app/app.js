require('angular'); //node_module
require('./core'); //app.core module
require('./login'); //app.login module
require('./sandbox'); //app.signup module

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
    'app.login',

     /*
     * Just for testing
     */

     'app.sandbox'
])
.run(setDefaultRoute);

/* @ngInject */
function setDefaultRoute($state, logger, config, appstates) {
    var isSignup = window.location.host.indexOf("signup") == 0;

    if (config.startWithRoute) {
        $state.go(config.startWithRoute);
    } else if (isSignup || config.startWithSignupFeature) {
        $state.go(appstates.signup_dealer);
    } 
}