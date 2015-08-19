'use strict';

angular.module('openshiftConsole')
  .controller('BuildLog', [
    '$anchorScroll',
    '$location',
    '$q',
    '$routeParams',
    '$scope',
    '$timeout',
    '$window',
    'AuthService',
    'DataService',
    function($anchorScroll, $location, $q, $routeParams, $scope, $timeout, $window, AuthService, DataService) {

      // what of this needs to go to the service to config the request,
      // and what is actually for $scope, to go to view?
      var requestContext = {
        projectName: $routeParams.project,
        projectPromise: $.Deferred(),
        project: {},
        projects: {},
        alerts: {}
      };

      AuthService
        .withUser()
        .then(function(user) {
          return DataService
                  .get('projects', requestContext.projectName, requestContext, {errorNotification: false})
                  .then(function(project) {
                    requestContext.projectPromise.resolve(project);
                    angular.extend(requestContext, {
                      project: project
                    });
                    return project;
                  }, function(e) {
                    requestContext.projectPromise.reject(e);
                  });
        })
        .then(function() {
          return DataService
                  .get('builds', $routeParams.build, requestContext)
                  .then(function(build) {
                    angular.extend($scope, {
                      build: build,
                      logName: build.metadata.name
                    });
                    return build;
                  });
        })
        .then(function() {
          return DataService
                  .get('builds/log', $routeParams.build, requestContext)
                  .then(function(buildLog) {
                    angular.extend($scope, {
                        // log is the log as a string.  this renders fine.
                        log: buildLog ?
                              _.reduce(
                                buildLog.split('\n'),
                                function(memo, next, i, list) {
                                  return (i < list.length) ?
                                            memo + _.padRight(i+1+'. ', 7) + next + '\n' :
                                            memo;
                                },'') :
                              'Error retrieving pod log',
                        // log list is an array of log lines. Angular struggles with this.
                        logList: buildLog ?
                                  _.map(
                                    buildLog.split('\n'),
                                    function(text) {
                                      return {
                                        text: text
                                      }
                                    }) :
                                  [{text: 'Error retrieving pod log'}]
                    });
                    return buildLog;
                  });
        })
        .then(function() {
          angular.extend($scope, {
            ready: true,
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
        }, function() {
          angular.extend($scope, {
            log: arguments[0]
          })
        })
        .catch(function(err) {
          angular.extend($scope, {
            // for the moment just passing the error response up to print
            log: err
          });
        });
    }
  ]);
