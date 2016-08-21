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
            config: {
                templateUrl: 'app/login/login.html',
                controller: 'Login',
                controllerAs: 'vm',
                title: 'login',
                state: {
                    name: 'app.login',
                    abstract: true,
                }
                /*settings: {
                    nav: 2,
                    content: '<i class="fa fa-lock"></i> Avengers'
                }*/
            }
        }
    ];


   /* .state('app.login', {
         abstract: true,
         url: "/login",
         templateUrl: "components/login/templates/login.html",
         controller: "loginController",
         controllerAs: "vm"
     })*/
}