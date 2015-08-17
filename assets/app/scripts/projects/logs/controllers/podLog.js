'use strict';

angular.module('osc.logs')
  .controller('projects.logs.pods.log', [
    '$log',
    '$location',
    '$q',
    '$routeParams',
    '$scope',
    '$window',
    'DataService',
    'pods',
    'podLogs',
    function($log, $location, $q, $routeParams, $scope, $window, DataService, pods, podLogs) {
      $log.log('project/:project/logs/pods/:pod/logs');

      $q.all([
        pods.get({
          namespace: $routeParams.project,
          pod: $routeParams.pod
        }).$promise,
        podLogs.get({
          namespace: $routeParams.project,
          pod: $routeParams.pod,
          container: $routeParams.container
        })
      ])
      .then(_.spread(function(pod, podLog) {
        angular.extend($scope, {
          ready: true,
          logName: pod.metadata.name,
          pod: pod,
          log: podLog.data ?
                podLog.data :
                podLog.statusText,
          logList: podLog.data ?
                    _.map(
                      podLog.data.split('\n'),
                      function(text) {
                        return {
                          text: text
                        }
                      }) :
                    [{text: podLog.statusText}],
          goFull: function() {
           $location
            .path($location.path())
            .search(
              angular.extend($location.search(), {
                view: 'chromeless'
            }));
          },
          goChromeless: function() {
            $window
              .open([
                $location.path(),
                '?',
                $.param(
                  angular
                    .extend(
                      $location.search(), {
                        view: 'chromeless'
                      }))
              ].join(''), '_blank');
          }
        })
      }));
    }
  ]);




