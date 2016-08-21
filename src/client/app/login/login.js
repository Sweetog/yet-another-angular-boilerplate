'use strict';

angular
    .module('app.login')
    .controller('Login', Login);

function Login(logger) {
    logger.debug('app.login.login');

    /*jshint validthis: true */
    var vm = this;
    vm.helloWorld = 'Hello World from Login Module Controller';
}