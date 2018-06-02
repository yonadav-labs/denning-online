materialAdmin
  .service('religionService', function ($http, Auth) {
    var service = {};

    service.getList = function (page=1, pagesize=10, keyword='') {
      return $http({
        method: 'GET',
        url: 'http://43.252.215.81/denningwcf/v1/table/religion?page='+page+'&pagesize='+pagesize+'&search='+keyword,
        headers: Auth.isAuthenticated()
      }).then(function(resp) {
        return resp.data;
      });  
    };

    service.getItem = function (code) {
      return $http({
        method: 'GET',
        url: 'http://43.252.215.81/denningwcf/v1/table/religion/'+code,
        headers: Auth.isAuthenticated()
      }).then(function(resp) {
        return resp.data;
      });    
    };

    return service;
  })