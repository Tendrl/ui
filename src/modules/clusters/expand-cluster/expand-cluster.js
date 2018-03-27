(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("expandClusterController", expandClusterController);

    /*@ngInject*/
    function expandClusterController($rootScope, $scope, $state, clusterStore,  nodeStore, selectedCluster, Notifications, $uibModal) {

        var vm = this,
            jobId;

        vm.disableExpand = false;
        vm.clusterId = selectedCluster.clusterId;
        vm.hostList = [];
        vm.filteredHostList = [];
        vm.filters = [];
        vm.isDataLoading = true;

        vm.closeModal = closeModal;
        vm.confirmModal = confirmModal;

        vm.modalHeader = {
            "title": "Expand " + selectedCluster.clusterId,
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "type": "button",
            "classname": "btn-default",
            "onCall": vm.closeModal
        }, {
            "name": "Expand",
            "type": "submit",
            "classname": "btn-primary",
            "onCall": vm.confirmModal
        }];

        vm.filterConfig = {
            fields: [{
                id: "name",
                title: "Name",
                placeholder: "Filter by Name",
                filterType: "text"
            }, {
                id: "ipAddress",
                title: "Address",
                placeholder: "Filter by IP Address",
                filterType: "text"
            }],
            appliedFilters: [],
            onFilterChange: _filterChange,
        };

        vm.tableConfig = {
            selectionMatchProp: "name",
            itemsAvailable: true,
            showCheckboxes: false
        };

        vm.tableColumns = [{
            header: "Host",
            itemField: "name"
        }, {
            header: "Address",
            itemField: "ipAddress"
        }];

        init();

        function init() {

            nodeStore.getNodeList(vm.clusterId)
                .then(function(list) {
                    vm.hostList = list;
                    vm.filteredHostList = vm.hostList;
                    _filterChange(vm.filters);
                }).catch(function(e) {
                    vm.hostList = [];
                    vm.filteredHostList = vm.hostList;
                    _filterChange(vm.filters);
                }).finally(function() {
                    vm.isDataLoading = false;
                });
        }

        /**
         * @name closeModal
         * @desc close the modal
         * @memberOf expandClusterController                
         */
        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        }

        /**
         * @name next
         * @desc takes to next step
         * @memberOf expandClusterController                

         */
        function confirmModal() {

            selectedCluster.disableExpand = true;
            vm.closeModal();
            clusterStore.expandCluster(vm.clusterId)
                .then(function(data) {
                    jobId = data.job_id;
                    selectedCluster.disableExpand = true;
                    Notifications.message("success", "", "Successfully initiated expand cluster task");
                }).catch(function(error) {
                    Notifications.message("danger", "", "Failed to initiate expand");
                    selectedCluster.disableExpand = false;
                });
        }

        /*****Private Functions*****/

        function _matchesFilter(item, filter) {
            var match = true;
            var re = new RegExp(filter.value, "i");

            if (filter.id === "name") {
                match = item.name.match(re) !== null;
            } else if (filter.id === "ipAddress") {
                match = item.ipAddress.match(re) !== null;
            }
            return match;
        }

        function _matchesFilters(item, filters) {
            var matches = true;

            filters.forEach(function(filter) {
                if (!_matchesFilter(item, filter)) {
                    matches = false;
                    return false;
                }
            });
            return matches;
        }

        function _applyFilters(filters) {
            vm.filteredHostList = [];
            if (filters && filters.length > 0) {
                vm.hostList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredHostList.push(item);
                    }
                });
            } else {
                vm.filteredHostList = vm.hostList;
            }
            vm.filterConfig.resultsCount = vm.filteredHostList.length;
        }

        function _filterChange(filters) {
            vm.filtersText = "";
            vm.filters = filters;
            
            filters.forEach(function(filter) {
                vm.filtersText += filter.title + " : ";
                if (filter.value.filterCategory) {
                    vm.filtersText += ((filter.value.filterCategory.title || filter.value.filterCategory) +
                        filter.value.filterDelimiter + (filter.value.filterValue.title || filter.value.filterValue));
                } else if (filter.value.title) {
                    vm.filtersText += filter.value.title;
                } else {
                    vm.filtersText += filter.value;
                }
                vm.filtersText += "\n";
            });

            _applyFilters(filters);
        }
    }

})();
