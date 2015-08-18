'use strict';

angular.module('openshiftConsole')
  .controller('BuildLog', [
    '$anchorScroll',
    '$log',
    '$location',
    '$q',
    '$routeParams',
    '$scope',
    '$window',
    'DataService',
    'builds',
    'buildLogs',
    function($anchorScroll, $log, $location, $q, $routeParams, $scope, $window, DataService, builds, buildLogs) {
      $log.log('project/:project/logs/builds/:build/logs');

      $q
        .all([
          DataService
            .get('builds', $routeParams.build, $scope),
          DataService
            .get('builds/log', $routeParams.build, $scope)
        ])
        .then(
          _.spread(function(build, buildLog) {
            angular.extend($scope, {
              ready: true,
              logName: build.metadata.name,
              // log is the log as a string.  this renders fine.
              log: buildLog ?
                  _.reduce(
                    buildLog.split('\n'),
                    function(memo, next, i, list) {
                      return (i < list.length) ?
                                memo + _.padRight(i+1+'. ', 7) + next + '\n' :
                                memo;
                    },'') :
                  'Error retrieving build log',
              // log list is an array of log lines. Angular struggles with this.
              logList: buildLog ?
                          _.map(
                            buildLog.split('\n'),
                            function(text) {
                              return {
                                text: text
                              }
                            }) :
                          [{text: 'Error retrieving build log'}],
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
