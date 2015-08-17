'use strict';

angular.module('osc.logs')
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

      $log.log('route params for build log', $routeParams);

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
            // TODO: decide if we want the list @ all, or just
            // go with the flat log...
            log: buildLog.data ?
                    // buildLog.data  <- plain
                    // or add line #s?
                    _.reduce(
                      buildLog.data.split('\n'),
                      function(memo, next, i, list) {
                        // TODO: if this, then need to ensure spacing @ start is uniform
                        return memo + (i+1) + '. ' + next + '\n';
                      },'') :
                    buildLog.statusText,
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
