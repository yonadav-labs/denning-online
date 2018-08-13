denningOnline
  .service('folderService', function(http) {
    var service = {};
    
    service.getList = function (code, type) {
      var url = 'v1/app/';
      if (type == 'contact') {
        url = url + 'contactFolder/'+code;
      } else if (type == 'matter') {
        url = url + 'matter/'+code+'/fileFolder';
      }

      return http.GET(url).then(function (resp) {
        return resp.data;
      });
    }

    service.download = function (url) {
      return http.GET(url, {}, 'arraybuffer').then(function(resp) {
        return resp;
      });
    }

    service.getLink = function (url) {
      return http.GET(url).then(function (resp) {
        return resp.data;
      });
    }

    service.renameDocument = function (url, data) {
      return http.PUT(url, data).then(function (resp) {
        return resp;
      });
    }

    service.createSubFolder = function (data) {
      return http.POST('v1/document/subFolder', data).then(function (resp) {
        return resp;
      });
    }

    service.moveDocument = function (data) {
      return http.PUT('v1/document/move', data).then(function (resp) {
        return resp;
      });
    }

    service.deleteDocument = function (url) {
      return http.DELETE(url).then(function (resp) {
        return resp;
      });
    }

    return service;
  })
