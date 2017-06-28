(function() {
    "use strict";

    angular
        .module("TendrlModule")
        .controller("ExpandGlusterController", ExpandGlusterController);

    /*@ngInject*/
    function ExpandGlusterController($rootScope, $scope, $state, selectedCluster, clusterStore, utils) {

        var vm = this;

        vm.taskSubmitted = false;
        vm.cluster = selectedCluster;
        vm.selectedHost = [];

        vm.hostFilterBy = {
            "property": "fqdn",
            "value": ""
        };

        vm.cancelModal = cancelModal;
        vm.closeModal = closeModal;
        vm.addHost = addHost;
        vm.viewTaskProgress = viewTaskProgress;
        vm.selectHost = selectHost;
        vm.isSelectedHost = isSelectedHost;
        vm.filterList = filterList;
        vm.refreshHost = refreshHost;
        vm.getMaxCount = getMaxCount;

        vm.modalHeader = {
            "title": "Add Host",
            "close": vm.closeModal
        };

        vm.modalFooter = [{
            "name": "Cancel",
            "classname": "btn-default",
            "onCall": vm.cancelModal
        }, {
            "name": "Add",
            "classname": "btn-primary",
            "onCall": vm.addHost
        }];

        init();

        function init() {
            vm.isNodeLoading = true;
            vm.totalDevices = 0
            vm.availableHostList = [];
            vm.serverNodes = [];
            vm.updatedHostList = [];

            utils.getObjectList("Node").then(function(list) {
                var hostList = list.nodes,
                    len = hostList.length,
                    nodes,
                    i;

                vm.isNodeLoading = false;
                nodes = hostList.slice(0);

                if (list !== null && len !== 0) {
                    for (i = 0; i < len; i++) {

                        if (JSON.parse(hostList[i].tags).indexOf("tendrl/central-store") !== -1) {
                            vm.serverNodes.push(hostList[i]);
                        } else if (!hostList[i].detectedcluster || (hostList[i].detectedcluster && hostList[i].detectedcluster.detected_cluster_id === "")) {

                            if (hostList[i].networks && hostList[i].localstorage) {
                                _changeIntoArray(hostList[i]);

                                if (_isInSelectedNetwork(hostList[i])) {
                                    vm.availableHostList.push(hostList[i]);
                                    _createHostList(hostList[i]);
                                    _calculateSummaryValues();
                                }
                            }
                        }
                    }
                }

            });
        }

        /**
         * @name cancelModal
         * @desc cancels the modal
         * @memberOf ExpandGlusterController
         */

        function cancelModal() {
            $state.go("cluster");
            $rootScope.$emit("modal.done", "cancel");
        }

        /**
         * @name closeModal
         * @desc close the modal
         * @memberOf ExpandGlusterController
         */
        function closeModal() {
            $rootScope.$emit("modal.done", "close");
        }

        /**
         * @name rebalance
         * @desc rebalance the volume
         * @memberOf ExpandGlusterController
         */
        function addHost() {
            clusterStore.addHost(vm.selectedHost, selectedCluster)
                .then(function(data) {
                    vm.jobId = data.job_id;
                    vm.taskSubmitted = true;
                });
        }

        /**
         * @name viewTaskProgress
         * @desc takes to task progress page
         * @memberOf RebalanceVolumeController
         */
        function viewTaskProgress() {
            vm.closeModal();
            $state.go("task-detail", { taskId: vm.jobId });
        }

        /** Refresh host lis to get updated hosts **/
        function refreshHost() {
            init();
        }

        /** Returns maximum number of host that can be added **/
        function getMaxCount() {
            return 128 - vm.selectedHost.length;
        }

        /** Do necessary operation when a host is selected or deselected **/
        function selectHost(host) {

            var hostIndex;

            if (typeof host === "boolean") {

                if (host) {
                    vm.selectedHost = vm.updatedHostList.slice(0);
                } else {
                    vm.selectedHost = [];
                }

            } else if (typeof host === "object") {
                hostIndex = vm.selectedHost.indexOf(host);

                if (hostIndex === -1) {
                    vm.selectedHost.push(host);
                } else {
                    vm.selectedHost.splice(hostIndex, 1);
                }
            }

            _calculateSummaryValues();
            vm.getMaxCount();
        }

        /** Checks whether host is selected or not **/
        function isSelectedHost(host) {
            return vm.selectedHost.indexOf(host) > -1;
        }

        /** Filer the host list based on the parameters **/
        function filterList(item) {
            var properties,
                property,
                i,
                diskLen,
                disks,
                searchBy = {},
                eth,
                ethlen,
                list = item.ifIPMapping,
                len = list.length;

            if (vm.hostFilterBy.value) {

                properties = vm.hostFilterBy.property.split(".");

                if (properties.length > 1) {
                    property = properties[1];

                    for (i = 0; i < len; i++) {
                        if (list[i][property].toLowerCase().indexOf(vm.hostFilterBy.value.toLowerCase()) >= 0) {
                            item.isExpanded = true;
                            return item;
                        }
                    }

                } else {
                    property = vm.hostFilterBy.property;

                    if (item[property].toLowerCase().indexOf(vm.hostFilterBy.value.toLowerCase()) >= 0) {
                        return item;
                    }
                }

            } else {
                return item;
            }
        }

        /* Private Functions */

        /** To check whether the nodes are in the same public network in which cluster was created**/
        function _isInSelectedNetwork(host) {
            var interfaceKeys = Object.keys(host.networks),
                len = interfaceKeys.length,
                flag = false,
                i;

            for (i = 0; i < len; i++) {

                if (host.networks[interfaceKeys[i]].subnet === selectedCluster.clusterNetwork) {
                    flag = true;
                    host.provisioningIP = host.networks[interfaceKeys[i]].ipv4[0];
                    return flag;
                }
            }

            return flag;
        }

        /** Change the host.networks to JSON **/
        function _changeIntoArray(host) {
            var i,
                interfaces = Object.keys(host.networks),
                len = interfaces.length;

            for (i = 0; i < len; i++) {
                host.networks[interfaces[i]].ipv4 = JSON.parse(host.networks[interfaces[i]].ipv4);
            }
        }

        /** Create host list after manipulating the API response **/
        function _createHostList(host) {
            var interfaceKeys = Object.keys(host.networks),
                len = interfaceKeys.length,
                obj = {},
                temp;

            obj.fqdn = host.fqdn;
            obj.node_id = host.node_id;
            obj.ifLength = len;
            obj.ifIPMapping = [];
            obj.provisioningIP = host.provisioningIP;

            if (!host.localstorage.blockdevices) {
                obj.freeDevices = 0;
                obj.usedDevices = 0;
                obj.totalNodeInDevice = 0;
                obj.storage_disks = [];
                obj.availableCapacity = 0;
            } else {
                obj.freeDevices = host.localstorage.blockdevices.free ? Object.keys(host.localstorage.blockdevices.free).length : 0;
                obj.usedDevices = host.localstorage.blockdevices.used ? Object.keys(host.localstorage.blockdevices.used).length : 0;
                obj.totalNodeInDevice = obj.freeDevices + obj.usedDevices;
                obj.storage_disks = _getDisks(host);
                obj.availableCapacity = host.localstorage.blockdevices.free ? _getACapacity(host) : 0;
            }

            _prepareInterface(host, obj);

            vm.updatedHostList.push(obj);
        }

        /** preparing interface for a host **/
        function _prepareInterface(host, obj) {
            var i,
                j,
                temp,
                interfaceKeys = Object.keys(host.networks),
                len = interfaceKeys.length,
                ip,
                ipLen;


            for (i = 0; i < len; i++) {
                temp = {};

                ip = host.networks[interfaceKeys[i]].ipv4;
                ipLen = ip.length;

                for (j = 0; j < ipLen; j++) {
                    temp.if = interfaceKeys[i];
                    temp.ip = ip[j];
                    temp.subnet = host.networks[interfaceKeys[i]].subnet;
                    obj.ifIPMapping.push(temp);
                }
            }
        }

        /** Returns free disks **/
        function _getDisks(host) {
            var keys = Object.keys(host.localstorage.blockdevices.free),
                len = keys.length,
                disks = host.localstorage.blockdevices.free,
                temp,
                conf = [],
                i;

            for (i = 0; i < len; i++) {
                temp = {};
                temp.device = disks[keys[i]].device_name;
                temp.size = parseInt(disks[keys[i]].size) || 0;
                temp.ssd = (disks[keys[i]].ssd === "True");
                conf.push(temp);
            }
            return conf;
        }

        /** Returns available capacity **/
        function _getACapacity(host) {
            var keys = Object.keys(host.localstorage.blockdevices.free),
                len = keys.length,
                disks = host.localstorage.blockdevices.free,
                size = 0,
                i;

            for (i = 0; i < len; i++) {
                size += parseInt(disks[keys[i]].size);
            }

            return size;
        }

        /** Calculate host summary   **/
        function _calculateSummaryValues() {
            var len = vm.selectedHost.length,
                i;

            vm.totalDevices = 0;
            vm.totalAvailableCapacity = 0;

            for (i = 0; i < len; i++) {
                vm.totalDevices += vm.selectedHost[i].freeDevices;
                vm.totalAvailableCapacity += vm.selectedHost[i].availableCapacity;
            }
        }

    }

})();
