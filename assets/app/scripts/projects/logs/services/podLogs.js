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
                  //config.api.k8s.prefix,
                  '/api',
                  '/',
                  //config.api.k8s.version, <!-- v1beta3 doesn't work. v1 does.
                  'v1',
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
