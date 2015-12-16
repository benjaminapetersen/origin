'use strict';
/* jshint unused:false */

// see gist: https://gist.github.com/benjaminapetersen/540ac605d3c1b0660062
// for discussion leading up to the creation of this file

angular.module('openshiftConsole')
  .factory('APIService_v2', function(API_CFG) {

    // defaultVersion lookup for backwards compatibility...
    var defaultVersionByGroup = {
      'extensions':   'v1beta1',
      'experimental': 'v1beta1',
      '':             'v1'  // this group applies to openshift & k8s (/oapi) & (/api)
    };

    // private processor
    var mapApis = function(groupVersions) {
      return _.reduce(
              groupVersions,
              function(memo, next) {
                if(!memo[next.group]) {
                  memo[next.group] = {
                    defaultVersion: defaultVersionByGroup[next.group]
                  };
                }
                if(!memo[next.group][next.version]) {
                  memo[next.group][next.version] = {};
                }
                _.each(next.resources, function(resource) {
                  if(!memo[next.group][next.version][resource]) {
                    memo[next.group][next.version][resource] = {
                      hostPort: next.hostPort,
                      prefix: next.prefix,
                      // for convenience, will include these fields in the object
                      // even though they are used for lookup.
                      group: next.group,
                      version: next.version
                    };
                  }
                });
                return memo;
              }, {});
    };

    // temporary, until we get a new OPENSHIFT_CONFIG w/the new groupVersion structure
    var mapLegacyAPis = function(pseudoGroups) {
      return _.reduce(
              pseudoGroups,
              function(memo, next, i) {
                // all old apis belong to the empty group, under v1
                _.each(next.resources, function(resource, key) {
                  memo['']['v1'][key] = {
                    hostPort: next.hostPort,
                    prefix: next.prefixes['v1'],
                    group: '',
                    version: 'v1'
                  };
                });
                return memo;
              }, {'':{'v1':{}}});
    };

    // TODO:
    // - I temporarly have a hack in config.js to provide groupVersions
    //   or not... which will trigger this switch in processing the objects.
    //   The outcome is the same format, allowing for a single lookup.
    //   The primary deviation in the code below is in urlForResource, where
    //   it chooses lookup method based on the first argument, string vs object:
    //   - DataService.get("pods", $routeParams.pod, context);
    //   - DataService.get({resource:"jobs",group:"extensions",version:"v1beta1" }, $routeParams.job, context);
    var apis = window.OPENSHIFT_CONFIG.api.openshift ?
                // use the old config & transform to new map
                mapLegacyAPis(window.OPENSHIFT_CONFIG.api) :
                // use the new config & transform to the new map
                mapApis(window.OPENSHIFT_CONFIG.groupVersions);

    // finds the api via spec, must have a full spec to work
    var apiForResource = function(spec) {
        return apis[spec.group] && apis[spec.group][spec.version] && apis[spec.group][spec.version][spec.resource];
    };

    // TODO: decide how to notify failure
    var warnPartialSpec = function(spec) {
      console.warn( 'Spec is missing ',
                    _.difference(['group', 'version', 'resource'], _.keys(spec)),
                    'api url cannot be constructed');
    };

    var findApiForResource = function(spec) {
      return _.difference(
                _.keys(spec),
                ['group', 'version', 'resource']
              ).length === 0 ?
                apiForResource(spec) :
                // NOTE:
                // - we could support partial specs, but this is really not a good idea
                // - inference of group could give completely different object type
                // - inference of version could give unexpected data structure for the object
                warnPartialSpec(spec);
    };


    var openshiftAPIBaseUrl = function() {
      var protocol = window.location.protocol === "http:" ? "http" : "https";
      var hostPort = API_CFG.openshift.hostPort;
      return new URI({protocol: protocol, hostname: hostPort}).toString();
    };

    var normalizeResource = function(resource) {
       if (!resource) {
        return;
       }

       // only lowercase the first segment, leaving subresources as-is (some are case-sensitive)
       var segments = resource.split("/");
       segments[0] = segments[0].toLowerCase();
       var normalized = segments.join("/");
       if (resource !== normalized) {
         Logger.warn('Non-lower case resource "' + resource + '"');
       }

       return normalized;
    };

    // port of restmapper.go#kindToResource
    var kindToResource = function(kind) {
      if (!kind) {
        return "";
      }
      var resource = String(kind).toLowerCase();
      if (resource.endsWith('status')) {
        resource = resource + 'es';
      } else if (resource.endsWith('s')) {
        // no-op
      } else if (resource.endsWith('y')) {
        resource = resource.substring(0, resource.length-1) + 'ies';
      } else {
        resource = resource + 's';
      }
      // make sure it is a known resource
      if (!apiExistsFor(resource)) {
        Logger.warn('Unknown resource "' + resource + '"');
        return undefined;
      }
      return resource;
    };

    // TODO: this is not efficient. make another map & do a lookup,
    // also use apiVersion (if we need it)
    var apiExistsFor = function(resource, apiVersion) {
      var found = false;
      _.each(apis, function(api) {
        _.each(api, function(version) {
          _.each(version, function(res, key) {
            if(resource === key) {
              found = true;
            }
          });
        });
      });
      return found;
    };

    // deprecated?
    var ensureVersion = function(api, preferredAPIVersion) {
      return preferredAPIVersion || (api && api.defaultVersion);
    };

    // Bother, URITemplate has no ability to do conditional {+group}, so
    // templates have to be more complex
    var API_TEMPLATE = "{protocol}://{+hostPort}{+prefix}/{version}/";
    var API_GROUP_TEMPLATE = "{protocol}://{+hostPort}{+prefix}/{+group}/{version}/";

    var URL_GET_LIST              = "{resource}{?q*}";
    var URL_OBJECT                = "{resource}/{name}{/subresource*}{?q*}";
    var URL_NAMESPACED_GET_LIST   = "namespaces/{namespace}/{resource}{?q*}";
    var URL_NAMESPACED_OBJECT     = "namespaces/{namespace}/{resource}/{name}{/subresource*}{?q*}";

    var findTemplateFor = function(name, namespace, group) {
      var base = group ?
                  API_GROUP_TEMPLATE :
                  API_TEMPLATE;
      var rest = name ?
                  namespace ?
                    URL_NAMESPACED_OBJECT :
                    URL_OBJECT :
                  namespace ?
                    URL_NAMESPACED_GET_LIST :
                    URL_GET_LIST;
      return (base + rest);
    };

    var protocol = function(isWebsocket) {
      return isWebsocket ?
              window.location.protocol === "http:" ?
                "ws" :
                "wss" :
              window.location.protocol === "http:" ?
                "http" :
                "https";
    };

    var cleanCopyParams = function(params) {
      params = (params &&  angular.copy(params)) || {};
      delete params.namespace;
      return params;
    };

    var findNamespace = function(context, params) {
      return (params && params.namespace) ?
              params.namespace :
              (context && context.namespace) ?
                context.namespace :
                (context && context.project) ?
                 context.project.metadata.name :
                 null;
    };


    var templateOptions = function(spec, name, namespace, isWebsocket, params) {
      return _.extend(
              {
                resource: _.first(spec.resource.split('/')),
                subresource: _.rest(spec.resource.split('/')),
                name: name,
                namespace: namespace
              },
              findApiForResource(spec),
              { protocol: protocol(isWebsocket) },
              {q: cleanCopyParams(params)});
    };


    // PATCH old url request format:
    //  DataService.get("pods", $routeParams.pod, context)
    var makeUrl_Legacy = function(resourceWithSubresource, name, apiVersion, context, isWebsocket, params) {
        var namespace = findNamespace(context, params);
        var resource = _.first(resourceWithSubresource.split('/'));
        var subresource = _.rest(resourceWithSubresource.split('/'));

        return URI
                .expand(
                  findTemplateFor(name, namespace, ''),
                  _.extend({}, findApiForResource({
                      resource: resource,
                      // NOTE: legacy does not support other versions or groups.
                      group:"",
                      version:"v1"
                    }), {
                      resource: resource,
                      subresource: subresource,
                      name: name,
                      namespace: namespace,
                      protocol: protocol(isWebsocket),
                      q: cleanCopyParams(params)
                    }));
    };

    // New url request format:
    // DataService
    //  .get({
    //    resource:"jobs",group:"extensions",version:"v1beta1"
    //  }, $routeParams.job, context);
    var makeUrl = function(spec, name, apiVersion, context, isWebsocket, params) {
      return URI
              .expand(
                findTemplateFor(name, findNamespace(context, params), spec.group),
                templateOptions(spec, name, findNamespace(context, params), isWebsocket, params));
    };

    // tests spec, if string (ex: 'pods') will fall back to legacy lookup,
    // else if spec object (ex:  {resource:"jobs",group:"extensions",version:"v1beta1"})
    // will use new
    var urlForResource = function(spec, name, apiVersion, context, isWebsocket, params) {
      return _.isString(spec) ?
              makeUrl_Legacy.apply(this, arguments) :
              makeUrl.apply(this, arguments);
    };


    // NOTE: this is used in 2 places in app,
    // and is really just a proxy for urlForResource w/a
    // different syntax.  may be best to factor it out...
    var url = function(options) {
        if (options && options.resource) {
          var opts = angular.copy(options);
          delete opts.resource;
          delete opts.name;
          delete opts.apiVersion;
          delete opts.isWebsocket;
          var resource = normalizeResource(options.resource);
          var u = urlForResource(resource, options.name, options.apiVersion, null, !!options.isWebsocket, opts);
          if (u) {
            return u.toString();
          }
        }
        return null;
      };


    return {
      // TODO: decide if we should export this & allow a remap...
      mapApis: mapApis,
      normalizeResource: normalizeResource,       // DataService.js
      kindToResource: kindToResource,             // DataService.js, createFromImage.js
      apiExistsFor: apiExistsFor,                 // DataService.js
      openshiftAPIBaseUrl: openshiftAPIBaseUrl,   // nextSteps.js
      urlForResource: urlForResource,             // DataService.js
      url: url                                    // javaLink.js, resources.js
    };

  });


