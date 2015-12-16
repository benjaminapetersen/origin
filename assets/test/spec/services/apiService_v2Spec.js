'use strict';

describe('APIService_v2', function() {
    var APIService;
    // TODO: this will eventually be the new API_CFG defined in config.js
    var apiStub = {
      "groupVersions": [
          {
            "group":      "",
            "version":    "v1",
            "hostPort":   "localhost:8443",
            "prefix":     "/oapi",
            "resources":  ["builds","buildconfigs", "deploymentconfigs", "imagestreams", "other", "things"]
          },
          {
            "group":      "",
            "version":    "v1",
            "hostPort":   "localhost:8443",
            "prefix":     "/api",
            "resources":  ["pods", "namespaces", "podtemplates", "replicationcontrollers"]
          },
          {
            "group":      "extensions",
            "version":    "v1beta1",
            "hostPort":   "localhost:8443",
            "prefix":     "/apis",
            "resources":  ["jobs", ""]
          },
          {
            "group" :       "experimental",
            "version" :     "v1beta1",
            "hostPort" :    "localhost:8443",
            "prefix" :      "/apis",
            "resources" :   ["horizontalpodautoscalers"]
          }
      ]
    };
    // APIService.mapApis() should turn above into this, so that you can do
    // urlForResource(group, version, resource, ....) to get the needed data.
    // {
    //     "": {
    //         "v1": {
    //             "builds": {
    //                 "hostPort":"localhost:8443",
    //                 "prefix":"/oapi"
    //                 "version" : "v1",
    //                 "group" : ""
    //             },
    //             "pods": {
    //                 "hostPort":"localhost:8443",
    //                 "prefix":"/api"
    //             }
    //         }
    //     },
    //     "extensions": {
    //         "v1beta1": {
    //             "jobs": {
    //                 "hostPort":"localhost:8443",
    //                 "prefix":"/apis"
    //             }
    //         }
    //     }
    // }
    //
    beforeEach(function() {
      inject(function(_APIService_v2_) {
        APIService = _APIService_v2_;
      });
    });

    describe('#mapApis', function() {
      it('should create a map of top level groups', function() {
        var map = APIService.mapApis(apiStub.groupVersions);
        var groups = _.keys(map);
        expect(groups).toEqual(['', 'extensions', 'experimental']);
      });
      it('should assign versions to groups', function() {
        var map = APIService.mapApis(apiStub.groupVersions);
        var versions = _.uniq(
                        _.reduce(
                          map,
                          function(memo, next) {
                            return memo.concat(_.keys(next));
                          }, []));
        // note: toEqual will fuss if the order is different
        expect(versions).toEqual(['v1', 'v1beta1']);
      });
      it('should assign resources to versions under groups', function() {
        var map = APIService.mapApis(apiStub.groupVersions);
        // var builds = _.pluck(_.pluck(_.pluck(map, ''), 'v1'), 'builds');
        // expect(builds.hostport).toEqual('localhost:8443');
        // expect(builds.prefix).toEqual('/oapi');
        // expect(builds.version).toEqual('v1');
        // expect(builds.group).toEqual('');
      });
    });

    // describe("#findApiFor", function() {
    //   describe("when a preferred api version is available", function() {
    //     it("provides the preferred api version", function() {
    //       // do test
    //     });
    //   });
    //   describe("when a preferred is not available", function() {
    //     it("provides the api for the resource", function() {
    //       // do test
    //     });
    //   });
    // });

    describe('#urlForResource', function() {
      it('should build an appropriate url for given args', function() {
        //var map = APIService.mapApis(apiStub.groupVersions);
        //var first = _.first(map);
      });
    });
});
