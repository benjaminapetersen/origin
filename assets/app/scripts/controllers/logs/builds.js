'use strict';

angular.module('openshiftConsole')
  .controller('projects.logs.builds', [
    '$log',
    '$routeParams',
    '$scope',
    'DataService',
    function($log, $routeParams, $scope, DataService) {

      console.log('$scope is', $scope);
      DataService.watch('builds', $scope, function(builds) {


        console.log('$scope is...', $scope);

        angular.extend($scope, {
          // projectName is provided by mixing in ProjectController in the template
          builds: builds.by('metadata.name'),
          emptyMessage: 'No builds to show'
        });
      });
    }
  ]);
