'use strict';

angular.module('openshiftConsole')
  // NOTE: could require any services here & use them
  // in the callback functions on the link.
  .factory('fooExtensionFactory', function() {
    var clickCount = 1;
    return [
      {
        type: 'text',
        output: '2nd extension, factory + run',
        className: 'extension extension-pod'
      },
      {
        type: 'link',
        link: 'http://openshift.com',
        className: 'extension extension-pod',
        displayName: '2nd extension, factory + run -2',
        fn: function() {
          console.log('you have clicked this ' + (clickCount++) + ' times');
        }
      }
    ];
  })
  .run(function($timeout, fooExtensionFactory, extensionInput) {

    // simulate time passing, as if API call
    $timeout(function() {
      extensionInput.register('pod:template', fooExtensionFactory);
    }, 2400);

  });


