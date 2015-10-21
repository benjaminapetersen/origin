'use strict';

// oscKeyValueEntry is the primary control,
// delegating to the directives below to break
// up responsibility
angular.module('openshiftConsole')
  .directive('oscKeyValueEntry', [
    function() {
      return {
        restrict: 'AE',
        scope: {
          keyTitle: '@',
          valueTitle: '@',
          delimiter: '@',
          editable: '@',
          keyValidator: '@',
          valueValidator: '@',
          deletePolicy: '@',
          readonlyKeys: '@',
          keyValidationTooltip: '@',
          valueValidationTooltip: '@',
          entries: '='
        },
        controller: [
          '$scope',
          function($scope) {
            $scope.$on('$destroy', function() {

            });
          }
        ],
        compile: function(element, attrs) {
          attrs.delimiter = attrs.delimiter || ':';
          attrs.keyTitle = attrs.keyTitle || 'Name';
          attrs.valueTitle = attrs.valueTitle || 'Value';
          attrs.editable = (attrs.editable === 'false') ? false : true;

          attrs.keyValidator = attrs.keyValidator || 'always';
          attrs.valueValidator = attrs.valueValidator || 'always';
          attrs.deletePolicy = _.includes(['always', 'added', 'none'], attrs.deletePolicy) ?
                                  attrs.deletePolicy :
                                  'always';
          attrs.readonlyKeys = attrs.readonlyKeys || '';
        },
        templateUrl: 'views/directives/osc/osc-key-value-entry.html'
      };
    }
  ])
  // an internal input control
  .directive('oscKeyValueForm', [
    function() {
      return {
        templateUrl: 'views/directives/osc/osc-key-value-form.html'
      }
    }
  ])
  // TODO: decide what to do about oscInputValidator.
  // an internal list control
  .directive('oscKeyValueList', [
    function() {
      return {
        templateUrl: 'views/directives/osc/osc-key-value-list.html'
      };
    }
  ]);
