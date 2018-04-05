materialAdmin
  // =========================================================================
  // Folders
  // =========================================================================
  
  .service('folderService', function($http, Auth) {
    var service = {
      headers: Auth.isAuthenticated(),
      getList: getList,
      download: download
    };


    function getList(code, type) {
      var url = 'http://43.252.215.81/denningwcf/v1/app/';
      if (type == 'contact') {
        url = url + 'contactFolder/'+code;
      } else {
        url = url + 'matter/'+code+'/fileFolder';
      }

      return $http({
        method: 'GET',
        url: url,
        headers: service.headers
      }).then(function(resp) {
        return resp.data;
      });  
    }

    function download(url) {
      return $http({
        method: 'GET',
        url: 'http://43.252.215.81/denningwcf/'+url,
        headers: service.headers,
        responseType: 'arraybuffer'
      }).then(function(resp) {
        return resp;
      });  
    }

    return service;
  })
