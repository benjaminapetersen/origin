'use strict';

angular.module('openshiftConsole')
  .controller('PodLog', [
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


      $q
        .all([
          DataService
            .get('pods', $routeParams.pod, $scope),
          DataService
            .get('pods/log', $routeParams.pod, $scope)
        ])
        .then(
          _.spread(function(pod, podLog) {

            angular.extend($scope, {
              ready: true,
              logName: pod.metadata.name,
              // log is the log as a string.  this renders fine.
              log: podLog ?
                  _.reduce(
                    podLog.split('\n'),
                    function(memo, next, i, list) {
                      return (i < list.length) ?
                                memo + _.padRight(i+1+'. ', 7) + next + '\n' :
                                memo;
                    },'') :
                  'Error retrieving pod log',
              // log list is an array of log lines. Angular struggles with this.
              logList: podLog ?
                          _.map(
                            podLog.split('\n'),
                            function(text) {
                              return {
                                text: text
                              }
                            }) :
                          [{text: 'Error retrieving pod log'}],
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
            });

            _.delay(function() {
              if($location.hash()) $anchorScroll();
            });

          },
          function() {
            angular.extend($scope, {
              log: arguments[0]
            });
          }))
          .catch(function(err) {
            angular.extend($scope, {
              // for the moment just passing the error response up to print
              log: err
            });
          });


    }
  ]);




