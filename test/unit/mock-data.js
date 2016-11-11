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
                "node_uuid": "279-78774-782",
                "fqdn": "dhcp-10.30.40.30-abx"
            },{
                "node_uuid": "279-78974-782",
                "fqdn": "dhcp-10.30.40.50-abx"
            },{
                "node_uuid": "279-78374-782",
                "fqdn": "dhcp-10.30.40.80-abx"
            }]
        }); 
})();