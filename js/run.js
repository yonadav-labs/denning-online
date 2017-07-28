materialAdmin
    .run(function ($rootScope, Auth, $state){
    	$rootScope.$on('$stateChangeStart', function (event, toState, toStateParams) {
            $rootScope.toState = toState;
            $rootScope.toStateParams = toStateParams;


            if (toState.data && toState.data.access) {
                /*Cancel going to the authenticated state and go back to landing*/
                if (toState.data.access == '@' && !Auth.isAuthenticated()) {
                    event.preventDefault();
                    return $state.go('login');
                }

                if (toState.data.access == '?' && Auth.isAuthenticated()) {
                    event.preventDefault();
                    return $state.go('home');
                }
            }
        });
    })

    .run(function(formlyConfig) {
        var attributes = [
            'date-disabled',
            'custom-class',
            'show-weeks',
            'starting-day',
            'init-date',
            'min-mode',
            'max-mode',
            'format-day',
            'format-month',
            'format-year',
            'format-day-header',
            'format-day-title',
            'format-month-title',
            'year-range',
            'shortcut-propagation',
            'datepicker-popup',
            'show-button-bar',
            'current-text',
            'clear-text',
            'close-text',
            'close-on-date-selection',
            'datepicker-append-to-body'
        ];

        var bindings = [
            'datepicker-mode',
            'min-date',
            'max-date'
        ];
            
        var ngModelAttrs = {};

        angular.forEach(attributes, function(attr) {
            ngModelAttrs[camelize(attr)] = {attribute: attr};
        });

        angular.forEach(bindings, function(binding) {
            ngModelAttrs[camelize(binding)] = {bound: binding};
        });
            
        function camelize(string) {
            string = string.replace(/[\-_\s]+(.)?/g, function(match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
            // Ensure 1st char is always lowercase
            return string.replace(/^([A-Z])/, function(match, chr) {
                return chr ? chr.toLowerCase() : '';
            });
        }        
            
        // set templates here
        formlyConfig.setType({
            name: 'price_w_currency',
            templateUrl: 'price_w_currency.html'
        });
        
        formlyConfig.setType({
            name: 'group_label',
            templateUrl: 'group_label.html'
        });
        
        formlyConfig.setType({
            name: 'text',
            templateUrl: 'text.html'
        });
        
        // contact attribute
        formlyConfig.setType({
            name: 'contact',
            templateUrl: 'contact.html',
            controller: ['$scope', 'legalFirmService', 'contactService', 'Auth', '$uibModal', function ($scope, legalFirmService, contactService, Auth, $uibModal) {
                $scope.getNumber = function(num) {
                    return new Array(num);   
                }

                $scope.represent_this = false;
                $scope.userInfo = Auth.getUserInfo();

                $scope.representChange = function() {
                    $scope.model[$scope.options.key+'_solicitor'] = $scope.represent_this ? $scope.userInfo.catPersonal[0].LawFirm : {};                    
                }
                
                $scope.model[$scope.options.key] = [
                {
                  "party": "",
                  "share": ""
                }];

                $scope.solicitor = {};                

                $scope.changeSolicitor = function(item) {
                    $scope.solicitor = item;                    
                }

                $scope.addParty = function() {
                    $scope.model[$scope.options.key].push({
                        "party": "",
                        "share": ""
                    })
                }

                $scope.removeParty = function(idx) {
                    if ($scope.model[$scope.options.key].length > 1)
                        $scope.model[$scope.options.key].splice(idx, 1);
                }

                contactService.getList().then(function(data) {
                    $scope.contacts = data;
                });                     

                legalFirmService.getList().then(function(data) {
                    $scope.legalFirms = data;
                });          

                //Create Modal
                $scope.createContact = function() {
                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'views/contact-edit.html',
                        controller: 'contactCreateModalCtrl',
                        controllerAs: 'vm',
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: true,
                        resolve: {
                            contact: function () {
                                return {};
                            }
                        }            
                    });
                }

            }]      
        });
        
        // legal firm attribute
        formlyConfig.setType({
            name: 'legalFirm',
            templateUrl: 'legalFirm.html',
            controller: ['$scope', function ($scope) {
                legalFirmService.getList().then(function(data) {
                    $scope.legalFirms = data;
                    $scope.dataReady = true;
                });                     
            }]      
        });

        // gen-doc attribute
        formlyConfig.setType({
            name: 'gen-doc',
            templateUrl: 'gen-doc.html',
            controller: ['$scope', '$filter', 'NgTableParams', 'templateService', function ($scope, $filter, NgTableParams, templateService) {
                templateService.getCategories().then(function(data) {
                    $scope.categories = data;
                });        

                $scope.updateType = function() {
                    templateService.getTypes($scope.model[$scope.options.key+'_category']).then(function(data) {
                        $scope.types = data;
                    });        
                }

                $scope.updateTemplates = function() {
                    $scope.dataReady = false;
                    if ($scope.model[$scope.options.key+'_category'] && $scope.model[$scope.options.key+'_type'] && $scope.model[$scope.options.key+'_source']) {
                        templateService.getTemplates($scope.model[$scope.options.key+'_category'], $scope.model[$scope.options.key+'_type'], $scope.model[$scope.options.key+'_source']).then(function(data) {
                            $scope.data = data;
                            $scope.dataReady = true;
                            initializeTable();
                        });                                
                    }
                }

                $scope.sources = [
                    'All',
                    'Online',
                    'User'
                ];
                
                function initializeTable () {
                    //Filtering
                    $scope.tableFilter = new NgTableParams({
                        page: 1,            // show first page
                        count: 10,
                        sorting: {
                            name: 'asc'     // initial sorting
                        }
                    }, {
                        total: $scope.data.length, // length of data
                        getData: function(params) {
                            // use build-in angular filter
                            var orderedData = params.filter() ? $filter('filter')($scope.data, params.filter()) : $scope.data;
                            orderedData = params.sorting() ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;

                            this.data = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count());
                            params.total(orderedData.length); // set total for recalc pagination
                            return this.data;
                        }
                    })      
                }
            }]      
        });
        
        formlyConfig.setType({
          name: 'datepicker',
          templateUrl:  'datepicker.html',
          wrapper: ['bootstrapLabel', 'bootstrapHasError'],
          defaultOptions: {
            ngModelAttrs: ngModelAttrs,
            templateOptions: {
              datepickerOptions: {
                format: 'MM.dd.yyyy',
                initDate: new Date()
              }
            }
          },
          controller: ['$scope', function ($scope) {
            $scope.datepicker = {};
      
            $scope.datepicker.opened = false;    

            $scope.datepicker.open = function ($event) {
              $scope.datepicker.opened = !$scope.datepicker.opened;
            };
          }]
        });    
    });