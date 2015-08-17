'use strict';

angular.module('openshiftConsole')
  .factory('buildLogs', [
    '$http',
    'osConfig',
    function($http, osConfig) {

      var config = osConfig.getConfig();
      var protocol = osConfig.getProtocol();
      var httpUri = [
                  protocol,
                  '://',
                  config.api.openshift.hostPort,
                  config.api.openshift.prefix,
                  '/',
                  config.api.openshift.version,
                  '/namespaces/<%= namespace %>/builds/<%= build %>/log'
                ].join('');
      var httpUriCompiled = _.template(httpUri);

      return {
        get: function(opts) {
          return $http
                  .get(httpUriCompiled(opts))
                  .then(function(response) {
                    return response;
                  });
        }
      }
    }
  ]);
