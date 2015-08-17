'use strict';

// tinkering.
angular.module('openshiftConsole')
  .factory('pods', [
    '$log',
    '$resource',
    'osConfig',
    function($log, $resource, osConfig) {
      var config = osConfig.getConfig();
      var protocol = osConfig.getProtocol();

      return $resource([
                    protocol,
                    '://',
                    config.api.k8s.hostPort,
                    config.api.k8s.prefix,
                    '/',
                    //config.api.k8s.version, <!-- v1beta3 doesn't work. v1 does.
                    'v1',
                    '/namespaces/:namespace/pods/:pod'//,
                    //'?',
                    //'pretty=true'
                  ].join(''));
    }
  ]);
