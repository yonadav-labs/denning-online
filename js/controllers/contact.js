materialAdmin
    .controller('contactListCtrl', function($filter, $sce, $uibModal, NgTableParams, contactService) {
        var self = this;
        self.dataReady = false;
        self.openDelete = openDelete;

        contactService.getList().then(function(data) {
            self.data = data;
            self.dataReady = true;
            initializeTable();
        });        
        
        function initializeTable () {
            //Filtering
            self.tableFilter = new NgTableParams({
                page: 1,            // show first page
                count: 10,
                sorting: {
                    name: 'asc'     // initial sorting
                }
            }, {
                total: self.data.length, // length of data
                getData: function(params) {
                    // use build-in angular filter
                    var orderedData = params.filter() ? $filter('filter')(self.data, params.filter()) : self.data;
                    orderedData = params.sorting() ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;

                    this.new_ic = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.name = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.email = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                    this.phone3 = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());

                    params.total(orderedData.length); // set total for recalc pagination
                    return this.new_ic, this.name, this.email, this.phone3;
                }
            })      
        }

        //Create Modal
        function modalInstances(animation, size, backdrop, keyboard, contact) {
            var modalInstance = $uibModal.open({
                animation: animation,
                templateUrl: 'myModalContent.html',
                controller: 'ModalInstanceCtrl',
                size: size,
                backdrop: backdrop,
                keyboard: keyboard,
                resolve: {
                    contact: function () {
                        return contact;
                    }
                }            
            });
        }

        //Prevent Outside Click
        function openDelete(contact) {
            modalInstances(true, '', 'static', true, contact)
        };        
    })

    .controller('ModalInstanceCtrl', function ($scope, $modalInstance, contact, contactService, $state) {
        $scope.ok = function () {
            contactService.delete(contact).then(function(contact) {
                $state.reload();
            })
            .catch(function(err){
                //Handler

                //$scope.formname.contactInfo.$error.push({meessage:''});
            });
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
            $state.go('contacts.list');
        };
    })

    .controller('contactEditCtrl', function($filter, $stateParams, contactService, $state) {
        var self = this;
        self.save = save;
        self.cancel = cancel;
        self.isDialog = false;
        self.viewMode = false;  // for edit / create

        if($stateParams.id) {
            contactService.getItem($stateParams.id)
            .then(function(item){
                self.contact = angular.copy(item);  // important
            });
        } else {
            self.contact = {};
        }

        function save() {
            contactService.save(self.contact).then(function(contact) {
                self.contact = contact;
                $state.go('contacts.list');
            })
            .catch(function(err){
                //Handler
            });
        }

        function cancel() {
            $state.go('contacts.list');            
        }
    })

    .controller('contactCreateModalCtrl', function ($modalInstance, contact, viewMode, contactService, $scope) {
        var self = this;
        self.save = save;
        self.cancel = cancel;
        self.isDialog = true;
        self.viewMode = viewMode;
        self.contact = contact;

        function save() {
            contactService.save(self.contact).then(function(contact) {
                self.contact = contact;
                console.log($scope.party);
                $modalInstance.close();
            })
            .catch(function(err){
                //Handler
            });
        };

        function cancel() {
            $modalInstance.dismiss('cancel');
        };
    })
