(function () {
    "use strict";

    var app = angular.module("TendrlModule");

    var clusterObject = {
		id: "NA",
		status: "NA",
		name: "NA",
		storage: "NA",
		iops: "NA",
		host_count: "NA",
		pool_count: "NA",
		alert_count: "NA"
	}

    var hostObject = {
		id: "NA",
		status: "NA",
		name: "NA",
		cluster_name : "NA",
		role: "NA",
		storage: "NA",
		cpu: "NA",
		memory: "NA",
		alert_count: "NA"
	}

	var fileShareObject = {
		id: "NA",
		status: "NA",
		name: "NA",
		type: "NA",
		cluster_name : "NA",
		storage: "NA",
		brick_count: "NA",
		alert_count: "NA",
		last_rebalance: "NA"
	}

	var poolObject = {
		id: "NA",
		status: "NA",
		name: "NA",
		cluster_name : "NA",
		storage: "NA",
		replica_count: "NA",
		osd_count: "NA",
		quotas: "NA",
		alert_count: "NA"
	}

	var rbdObject = {
		id: "NA",
		name: "NA",
		cluster_name : "NA",
		storage: "NA",
		backing_pool: "NA",
		is_backing_pool_shared: false,
		alert_count: "NA"
	}

    app.constant("objectStructure", {

    	"clusterStructure"   :  clusterObject,
    	"hostStructure"      : 	hostObject,
    	"fileShareStructure" : 	fileShareObject,
    	"poolStructure"      : 	poolObject,
    	"rbdStructure"       : 	rbdObject

    });

})();
 