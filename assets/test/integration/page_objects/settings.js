'use strict';
var h = require('../helpers.js');

// OLD:
exports.dropdown = function() {
  return element(by.css('.resource-actions-dropdown'));
};

exports.deleteProjectButton = function() {
  return element(by.css('.button-delete'));
};

exports.deleteModal = function() {
  var modal = element(by.css('.modal-dialog'));
  return {
    confirm: function() {
      return modal.element(by.cssContainingText('.btn', 'Delete'));
    },
    cancel: function() {
      return modal.element(by.cssContainingText('.btn', 'Cancel'));
    }
  };
};

exports.alerts = {
  deletionSuccess: function() {
    return element(by.cssContainingText('.alert-success', 'marked for deletion'));
  }
};



// NEW:
exports.visit = function() {
  return h.goToPage('/project/' + project['name'] + '/settings');
}

exports.openMenu = function() {
  return element(by.css('.resource-actions-dropdown')).click();
};

exports.deleteProject = function() {

};

exports.confirmProjectDelete = function() {

}

exports.expectSuccessfulDelete = function() {

}
