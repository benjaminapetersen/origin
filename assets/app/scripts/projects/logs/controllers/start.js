'use strict';

angular.module('osc.logs')
  .controller('projects.logs.start', [
    '$log',
    '$routeParams',
    '$scope',
    function($log, $routeParams, $scope) {
      $log.log('project/:project/logs');

      // landing page....
      angular.extend($scope, {
        // projectName: projectName
      });
    }
  ]);
