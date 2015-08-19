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
    'logLinks',
    function($anchorScroll, $location, $q, $routeParams, $scope, $timeout, $window, AuthService, DataService, logLinks) {

      // TODO:
      // - config goes to service to configure the request
      // - $scope goes to view for rendering
      // - what is actually needed in either context?
      var requestContext = {
        projectName: $routeParams.project,
        // in other contexts this is required and is made w/a jQuery deferred.
        // it would be nice if it could be hidden away.
        projectPromise: $.Deferred()
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
                      ready: true,
                      scrollTo: logLinks.scrollTo,
                      goFull: logLinks.fullPageLink,
                      goChromeless: logLinks.chromelessLink,
                      goText: logLinks.textOnlyLink,
                      // optionally as a text string or array.
                      // experimenting w/angular's ability to render...
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
                    $timeout(function() {
                      $anchorScroll();
                    });
                    return log;
                  });
        })
        .catch(function(err) {
          angular.extend($scope, {
            // for the moment just passing the error response up to print
            log: err
          });
        });
    }
  ]);
