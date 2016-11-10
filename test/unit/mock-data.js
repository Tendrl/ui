(function () {

     var testDataModule = angular.module("TestDataModule", []);

     testDataModule.value("generateForm", {
          formAttributes: {
                volName: {
                    "type":"String",
                    "name": "Name",
                    "value": "Volume1"
                },
                stripe_count:{
                    "type":"Integer",
                    "name": "Stripe Count",
                    "value": 3
                },
                replica_count:{
                    "type":"Integer",
                    "name": "Replica Count",
                    "value": 4
                }
            },
            manipulatedData: {
                volName: "Volume1",
                stripe_count: 3,
                replica_count: 4
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
                "type":"Brick[]",
                "name": "Brick Details"
            },
            listKey: "brickdetails",
            listOptions: {
                "data": [{
                    "name": "brick1",
                    "value": "brick1"
                },{
                    "name": "brick2",
                    "value": "brick2"
                }, {
                    "name": "brick3",
                    "value": "brick3"
                }]
            }

        }); 
})();