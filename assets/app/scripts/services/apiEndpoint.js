'use strict';

angular.module('openshiftConsole')
  .factory('ApiEndpointService', function(API_CFG) {

    // TODO: prob should not modify the config data,
    // instead keep this as local vars?
    // var defaultVersion = { os: 'v1', k8s: 'v1' }
    API_CFG.openshift.defaultVersion = "v1";
    API_CFG.k8s.defaultVersion = "v1";

    // generates something like:
    // https://localhost:8443
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
      if (!resourceInfo(resource)) {
        Logger.warn('Unknown resource "' + resource + '"');
        return undefined;
      }
      return resource;
    };

    var apiExistsFor = function(resource, apiVersion) {
      return !!resourceInfo(resource, apiVersion);
    };

    var ensureVersion = function(api, preferredAPIVersion) {
      return preferredAPIVersion || (api && api.defaultVersion);
    };

    // find the api object for the relevant resource from the API_CFG
    var findApiForResource = function(resource, preferredAPIVersion) {
      return _.find(API_CFG, function(api) {
              var apiVersion = ensureVersion(api, preferredAPIVersion);
              var prefix = api.prefixes[apiVersion] || api.prefixes['*'];
              if (!api.resources[resource] && !api.resources['*']) {
                return;
              }
              if (!prefix) {
                return;
              }
              return true;
            });
    };

    // transforms the api object for a resource into the format
    // that is used to generate a url for the resource
    var resourceInfo = function(resource, preferredAPIVersion) {
      return (function(api) {
        var apiVersion = ensureVersion(api, preferredAPIVersion);
        return api ?
                  {
                    hostPort:   api.hostPort,
                    prefix:     api.prefixes[apiVersion] || api.prefixes['*'],
                    apiVersion: apiVersion
                  } :
                  undefined;
      })(findApiForResource(resource, preferredAPIVersion));
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

    var URL_ROOT_TEMPLATE         = "{protocol}://{+serverUrl}{+apiPrefix}/{apiVersion}/";
    var URL_GET_LIST              = URL_ROOT_TEMPLATE + "{resource}{?q*}";
    var URL_OBJECT                = URL_ROOT_TEMPLATE + "{resource}/{name}{/subresource*}{?q*}";
    var URL_NAMESPACED_GET_LIST   = URL_ROOT_TEMPLATE + "namespaces/{namespace}/{resource}{?q*}";
    var URL_NAMESPACED_OBJECT     = URL_ROOT_TEMPLATE + "namespaces/{namespace}/{resource}/{name}{/subresource*}{?q*}";

    var findTemplateFor = function(name, namespace) {
      return name ?
              namespace ?
                URL_NAMESPACED_OBJECT :
                URL_OBJECT :
              namespace ?
                URL_NAMESPACED_GET_LIST :
                URL_GET_LIST;
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

    // build the actual url for the resource
    var urlForResource = function(resource, name, apiVersion, context, isWebsocket, params) {
      var info = resourceInfo(resource, apiVersion);
      var namespace = findNamespace(context, params);

      if (!info) {
        Logger.error("urlForResource called with unknown resource", resource, arguments);
        return null;
      }
      return URI.expand(findTemplateFor(name, namespace), {
                protocol: protocol(isWebsocket),
                serverUrl: info.hostPort,
                apiPrefix: info.prefix,
                apiVersion: info.apiVersion,
                resource: _.first(resource.split('/')),
                subresource: _.rest(resource.split('/')),
                name: name,
                namespace: namespace,
                q: cleanCopyParams(params)
              });
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

    // ApiEndpointService.normalizeResource()
    // ApiEndpointService.kindToResource()
    // ApiEndpointService.apiExistsFor()
    // ApiEndpointService.openshiftAPIBaseUrl()
    // ApiEndpointService.urlForResource()
    // ApiEndpointService.url()
    return {
      normalizeResource: normalizeResource,       // DataService.js
      kindToResource: kindToResource,             // DataService.js, createFromImage.js
      apiExistsFor: apiExistsFor,                 // DataService.js
      openshiftAPIBaseUrl: openshiftAPIBaseUrl,   // nextSteps.js
      urlForResource: urlForResource,             // DataService.js
      url: url                                    // javaLink.js, resources.js
    };
  });
