'use strict';

angular.module('openshiftConsole')
  .controller('projects.logs.builds.log', [
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

      $q.all([
        builds.get({
          namespace: $routeParams.project,
          build: $routeParams.build
        }).$promise,
        buildLogs.get({
          namespace: $routeParams.project,
          build: $routeParams.build
        })
      ])
      .then(
        _.spread(function(build, buildLog) {
          angular.extend($scope, {
            ready: true,
            logName: build.metadata.name,
            logSearch: {
              text: ''
            },
            build: build,
            // plain text with line #s added
            log: buildLog.data ?
                  _.reduce(
                    buildLog.data.split('\n'),
                    function(memo, next, i, list) {
                      return (i < list.length) ?
                                memo + _.padRight(i+1+'. ', 7) + next + '\n' :
                                memo;
                    },'') :
                  buildLog.statusText,
            // OR an array of lines... this makes Angular cry.
            logList: buildLog.data ?
                        _.map(
                          buildLog.data.split('\n'),
                          function(text) {
                            return {
                              text: text
                            }
                          }) :
                        [{text: buildLog.statusText}],
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

          // messing with #log_<id> links to specific lines
          _.delay(function() {
            if($location.hash()) $anchorScroll();
          });

        }),
        function() {
          angular.extend($scope, {
            // for the moment just passing the error response up to print
            log: arguments[0]
          })
        })
        // TODO: error out well
        .catch(function(err) {
          console.log('error', err, arguments);
        });
    }
  ]);
