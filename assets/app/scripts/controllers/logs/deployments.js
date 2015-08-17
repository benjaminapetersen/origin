'use strict';

angular.module('openshiftConsole')
  .controller('projects.logs.deployments', [
    '$log',
    '$routeParams',
    '$scope',
    function($log, $routeParams, $scope) {
      $log.log('project/:project/logs/deployments');
      var projectName = $routeParams.project;

      // do stuff...

      angular.extend($scope, {
        projectName: projectName
      });
    }
  ]);
