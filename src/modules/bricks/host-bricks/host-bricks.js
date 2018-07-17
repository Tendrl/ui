(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .component("hostBrickDetails", {

            restrict: "E",
            templateUrl: "/modules/bricks/host-bricks/host-bricks.html",
            bindings: {
                clusterId: "=",
                hostId: "="
            },
            controller: hostBrickController,
            controllerAs: "vm"
        });

    /*@ngInject*/
    function hostBrickController($scope, $rootScope, $state, $interval, $stateParams, config, brickStore, clusterStore, utils) {
        var vm = this,
            clusterObj,
            hostBrickTimer;

        vm.isDataLoading = true;
        vm.flag = false;
        vm.brickList = [];
        vm.filteredBrickList = [];
        vm.filtersText = "";
        vm.filters = [];
        vm.stoppedBrickCnt = 0;

        vm.addTooltip = addTooltip;
        vm.removeErrMsg = removeErrMsg;

        vm.filterConfig = {
            fields: [{
                id: "volName",
                title: "Volume Name",
                placeholder: "Filter by Volume Name",
                filterType: "text"
            }, {
                id: "brickPath",
                title: "Brick Path",
                placeholder: "Filter by Brick Path",
                filterType: "text"
            }, {
                id: "status",
                title: "Brick Status",
                placeholder: "Filter by Brick Status",
                filterType: "select",
                filterValues: ["Started", "Stopped"]
            }, {
                id: "utilMoreThan",
                title: "Utilization More Than(%)",
                placeholder: "Filter by Utilization More Than(%)",
                filterType: "text"
            }, {
                id: "utilLessThan",
                title: "Utilization Less Than(%)",
                placeholder: "Filter by Utilization Less Than(%)",
                filterType: "text"
            }, {
                id: "devices",
                title: "Disk Device Path",
                placeholder: "Filter by Device Path",
                filterType: "text"
            }],
            appliedFilters: [],
            onFilterChange: _filterChange
        };

        vm.hostDetailConfig = {
            selectionMatchProp: "brickPath",
            itemsAvailable: true,
            showCheckboxes: false
        };

        vm.hostDetailColumns = [{
            header: "Brick Path",
            itemField: "brickPath",
            htmlTemplate: "/modules/bricks/host-bricks/brick-path.html"
        }, {
            header: "Volume Name",
            itemField: "volName"
        }, {
            header: "Utilization",
            itemField: "utilization",
            htmlTemplate: "/modules/bricks/host-bricks/utilization-path.html"
        }, {
            header: "Disk Device Path",
            itemField: "devices",
            templateFn: function(value, item) {
                return value[0];
            }
        }, {
            header: "Port",
            itemField: "port"
        }];

        vm.actionButtons = [{
            name: "Dashboard",
            title: "Dashboard",
            actionFn: _performAction
        }];

        init();

        /**
         * @name init
         * @desc contains the initialisation logic
         * @memberOf hostBrickController
         */
        function init() {
            vm.clusterId = $stateParams.clusterId;
            vm.hostId = $stateParams.hostId;
            vm.clusterName = clusterStore.getClusterDetails(vm.clusterId).name;

            if ($rootScope.clusterData) {
                brickStore.getHostBrickList(vm.clusterId, vm.hostId)
                    .then(function(data) {
                        vm.brickList = data;
                        vm.filteredBrickList = vm.brickList;
                        vm.stoppedBrickCnt = 0;

                        _getStoppedBrickCount();
                        _filterChange(vm.filters);
                        $interval.cancel(hostBrickTimer);
                        startTimer();
                    }).catch(function(e) {
                        vm.brickList = [];
                        vm.filteredBrickList = [];
                    }).finally(function() {
                        vm.isDataLoading = false;
                    });
            } else {
                clusterStore.getClusterList()
                    .then(function(data) {
                        return brickStore.getHostBrickList(vm.clusterId, vm.hostId);
                    }).catch(function() {
                        $rootScope.clusterData = [];
                        throw e;
                    }).then(function(data) {
                        vm.brickList = data;
                        vm.filteredBrickList = vm.brickList;
                        vm.stoppedBrickCnt = 0;

                        _getStoppedBrickCount();
                        _filterChange(vm.filters);
                        $interval.cancel(hostBrickTimer);
                        _makeTabList();
                        startTimer();
                    }).catch(function(e) {
                        vm.brickList = [];
                        vm.filteredBrickList = [];
                    }).finally(function() {
                        vm.isDataLoading = false;
                    });
            }
        }

        function startTimer() {

            hostBrickTimer = $interval(function() {
                init();
            }, 1000 * config.nodeRefreshIntervalTime, 1);
        }

        /*Cancelling interval when scope is destroy*/
        $scope.$on("$destroy", function() {
            $interval.cancel(hostBrickTimer);
        });

        function addTooltip($event) {
            vm.flag = utils.tooltip($event);
        }

        function removeErrMsg() {
            var len = vm.filters.length,
                percentage,
                i;

            vm.errorMsg = "";

            for (i = 0; i < len; i++) {
                if (vm.filters[i].id === "utilMoreThan" || vm.filters[i].id === "utilLessThan") {
                    percentage = parseFloat(vm.filters[i].value);

                    if (percentage < 0 || percentage > 100 || isNaN(percentage)) {
                        vm.filters.splice(i, 1);
                        _filterChange(vm.filters);
                    }
                }
            }
        }
        /*****Private Functions******/

        function _redirectToGrafana(brick) {
            var brickName = brick.brickPath.split(":")[1],
                hostName = brick.brickPath.split(":")[0].replace(/\./gi, "_");

            brickName = brickName.replace(/\//gi, "|");
            utils.redirectToGrafana("bricks", { clusterId: vm.clusterName, hostName: hostName, brickName: brickName, volumeName: brick.volName });
        }

        function _performAction(action, item) {
            _redirectToGrafana(item);
        }

        function _matchesFilter(item, filter) {
            var match = true,
                re = new RegExp(filter.value, "i"),
                percentage,
                utilization;

            if (filter.id === "volName") {
                match = item.volName.match(re) !== null;
            } else if (filter.id === "brickPath") {
                //TODO: move this logic to store later on
                match = (item.name.split(":")[1]).match(re) !== null;
            } else if (filter.id === "status") {
                match = item.status === filter.value.id || item.status.toLowerCase() === filter.value.toLowerCase();
            } else if (filter.id === "devices") {
                match = item.devices[0].match(re) !== null;
            } else if (filter.id === "utilMoreThan" || filter.id === "utilLessThan") {
                percentage = parseFloat(filter.value);
                utilization = parseFloat(item.utilization.used);

                if (percentage >= 0 && percentage <= 100) {

                    if (filter.id === "utilMoreThan") {
                        match = (utilization > percentage);
                    } else if (filter.id === "utilLessThan") {
                        match = (utilization < percentage);
                    }
                }
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

        function _validateFilter(filter) {
            var percentage,
                valid = true;

            if (filter.id === "utilMoreThan" || filter.id === "utilLessThan") {
                percentage = parseFloat(filter.value);

                if (percentage < 0 || percentage > 100 || isNaN(percentage)) {
                    vm.errorMsg = "Please enter a valid percentage.";
                    valid = false;
                }
            }

            return valid;
        }

        function _applyFilters(filters) {
            vm.filteredBrickList = [];
            if (filters && filters.length > 0) {
                vm.brickList.forEach(function(item) {
                    if (_matchesFilters(item, filters)) {
                        vm.filteredBrickList.push(item);
                    }
                });
            } else {
                vm.filteredBrickList = vm.brickList;
            }
            vm.filterConfig.resultsCount = vm.filteredBrickList.length;
        }

        function _filterChange(filters) {
            var valid = true;

            vm.filtersText = "";
            vm.filters = filters;

            filters.forEach(function(filter) {
                if (_validateFilter(filter)) {
                    vm.filtersText += filter.title + " : ";

                    if (filter.value.title) {
                        vm.filtersText += filter.value.title;
                    } else {
                        vm.filtersText += filter.value;
                    }
                    vm.filtersText += "\n";
                } else {
                    valid = false;
                    vm.filtersText = vm.filtersText.replace(filter.title + ": " + filter.value, "");
                    vm.filterConfig.appliedFilters.splice(brickStore.getFilterIndex(vm.filters, filter));
                }
            });

            if (valid) {
                _applyFilters(filters);
            }
        }

        function _getStoppedBrickCount() {
            var len = vm.filteredBrickList.length,
                i;

            for (i = 0; i < len; i++) {
                if (vm.filteredBrickList[i].status === "stopped") {
                    vm.stoppedBrickCnt += 1;
                }
            }
        }
    }

})();
