materialAdmin
  // =========================================================================
  // Properties
  // =========================================================================
  
  .service('propertyService', function($q, $timeout, $http, Auth) {
    var service = {};

    service.properties = null;
    service.getList = getList;
    service.getItem = getItem;
    service.save = save;
    service.delete = delete_;

    function getList(page, pagesize, keyword) {
      return $http({
        method: 'GET',
        url: 'http://43.252.215.81/denningwcf/v1/property?page='+page+'&pagesize='+pagesize+'&search='+keyword,
        headers: Auth.isAuthenticated()
      }).then(function(resp) {
        service.properties = resp.data;
        return resp;
      });  
    }

    service.getTableList = function (page, pagesize, keyword) {
      return $http({
        method: 'GET',
        url: 'http://43.252.215.81/denningwcf/v1/table/property?page='+page+'&pagesize='+pagesize+'&search='+keyword,
        headers: Auth.isAuthenticated()
      }).then(function(resp) {
        return resp;
      });  
    };

    function getItem(code) {
      return $http({
        method: 'GET',
        url: 'http://43.252.215.81/denningwcf/v1/table/property/'+code,
        headers: Auth.isAuthenticated()
      }).then(function(resp) {
        return resp.data;
      });  
    }

    function save(property) {
      var method = property.code ? 'PUT': 'POST';
      delete property.relatedMatter;

      return $http({
        method: method,
        url: 'http://43.252.215.81/denningwcf/v1/property',
        headers: Auth.isAuthenticated(),
        data: property
      }).then(function(response) {
        return response.data;
      });
    }

    function delete_(property) {
      var deferred = $q.defer();

      $timeout(function(){
        var idx = service.properties.map(function(c) { return c.code; }).indexOf(property.code);
        if(idx != -1) {
          service.properties.splice(idx, 1);
          deferred.resolve(property);
        } else {
          deferred.reject(new Error('There is no such property'));
        }
        // @@ send delete request to server to delete the item
      }, 100);

      return deferred.promise;
    }

    service.getTypeList = function (type) {
      return $http({
        method: 'GET',
        url: 'http://43.252.215.81/denningwcf/v1/Property/'+type,
        headers: Auth.isAuthenticated()
      }).then(function(resp) {
        return resp.data;
      });  
    }

    return service;
  })
