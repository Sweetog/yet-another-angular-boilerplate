'use strict';

angular
    .module('app.login')
    .run(appRun);

/* @ngInject */
function appRun(routehelper) {
    routehelper.configureRoutes(getRoutes());
}

function getRoutes() {
    return [
        {
            url: '/login',
            state: 'login',
            config: {
                templateUrl: 'app/login/login.html',
                controller: 'Login',
                controllerAs: 'vm',
                title: 'Login'
            }
        }
    ];
}