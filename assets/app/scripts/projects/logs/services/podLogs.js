'use strict';

angular.module('osc.logs')
  .factory('podLogs', [
    '$http',
    'osConfig',
    function($http, osConfig) {
      var config = osConfig.getConfig();
      var protocol = osConfig.getProtocol();
      var httpUri = [
                  protocol,
                  '://',
                  config.api.k8s.hostPort,
                  config.api.k8s.prefix,
                  '/',
                  config.api.k8s.version,
                  '/namespaces/<%= namespace %>',
                  '/pods/<%= pod %>',
                  '/log',
                  '?container=<%= container %>'
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
