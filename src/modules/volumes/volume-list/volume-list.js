(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("volumeList", {

            restrict: "E",
            templateUrl: "/modules/volumes/volume-list/volume-list.html",
            bindings: {
                clusterId: "=?"
            },
            controller: volumeController,
            controllerAs: "volumeCntrl"
        });

    /*@ngInject*/
    function volumeController($scope, $rootScope, $state, $interval, utils, config, volumeStore) {
        var vm = this,
            volumeTimer,
            volumeList;

        vm.deleteFileShareStep = 1;
        vm.selectedFileShare = null;
        vm.isDataLoading = true;
        vm.flag = false;
        vm.volumeList = [];
        vm.filterBy = "name";
        vm.filterByValue = "Name";
        vm.filterPlaceholder = "Name";

        vm.isRebalanceAllowed = isRebalanceAllowed;
        vm.getRebalStatus = volumeStore.getRebalStatus;
        vm.redirectToGrafana = redirectToGrafana;
        vm.goToVolumeDetail = goToVolumeDetail;
        vm.addTooltip = addTooltip;
        vm.clearAllFilters = clearAllFilters;
        vm.changingFilterBy = changingFilterBy;
        vm.sortConfig = {
            fields: [{
                    id: 'name',
                    title: 'Name',
                    sortType: 'alpha'
                },
                {
                    id: 'status',
                    title: 'Status',
                    sortType: 'alpha'
                }
            ],
            onSortChange: _sortChange
        };

        init();

        function init() {

            volumeStore.getVolumeList(vm.clusterId)
                .then(function(data) {
                    $interval.cancel(volumeTimer);
                    vm.volumeList = data;
                    _sortChange(vm.sortConfig.currentField.id, vm.sortConfig.isAscending);
                    vm.isDataLoading = false;
                    startTimer();
                });
        }

        function _compareFn(item1, item2) {
            var compValue = 0;
            if (vm.sortConfig.currentField.id === "name") {
                compValue = item1.name.localeCompare(item2.name);
            } else if (vm.sortConfig.currentField.id === "status") {
                compValue = item1.status.localeCompare(item2.status);
            }

            if (!vm.sortConfig.isAscending) {
                compValue = compValue * -1;
            }

            return compValue;
        };

        function _sortChange(sortId, isAscending) {
            vm.volumeList.sort(_compareFn);
        };

        function startTimer() {
            volumeTimer = $interval(function() {
                init();
            }, 1000 * config.refreshIntervalTime, 1);
        }

        /* Trigger this function when we have cluster data */
        $scope.$on("GotClusterData", function(event, data) {
            /* Forward to home view if we don't have any cluster */
            if ($rootScope.clusterData === null || $rootScope.clusterData.clusters.length === 0) {
                $state.go("clusters");
            } else {
                init();
            }
        });

        /*Cancelling interval when scope is destroy*/
        $scope.$on('$destroy', function() {
            $interval.cancel(volumeTimer);
        });

        function redirectToGrafana(volume, $event) {
            utils.redirectToGrafana("volumes", $event, {
                clusterId: vm.clusterId,
                volumeName: volume.name
            });
        }

        function isRebalanceAllowed(volume) {
            return volume.type.startsWith("Distribute");
        }

        function goToVolumeDetail(volume) {
            if (vm.clusterId) {
                $state.go("volume-detail", { clusterId: vm.clusterId, volumeId: volume.volumeId });
            }
        }

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function clearAllFilters() {
            vm.filterBy = "name";
            vm.searchBy = {};
        }

        function changingFilterBy(filterValue) {
            vm.filterBy = filterValue;
            switch (filterValue) {
                case "name":
                    vm.filterByValue = "Name";
                    vm.filterPlaceholder = "Name";
                    break;

                case "status":
                    vm.filterByValue = "Status";
                    vm.filterPlaceholder = "Status";
                    break;

                case "type":
                    vm.filterByValue = "Type";
                    vm.filterPlaceholder = "Type";
                    break;
            };
        }
    }

})();
