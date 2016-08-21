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
            url: '/login', //used with ngRoute
            state: { //used with ui-router
                name: 'login',
                abstract: true,
            },
            config: {
                templateUrl: 'app/login/login.html',
                controller: 'Login',
                controllerAs: 'vm',
                title: 'Login'
                /*settings: {
                    nav: 2,
                    content: '<i class="fa fa-lock"></i> Avengers'
                }*/
            }
        }
    ];
}