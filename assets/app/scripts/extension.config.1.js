'use strict';

angular.module('openshiftConsole')
.config([
  'extensionInputProvider',
  function(extensionInputProvider) {

    var clickCount = 1;
    var extPodTemplate = [
      {
        type: 'text',
        // template: '/path/to/template.html',
        output: 'pod:template ext1',
        className: 'extension extension-pod'
      },
      {
        type: 'link',
        link: 'http://openshift.com',
        className: 'extension extension-pod',
        displayName: 'pod:template ext2',
        fn: function() {
          console.log('you have clicked this ' + (clickCount++) + ' times');
        }
      }
    ];

    extensionInputProvider.register('pod:template', extPodTemplate);

}]);
