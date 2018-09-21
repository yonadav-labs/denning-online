denningOnline
// =========================================================================
// Cities / Postcodes
// =========================================================================
  
  .service('cityService', function (http) {
    var service = {};

    service.getList = function (page, pagesize, keyword) {
      return http.GET('v1/Postcode', {
        page: page,
        pagesize: pagesize,
        search: keyword 
      }).then(function (resp) {
        return resp;
      });
    }
    
    return service;
  })
