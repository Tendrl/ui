(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("brickStore", brickStore);

    /*@ngInject*/
    function brickStore($state, $q, utils) {
        var store = this;

        store.createBrick = function(brickDetails, cluster) {
            var deferred,
                postData;

            deferred = $q.defer();
            postData = _formatData(brickDetails);
            utils.createBrick(postData, cluster)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;

            function _formatData() {
                var obj = {
                    "Cluster.node_configuration": {}
                },
                len = brickDetails.length,
                diskLen,
                temp,
                i,
                j;

                for( i = 0; i < len; i++) {
                    obj["Cluster.node_configuration"][brickDetails[i].node_id] = {};
                    temp = obj["Cluster.node_configuration"][brickDetails[i].node_id];
                    diskLen = brickDetails[i].selectedDisk.length;

                    for(j = 0; j < diskLen; j++) {
                        temp[brickDetails[i].selectedDisk[j].device] = {"brick_name": brickDetails[i].selectedDisk[j].brickName}
                    }
                }

                return obj;
            }
        };

        store.glusterBrickMapping = function(cluster, selectedSubVolume) {
            var deferred,
                postData;

            deferred = $q.defer();
            postData = _generatePostDataForBrickLayout();
            utils.glusterBrickMapping(postData, cluster)
                .then(function(data) {
                    deferred.resolve(data);
                });

            return deferred.promise;

            function _generatePostDataForBrickLayout(){
                var bricksPostData = {},
                    nodesForBricks = {},
                    allNodes = cluster.nodes,
                    node,
                    totalBricksForCreatingVolume = 0,
                    nodeWithMinBrick = 0;

                for (node in allNodes) {
                    if(allNodes[node].hostCheckBoxSelected === true) {
                        nodesForBricks[node] = null;
                        totalBricksForCreatingVolume += allNodes[node].bricksAvaialble;
                    }
                }
                bricksPostData["Cluster.node_configuration"] = nodesForBricks;
                bricksPostData["Volume.brick_count"] = totalBricksForCreatingVolume;
                bricksPostData["Volume.subvol_size"] = selectedSubVolume;
                return bricksPostData;
            }
        };

        store.getTaskOutput = function(jobId) {
            var deferred = $q.defer(),
                 brickMapping;

            utils.getTaskOutput(jobId)
                .then(function(data) {
                    brickMapping = data && data[0] && data[0].GenerateBrickMapping && data[0].GenerateBrickMapping.result ? data[0].GenerateBrickMapping.result : [];
                    deferred.resolve(brickMapping);
                });

            return deferred.promise;
        };
    }

})();
