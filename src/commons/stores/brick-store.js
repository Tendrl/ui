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
    }

})();
