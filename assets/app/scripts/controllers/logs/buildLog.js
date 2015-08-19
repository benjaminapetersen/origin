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
    'logLinks',
    function($anchorScroll, $location, $q, $routeParams, $scope, $timeout, $window, AuthService, DataService, logLinks) {

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
            goFull: logLinks.fullPageLink,
            goChromeless: logLinks.chromelessLink,
            goText: logLinks.textOnlyLink
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
