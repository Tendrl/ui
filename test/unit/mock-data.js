(function () {

     var testDataModule = angular.module("TestDataModule", []);

     testDataModule.value("generateForm", {
        formAttributes: [{
            "type":"String",
            "name": "volumeName",
            "value": "Volume1",
            "required": true
        },{
            "type":"Integer",
            "name": "stripe_count",
            "value": 3,
            "required": false
        },{
            "type":"Integer",
            "name": "replica_count",
            "value": 4,
            "required": true
        }],
        response: {
            job_id: 1234, 
            status: "in progress"
        },
        manipulatedData: {
            volumeName: "Volume1",
            stripe_count: 3,
            replica_count: 4
        },
        postUrl: "http://10.70.7.196:8080/api/cluster-import-flow.json",
        callBack: function callBack(response) {
            vm.notification = "Volume is created successfully. and JOB-ID is - " + response.job_id + " And Volume creation is " + response.status;
        }
     });

     testDataModule.value("generateFormField", {
        stringAttribute: {
            "type":"String",
            "name": "Name",
            "value": "Volume1"
        },
        stringKey: "volName",
        integerAttribute: {
            "type":"Integer",
            "name": "Stripe Count",
            "value": 3
        },
        integerKey: "stripe_count",
        booleanAttribute: {
            "type":"Boolean",
            "name": "Force"
        },
        booleanKey: "force",
        listAttribute: {
            "type":"List",
            "name": "Brick Details"
        },
        listKey: "brickdetails",
        listOptions: [{
            "fqdn": "dhcp10-10.abc.com",
            "machine_id": "a34kjsl3545l451d9962",
            "node_id": "3038c577-a8a1ab534b0bc4"
        },{
            "fqdn": "dhcp10-11.abc.com",
            "machine_id": "a34kjsl3545l451d9452",
            "node_id": "3038c577-a8a1ab534b0a2"
        }]
    });

    testDataModule.value("importCluster", {
        generateFlows: [
            {
                "name": "GlusterImportCluster",
                "method": "POST",
                "attributes": [
                    {
                        "name": "Node[]",
                        "type": "List",
                        "required": true
                    },
                    {
                        "help": "Name of the Tendrl managed sds, eg: 'gluster'",
                        "type": "String",
                        "name": "sds_name",
                        "required": true
                    },
                    {
                        "help": "Version of the Tendrl managed sds, eg: '3.2.1'",
                        "type": "String",
                        "name": "sds_version",
                        "required": true
                    }
                ]
            },
            {
                "name": "CephImportCluster",
                "method": "POST",
                "attributes": [
                    {
                        "name": "Node[]",
                        "type": "List",
                        "required": true
                    },
                    {
                        "help": "Name of the Tendrl managed sds, eg: 'gluster'",
                        "type": "String",
                        "name": "sds_name",
                        "required": false
                    }
                ]
            }

        ],
        flowInfo: {
            "name": "CephImportCluster",
            "method": "POST",
            "attributes": [
                {
                    "name": "Node[]",
                    "type": "List",
                    "required": true
                },
                {
                    "help": "Name of the Tendrl managed sds, eg: 'gluster'",
                    "type": "String",
                    "name": "sds_name",
                    "required": false
                }
            ]
        },
        attributes: [{
                "name": "Node[]",
                "type": "List",
                "required": true
            }, {
                "help": "Name of the Tendrl managed sds, eg: 'gluster'",
                "type": "String",
                "name": "sds_name",
                "required": false
            }]
    });

    testDataModule.value("utilsMockResponse", {
        objectFlows: [{
            "name": "GlusterImportCluster",
            "method": "POST",
            "attributes": [{
                "name": "Node[]",
                "type": "List",
                "required": true
            }, {
                "help": "Name of the Tendrl managed sds, eg: 'gluster'",
                "type": "String",
                "name": "sds_name",
                "required": true
            }, {
                "help": "Version of the Tendrl managed sds, eg: '3.2.1'",
                "type": "String",
                "name": "sds_version",
                "required": true
            }]
        }, {
            "name": "CephImportCluster",
            "method": "POST",
            "attributes": [{
                "name": "Node[]",
                "type": "List",
                "required": true
            }, {
                "help": "Name of the Tendrl managed sds, eg: 'gluster'",
                "type": "String",
                "name": "sds_name",
                "required": false
            }]
        }],
        objectList: [{
            "fqdn": "dhcp10-10.abc.com",
            "machine_id": "a34kjsl3545l451d9962",
            "node_id": "3038c577-a8a1ab534b0bc4"
        },{
            "fqdn": "dhcp10-11.abc.com",
            "machine_id": "a34kjsl3545l451d9452",
            "node_id": "3038c577-a8a1ab534b0a2"
        }]
    });

    testDataModule.value("createVolume", {
        attributes: [{
                "name": "vol_name",
                "type": "String",
                "required": true
            }, {
                "name": "stripe_count",
                "type": "Integer",
                "required": false
            }, {
                "name": "Brick[]",
                "type": "List",
                "required": true
            }, {
                "name":"replica_count",
                "type": "Integer",
                "required": true
        }],
        actionDetails: {
            "actionName": "create",
            "action": {
                "method" : "POST",
                "url": "http://10.70.7.196:8080/api/actions.json"
            }
        },
        requestData: {
            clusterId: "3969b68f-e927-45da-84d6-004c67974f07",
            inventoryName: "volume"
        }
    });

})();