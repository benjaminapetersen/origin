'use strict';

angular.module('openshiftConsole')
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
          // plain text with line #s added
          log: podLog.data ?
                _.reduce(
                  podLog.data.split('\n'),
                  function(memo, next, i, list) {
                    return (i < list.length) ?
                              memo + _.padRight(i+1+'. ', 7) + next + '\n' :
                              memo;
                  },'') :
                podLog.statusText,
          // OR an array of lines... this makes Angular cry.
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




