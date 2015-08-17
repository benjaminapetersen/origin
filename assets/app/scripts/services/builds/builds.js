'use strict';

angular.module('openshiftConsole')
  .factory('builds', [
    '$log',
    '$resource',
    'osConfig',
    function($log, $resource, osConfig) {
      var config = osConfig.getConfig();
      var protocol = osConfig.getProtocol();

      return $resource([
                    protocol,
                    '://',
                    config.api.openshift.hostPort,
                    config.api.openshift.prefix,
                    '/',
                    config.api.openshift.version,
                    '/namespaces/:namespace/builds/:build'
                  ].join(''));
    }
  ]);
