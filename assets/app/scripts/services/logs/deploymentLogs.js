'use strict';

angular.module('openshiftConsole')
  // TODO: perhaps change to 'log'
  .factory('buildLogs', [
    '$http',
    '$log',
    '$q',
    '$routeParams',
    '$resource',
    function($http, $log, $q, $routeParams, $resource) {

      // TODO:
      // - initially, just get working,
      // - but in future, should the resouce know about url params?
      //   or should it depend on controller to pass? no point
      //   making controller the middle if there is no gain here.
      return $resource('/api/v1/namespaces/:namespace/deployments/:deployment/log');
    }
  ]);
