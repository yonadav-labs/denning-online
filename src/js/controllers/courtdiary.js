denningOnline
  .controller('courtdiaryListCtrl', function($stateParams, NgTableParams, 
                                             courtdiaryService, $state, Auth) 
  {
    var self = this;

    self.userInfo = Auth.getUserInfo();
    self.keyword = $stateParams.keyword;
    self.option = 'today,today,0All';
    self.filter = '0All';
    self.firstDay = moment(new Date()).format('YYYY-MM-DD');
    self.lastDay = moment(new Date()).format('YYYY-MM-DD');

    self.tableFilter = new NgTableParams({
      page: 1,
      count: 25
    }, {
      getData: function(params) {
        return courtdiaryService.getCalendar(self.firstDay, self.lastDay, self.filter, params.page(), 
                                             params.count(), self.keyword)
        .then(function (data) {
          params.total(data.headers('x-total-count'));
          return data.data;
        });
      }
    });

    self.search = function () {
      self.tableFilter.reload();
    }

    function parseDate(strDate) {
      if (strDate == "today") {
        return moment(new Date()).format('YYYY-MM-DD');
      } else if (strDate == "yesterday") {
        return moment(new Date()).add(-1, 'days').format('YYYY-MM-DD');
      } else {
        return strDate;
      }
    }

    self.changeFilter = function () {
      var option = self.option.split(',');
      self.firstDay = parseDate(option[0]);
      self.lastDay = parseDate(option[1]);
      self.filter = option[2];
      self.tableFilter.reload();
    }

    self.onSelect = function(argStart, argEnd) {
      self.firstDay = argStart.toISOString();
      self.lastDay = moment(argEnd).add(-1, 'days').format('YYYY-MM-DD');
      self.tableFilter.reload();
    }
  })

  .controller('courtdiaryEditCtrl', function($state, $uibModal, $stateParams, refactorService, 
                                             Auth, $scope, growlService, courtdiaryService, 
                                             fileMatterService, contactService) 
  {
    var self = this;
    self.userInfo = Auth.getUserInfo();
    self.create_new = $state.$current.data.can_edit;
    self.can_edit = $state.$current.data.can_edit;

    if ($stateParams.id) {
      courtdiaryService.getItem($stateParams.id).then(function (item) {
        self.entity = refactorService.preConvert(item, true);
        self.entity_ = angular.copy(self.entity);

        if (self.entity.strFileNo1) {
          self.rmatter = {
            key: self.entity.strFileNo1
          }
        }

        if (self.entity.strHearingType) {
          self.strHearingType = {
            description: self.entity.strHearingType
          }
        }

        if (self.entity.strCounselAssigned) {
          self.strCounselAssigned = {
            code: self.entity.strCounselAssigned
          }
        }

        if (self.entity.strCounselAttended) {
          self.strCounselAttended = {
            code: self.entity.strCounselAttended
          }
        }

        if (self.entity.intCoram) {
          self.intCoram = {
            code: self.entity.intCoram
          }
        }

        if (self.entity.clsAttendedStatus) {
          self.clsAttendedStatus = self.entity.clsAttendedStatus.code+"-"+self.entity.clsAttendedStatus.description;
        }
      });
    } else {
      self.entity = {};
      self.clsAttendedStatus = '0-None';
    }

    self.queryMatters = function (search) {
      return fileMatterService.getList(1, 5, search).then(function (resp) {
        return resp.data
      })
    }

    self.matterChange = function (item) {
      if (item) {
        self.entity.strFileNo1 = item.key;
      }
    }

    self.queryHearingType = function (search) {
      return courtdiaryService.getHearingTypeList(1, 10, search).then(function (resp) {
        return resp.data;
      })
    }

    self.queryStaff = function (search) {
      return contactService.getStaffList(1, 10, search).then(function (resp) {
        return resp.data;
      })
    }

    self.queryCoram = function (search) {
      return courtdiaryService.getCoramList(1, 10, search).then(function (resp) {
        return resp.data;
      })
    }

    self.hearingTypeChange = function (item) {
      if (item) {
        self.entity.strHearingType = item.description
      }
    }

    self.caChange = function (item) {
      if (item) {
        self.entity.strCounselAssigned = item.strInitials
      }
    }

    self.cdChange = function (item) {
      if (item) {
        self.entity.strCounselAttended = item.strInitials
      }
    }

    self.coramChange = function (item) {
      if (item) {
        self.entity.intCoram = item.code
      }
    }

    self.copy = function () {
      self.create_new = true;
      self.can_edit = true;
      self.entity_ = null;

      var deleteList = ['code', 'dtDateEntered', 'dtDateUpdated', 'dtPreviousDate', 'clsEnteredBy',
                        'clsUpdatedBy'];
      for (ii in deleteList) {
        key = deleteList[ii];
        delete self.entity[key];
      }
    }

    self.save = function () {
      self.entity.clsAttendedStatus = {
        code: self.clsAttendedStatus.split('-')[0],
        description: self.clsAttendedStatus.split('-')[1]
      }

      entity = refactorService.getDiff(self.entity_, self.entity);
      courtdiaryService.save(entity).then(function (entity) {
        if (self.entity_) {
          $state.reload();
        } else {
          $state.go('courtdiaries.edit', { 'id': entity.code });
        }
        growlService.growl('Saved successfully!', 'success');
      });
    }

    self.cancel = function () {
      $state.go('courtdiary');
    }

    //Prevent Outside Click
    self.openDelete = function (event, contact) {
      event.stopPropagation();
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'deleteEntityModal.html',
        controller: 'deleteEntityModalCtrl',
        size: '',
        backdrop: 'static',
        keyboard: true,
        resolve: {
          entity: function () {
            return entity;
          }, 
          on_list: function () {
            return false;
          },
          entity_type: function () {
            return 'court diary';
          },
          service: function () {
            return courtdiaryService;
          },
          return_state: function () {
            return 'courtdiaries.list';
          }
        }
      });
    };
  })