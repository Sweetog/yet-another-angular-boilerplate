(function() {
    'use strict';

    angular
        .module('blocks.logger')
        .factory('logger', logger);

    /* @ngInject */
    function logger($log, toaster) {
        var service = {
            showToasts: true,

            error   : error,
            info    : info,
            success : success,
            warning : warning,
            debug   : debug,

            // straight to console; bypass toaster
            log     : $log.log
        };
        
        return service;
        /////////////////////

        function error(message, data, title) {
            if(!data) { data = '' };
            if(service.showToasts) { toaster.pop('error', title, message) };
            $log.error('Error: ' + message, data);
        }

        function info(message, data, title) {
            if(!data) { data = '' };
            if(service.showToasts) { toaster.pop('info', title, message) };
            $log.info('Info: ' + message, data);
        }

        function success(message, data, title) {
            if(!data) { data = '' };
            if(service.showToasts) { toaster.pop('success', title, message) };
            $log.info('Success: ' + message, data);
        }

        function warning(message, data, title) {
            if(!data) { data = '' };
            if(service.showToasts) { toaster.pop('warning', title, message) };
            $log.warn('Warning: ' + message, data);
        }

        function debug(message, data) {
            if(!data) { data = '' };
            $log.debug('Debug: ' + message, data);
        }
    }
}());
