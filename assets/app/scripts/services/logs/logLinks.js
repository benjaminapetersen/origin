'use strict';

angular.module('openshiftConsole')
  .factory('logLinks', [
    '$anchorScroll',
    '$location',
    '$window',
    function($anchorScroll, $location, $window) {

      return {
        scrollTo: function(where) {
          $location.hash(where);
          $anchorScroll();
        },
        fullPageLink: function() {
         $location
          .path($location.path())
          .search(
            angular.extend($location.search(), {
              view: 'chromeless'
          }));
        },
        chromelessLink: function() {
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
        },
        textOnlyLink: function() {
          // TODO:
          // - may be nice for a 'download' view
          //   that is plain text.
          // - similar to chromeless link, but
          //   even more stripped down UI
          $window
            .open([
              $location.path(),
              '?',
              $.param(
                angular
                  .extend(
                    $location.search(), {
                      view: 'textonly'
                    }))
            ].join(''), '_blank');
        }
      }
    }
  ]);
