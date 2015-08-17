angular.module('osc.logs', [

])
.config([
  '$routeProvider',
  'HawtioNavBuilderProvider',
  function($routeProvider, builder) {

    // preferentially we would register the 'log' tab here as well
    // and keep all the log specific config in one place.

    $routeProvider
      .when('/project/:project/logs', {
        //templateUrl: 'scripts/projects/logs/views/start.html'
        redirectTo: function(params) {
          return [
                  '/project/',
                  encodeURIComponent(params.project),
                  '/logs',
                  '/builds'
                ].join('');
        }
      })
      .when('/project/:project/logs/builds', {
        templateUrl: 'scripts/projects/logs/views/builds.html'
      })
      .when('/project/:project/logs/builds/:build/log', {
        templateUrl: function(params) {
          return (params.view === 'chromeless') ?
                    'scripts/projects/logs/views/chromeless_log.html' :
                    'scripts/projects/logs/views/build_log.html';
        },
        controller: 'projects.logs.builds.log'
      })
      .when('/project/:project/logs/pods', {
        templateUrl: 'scripts/projects/logs/views/pods.html'
      })
      .when('/project/:project/logs/pods/:pod/log', {
        templateUrl: function(params) {
          return (params.view === 'chromeless') ?
                    'scripts/projects/logs/views/chromeless_log.html' :
                    'scripts/projects/logs/views/pod_log.html';
        },
        controller: 'projects.logs.pods.log'
      });
  }
]);

