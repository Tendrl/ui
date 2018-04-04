(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("hostModalController", hostModalController);

    /*@ngInject*/
    function hostModalController($rootScope, cluster, nodeStore) {

        var vm = this;

        vm.messages = cluster.errors;
        vm.closeModal = closeModal;
        vm.clusterId = cluster.clusterId;
        vm.isDataLoading = true;
        vm.hostList = [];
        vm.filteredHostList = [];
        vm.filters = [];

        vm.modalHeader = {
            "title": "Hosts on " + cluster.name,
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Close",
            "type": "button",
            "classname": "btn-primary",
            "onCall": vm.closeModal
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
         * @memberOf deleteUserController                

         */
        function closeModal() {
            $rootScope.$emit("modal.done", "close");
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
