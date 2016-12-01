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

    testDataModule.value("nodeList", {
        list: [
            {
                "fqdn":"dhcp41-176.domain.com",
                "machine_id":"856b3135989b47a99bd99100c0d0d87e",
                "node_id":"c6b9df01-1c73-42f9-93bc-0ccc21005984"
            },
            {
                "fqdn":"dhcp43-2.domain.com",
                "machine_id":"3ebd5baa44014e4a9b74cada7cdf712d",
                "node_id":"5cb04cdd-d2d8-4a92-965d-27af9b648ce5"
            },
            {
                "fqdn":"dhcp43-189.domain.com",
                "machine_id":"a2e4163a1a8e4b28afb1a17e6a1d9962",
                "node_id":"3038c577-b233-4513-926d-a8a1ac63b0a3"
            },
            {
                "fqdn":"dhcp42-98.domain.com",
                "machine_id":"3a56e73867414b4bb2fb08173c66eea9",
                "node_id":"7a880068-bf5e-465f-a083-0c23aeaf30f4"
            },
            {
                "fqdn":"dhcp41-229.domain.com",
                "machine_id":"a4d53abc5f3b47778b5d349c814bc609",
                "node_id":"027db80d-eee9-40b6-8e59-8c81b80aa655"
            },
            {
                "fqdn":"dhcp41-178.domain.com",
                "machine_id":"0c0edb7a7b594db9b7d3b051d2a4d1bd",
                "node_id":"9847aeef-a47c-4737-8a1e-059b9ebeafe9"
            }
        ]
    });

    testDataModule.value("clusterList", {
        list: [
            {
                "sds_name":"gluster",
                "sds_version":"3.9rc1",
                "cluster_id":"49f878e3-e253-4fad-a947-cb987bba503d"
            },
            {
                "sds_name":"ceph",
                "sds_version":"10.2.3",
                "cluster_id":"8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3"
            },
            {
                "sds_name":"ceph",
                "sds_version":"10.2.3",
                "cluster_id":"8bec7519-f781-47f7-86eb-657e7e194b59"
            }
        ]
    });

})();