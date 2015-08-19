'use strict';

angular.module('openshiftConsole')
  .controller('PodLog', [
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

      // TODO:
      // - config goes to service to configure the request
      // - $scope goes to view for rendering
      // - what is actually needed in either context?
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
                  .get('pods', $routeParams.pod, requestContext)
                  .then(function(pod) {
                    angular.extend($scope, {
                      pod: pod,
                      logName: pod.metadata.name
                    });
                    return pod;
                  });
        })
        .then(function() {
          return DataService
                  .get('pods/log', $routeParams.pod, requestContext)
                  .then(function(log) {
                    angular.extend($scope, {
                        // log is the log as a string.  this renders fine.
                        log:  log ?
                              _.reduce(
                                log.split('\n'),
                                function(memo, next, i, list) {
                                  return (i < list.length) ?
                                            memo + _.padRight(i+1+'. ', 7) + next + '\n' :
                                            memo;
                                },'') :
                              'Error retrieving pod log',
                        // log list is an array of log lines. Angular struggles with this.
                        logList:  log ?
                                  _.map(
                                    log.split('\n'),
                                    function(text) {
                                      return {
                                        text: text
                                      }
                                    }) :
                                  [{text: 'Error retrieving pod log'}]
                    });
                    return log;
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
