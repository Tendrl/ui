(function() {

    var testDataModule = angular.module("TestDataModule", []);

    testDataModule.value("globalTaskDetail", {
        clusterList: [{
            "integrationId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "sdsVersion": "3.8.4",
            "sdsName": "gluster",
            "name": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "isProfilingEnabled": "Disabled",
            "managed": "Yes",
            "importStatus": "done",
            "status": "HEALTH_OK",
            "statusIcon": "Healthy",
            "jobType": "ExpandClusterWithDetectedPeers",
            "currentStatus": "in_progress",
            "importTaskId": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            "volCount": "1",
            "alertCount": "0",
            "errors": [],
            "message": "Ready to Use",
            "clusterId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "hosts": [{
                "nodeId": "fc12302b-0025-467e-bf43-0f64d8217d21",
                "fqdn": "dhcp43-19.lab.eng.blr.redhat.com",
                "status": "DOWN",
                "role": "Monitor",
                "release": "gluster"
            }, {
                "nodeId": "f120a3f2-052a-4028-8fb2-7dddb310fec3",
                "fqdn": "dhcp43-27.lab.eng.blr.redhat.com",
                "status": "UP",
                "role": "Gluster Peer",
                "release": "gluster"
            }]
        }],
        jobDetail: [{
            "created_at": "2018-03-27T12:45:00Z",
            "errors": "",
            "flow": "ImportCluster",
            "job_id": "d58dddfb-7789-46e0-970e-2d214f7ecbef",
            "logs": [{
                "type": "info",
                "message": "Running Flow tendrl.flows.ImportCluster",
                "date": "2018-03-26T04:20:55.053436+00:00"
            }, {
                "type": "error",
                "message": "Checking if nodes are up",
                "date": "2018-03-26T04:20:55.869654+00:00"
            }, {
                "type": "warning",
                "message": "Status of nodes are up",
                "date": "2018-03-26T04:20:56.066137+00:00"
            }],
            "messages_url": "/jobs/d58dddfb-7789-46e0-970e-2d214f7ecbef/messages",
            "output_url": "/jobs/d58dddfb-7789-46e0-970e-2d214f7ecbef/output",
            "parameters": {
                "TendrlContext.integration_id": "48445a94-7288-4148-bc4f-a99a86baccb8",
                "Cluster.volume_profiling_flag": "leave-as-is"
            },
            "status": "new",
            "status_url": "/jobs/d58dddfb-7789-46e0-970e-2d214f7ecbef/status",
            "updated_at": "2018-03-27 12:45:02.202100+00:00"
        }],
        logs: [{
                "type": "info",
                "message": "Running Flow tendrl.flows.ImportCluster",
                "date": "2018-03-26T04:20:55.053436+00:00"
            }, {
                "type": "error",
                "message": "Checking if nodes are up",
                "date": "2018-03-26T04:20:55.869654+00:00"
            }, {
                "type": "warning",
                "message": "Status of nodes are up",
                "date": "2018-03-26T04:20:56.066137+00:00"
            }],

        status: "new"
    });

    testDataModule.value("userList", {
        users: [{
            "username": "user1",
            "name": "Steve bob",
            "status": "enabled",
            "role": "read-only",
            "notification": "true",
            "email": "steve@gmail.com"
        }, {
            "username": "user2",
            "name": "Alexandar kave",
            "status": "disabled",
            "role": "normal",
            "notification": "false",
            "email": "kave@gmail.com"
        }],
        fields: [{
            id: "username",
            title: "User ID",
            placeholder: "Filter by User ID",
            filterType: "text"
        }, {
            id: "name",
            title: "Name",
            placeholder: "Filter by Name",
            filterType: "text"
        }, {
            id: "role",
            title: "Role",
            placeholder: "Filter by Role",
            filterType: "text"
        }],
        editUserResponse: [{
            "username": "user1",
            "name": "Steve bob",
            "status": "true",
            "role": "admin",
            "email_notifications": "true",
            "email": "steve@gmail.com"
        }],
        filteredUsernameFormattedOutput: [{
            "username": "user1",
            "name": "Steve bob",
            "status": "enabled",
            "role": "read-only",
            "notification": "true",
            "email": "steve@gmail.com"
        }],
        filteredNameFormattedOutput: [{
            "username": "user1",
            "name": "Steve bob",
            "status": "enabled",
            "role": "read-only",
            "notification": "true",
            "email": "steve@gmail.com"
        }],
        filteredRoleFormattedOutput: [{
            "username": "user2",
            "name": "Alexandar kave",
            "status": "disabled",
            "role": "normal",
            "notification": "false",
            "email": "kave@gmail.com"
        }]
    });

    testDataModule.value("taskList", {
        jobs: [{
            "createdAt": "2018-01-15T08:31:42Z",
            "errors": "",
            "flow": "ImportCluster",
            "jobId": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            "messagesUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
            "outputUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
            "parameters": {
                "Cluster.enable_volume_profiling": "no",
                "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "enable_volume_profiling": "no"
            },
            "status": "Completed",
            "statusUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
            "updatedAt": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }, {
            "createdAt": "2018-01-20T08:31:42Z",
            "errors": "",
            "flow": "ImportCluster",
            "jobId": "faf62e32-3929-4d3d-9cbc-9a83587b533c",
            "messagesUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
            "outputUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
            "parameters": {
                "Cluster.enable_volume_profiling": "no",
                "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "enable_volume_profiling": "no"
            },
            "status": "Failed",
            "statusUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
            "updatedAt": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }],
        formattedJobs: [{
            "createdAt": "2018-01-15T08:31:42Z",
            "errors": "",
            "flow": "ImportCluster",
            "jobId": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            "messagesUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
            "outputUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
            "parameters": {
                "Cluster.enable_volume_profiling": "no",
                "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "enable_volume_profiling": "no"
            },
            "status": "Completed",
            "statusUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
            "updatedAt": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }, {
            "createdAt": "2018-01-20T08:31:42Z",
            "errors": "",
            "flow": "ImportCluster",
            "jobId": "faf62e32-3929-4d3d-9cbc-9a83587b533c",
            "messagesUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
            "outputUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
            "parameters": {
                "Cluster.enable_volume_profiling": "no",
                "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "enable_volume_profiling": "no"
            },
            "status": "Failed",
            "statusUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
            "updatedAt": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }],
        filteredTaskIdFormattedOutput: [{
            "createdAt": "2018-01-15T08:31:42Z",
            "errors": "",
            "flow": "ImportCluster",
            "jobId": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            "messagesUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
            "outputUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
            "parameters": {
                "Cluster.enable_volume_profiling": "no",
                "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "enable_volume_profiling": "no"
            },
            "status": "Completed",
            "statusUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
            "updatedAt": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }],
        filteredFlowFormattedOutput: [{
            "createdAt": "2018-01-15T08:31:42Z",
            "errors": "",
            "flow": "ImportCluster",
            "jobId": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            "messagesUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
            "outputUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
            "parameters": {
                "Cluster.enable_volume_profiling": "no",
                "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "enable_volume_profiling": "no"
            },
            "status": "Completed",
            "statusUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
            "updatedAt": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }, {
            "createdAt": "2018-01-20T08:31:42Z",
            "errors": "",
            "flow": "ImportCluster",
            "jobId": "faf62e32-3929-4d3d-9cbc-9a83587b533c",
            "messagesUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
            "outputUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
            "parameters": {
                "Cluster.enable_volume_profiling": "no",
                "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "enable_volume_profiling": "no"
            },
            "status": "Failed",
            "statusUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
            "updatedAt": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }],
        filteredStatusFormattedOutput: [{
            "createdAt": "2018-01-20T08:31:42Z",
            "errors": "",
            "flow": "ImportCluster",
            "jobId": "faf62e32-3929-4d3d-9cbc-9a83587b533c",
            "messagesUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
            "outputUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
            "parameters": {
                "Cluster.enable_volume_profiling": "no",
                "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "enable_volume_profiling": "no"
            },
            "status": "Failed",
            "statusUrl": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
            "updatedAt": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }],
        integrationId: "f755f0cd-b784-4920-83c3-db9d576d5935",
        date: {
            fromDate: "",
            toDate: "",
        }
    });

    testDataModule.value("clusterList", {
        clusters: [{
            "sds_name": "gluster",
            "cluster_name": "gluster-6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625",
            "cluster_id": "e372c01c-5022-41ce-9412-e96038bca305",
            "integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
            "hash": "7daaa1782714800cd5c0ab4607d1d09f",
            "sds_version": "3.4.4",
            "updated_at": "2018-01-15 08:20:04.985731+00:00",
            "errors": [],
            "import_job_id": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            "globaldetails": {
                "connection_count": "0",
                "status": "healthy",
                "connection_active": "0",
                "volume_up_degraded": "0",
                "peer_count": "3",
                "updated_at": "2018-01-29 05:01:50.455207+00:00",
                "vol_count": "1",
                "hash": "783ee5e5058b339b21c3fb2bd91ed4ea"
            },
            "public_network": "",
            "cluster_network": "",
            "is_managed": "yes",
            "enable_volume_profiling": "no",
            "import_status": "done",
            "alert_counters": {
                "integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "hash": "4cd600e2a84b9e0d04cab38b4c08a349",
                "warning_count": "0",
                "updated_at": "2018-01-15 08:32:49.551560+00:00"
            },
            "nodes": [{
                "hash": "b97976b230d125cb160cfefd4fe20cff",
                "tags": ["tendrl/integration/gluster", "gluster/server", "tendrl/integration/e372c01c-5022-41ce-9412-e96038bca305", "tendrl/node_3d2b015c-08c7-440d-b9af-23aeb4c17f9f", "detected_cluster/6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625", "tendrl/node"],
                "sync_status": "done",
                "fqdn": "dhcp43-237.lab.eng.blr.redhat.com",
                "updated_at": "2018-01-29 05:01:42.855664+00:00",
                "node_id": "3d2b015c-08c7-440d-b9af-23aeb4c17f9f",
                "last_sync": "2018-01-29 05:01:42.817907+00:00",
                "status": "UP",
                "node_id": "3d2b015c-08c7-440d-b9af-23aeb4c17f9f"
            }, {
                "updated_at": "2018-01-29 05:01:11.901789+00:00",
                "node_id": "5083d729-d666-47ac-a83c-3b6373f73ff2",
                "last_sync": "2018-01-29 05:01:11.861982+00:00",
                "status": "UP",
                "hash": "c337a69aeec0e0a3e0d3216b9d6ca7c2",
                "tags": ["tendrl/integration/gluster", "gluster/server", "tendrl/node_5083d729-d666-47ac-a83c-3b6373f73ff2", "tendrl/integration/e372c01c-5022-41ce-9412-e96038bca305", "detected_cluster/6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625", "tendrl/node"],
                "sync_status": "done",
                "fqdn": "dhcp43-238.lab.eng.blr.redhat.com",
                "node_id": "5083d729-d666-47ac-a83c-3b6373f73ff2"
            }, {
                "tags": ["tendrl/node_d7fd2f04-b829-4d7b-98b3-2fccdace918d", "tendrl/integration/gluster", "gluster/server", "provisioner/e372c01c-5022-41ce-9412-e96038bca305", "tendrl/integration/e372c01c-5022-41ce-9412-e96038bca305", "detected_cluster/6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625", "tendrl/node"],
                "sync_status": "done",
                "fqdn": "dhcp43-232.lab.eng.blr.redhat.com",
                "updated_at": "2018-01-29 05:01:52.907422+00:00",
                "node_id": "d7fd2f04-b829-4d7b-98b3-2fccdace918d",
                "last_sync": "2018-01-29 05:01:52.864539+00:00",
                "status": "UP",
                "hash": "94ea3e80ff6a26e69f193eb8d15aedcc",
                "node_id": "d7fd2f04-b829-4d7b-98b3-2fccdace918d"
            }]
        }, {
            "integration_id": "f755f0cd-b784-4920-83c3-db9d576d5935",
            "hash": "80f10a7832bfc834f34c41aeb483a22c",
            "sds_version": "3.8.4",
            "updated_at": "2018-01-16 12:38:20.223805+00:00",
            "sds_name": "gluster",
            "cluster_name": "gluster-b9e05aebda5839ae1ed4c15122e32927df8cc6479a702ff70bbe0ed7cc702798",
            "cluster_id": "f755f0cd-b784-4920-83c3-db9d576d5935",
            "errors": [],
            "public_network": "",
            "cluster_network": "",
            "is_managed": "no",
            "enable_volume_profiling": "yes",
            "import_status": "",
            "import_job_id": "",
            "nodes": [{
                "sync_status": "done",
                "fqdn": "dhcp43-226.lab.eng.blr.redhat.com",
                "updated_at": "2018-01-29 05:01:49.227134+00:00",
                "node_id": "307a15fa-9460-4679-8aee-c58e9a119a7e",
                "last_sync": "2018-01-29 05:01:49.189015+00:00",
                "status": "UP",
                "hash": "c36196b062045eaf5e930d2dd05e1852",
                "tags": ["tendrl/integration/f755f0cd-b784-4920-83c3-db9d576d5935", "detected_cluster/b9e05aebda5839ae1ed4c15122e32927df8cc6479a702ff70bbe0ed7cc702798", "gluster/server", "tendrl/server", "tendrl/node_307a15fa-9460-4679-8aee-c58e9a119a7e", "tendrl/monitor", "tendrl/node"],
                "node_id": "307a15fa-9460-4679-8aee-c58e9a119a7e"
            }, {
                "fqdn": "dhcp43-143.lab.eng.blr.redhat.com",
                "updated_at": "2018-01-29 05:01:44.115734+00:00",
                "node_id": "338a58f6-d5a9-4e61-8ab9-1e3c51b4218f",
                "last_sync": "2018-01-29 05:01:44.066744+00:00",
                "status": "UP",
                "hash": "c5ed0a7ec56d4bdb3ae79b4698922ec7",
                "tags": ["tendrl/integration/f755f0cd-b784-4920-83c3-db9d576d5935", "detected_cluster/b9e05aebda5839ae1ed4c15122e32927df8cc6479a702ff70bbe0ed7cc702798", "tendrl/node_338a58f6-d5a9-4e61-8ab9-1e3c51b4218f", "gluster/server", "tendrl/node"],
                "sync_status": "done",
                "node_id": "338a58f6-d5a9-4e61-8ab9-1e3c51b4218f"
            }]
        }],
        formattedOutput: [{
            integrationId: "e372c01c-5022-41ce-9412-e96038bca305",
            sdsVersion: "3.4.4",
            sdsName: "gluster",
            name: "e372c01c-5022-41ce-9412-e96038bca305",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Disabled",
            managed: "Yes",
            importStatus: "done",
            status: "HEALTH_OK",
            statusIcon: "Healthy",
            importTaskId: "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            volCount: 1,
            alertCount: 0,
            errors: [],
            message: "Ready to Use",
            clusterId: "e372c01c-5022-41ce-9412-e96038bca305",
            hosts: [{
                nodeId: "3d2b015c-08c7-440d-b9af-23aeb4c17f9f",
                fqdn: "dhcp43-237.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "5083d729-d666-47ac-a83c-3b6373f73ff2",
                fqdn: "dhcp43-238.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "d7fd2f04-b829-4d7b-98b3-2fccdace918d",
                fqdn: "dhcp43-232.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }]
        }, {
            integrationId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "f755f0cd-b784-4920-83c3-db9d576d5935",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Enabled",
            managed: "No",
            importStatus: "",
            importTaskId: "",
            volCount: 0,
            alertCount: 0,
            errors: [],
            message: "Ready to Import",
            clusterId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            hosts: [{
                nodeId: "307a15fa-9460-4679-8aee-c58e9a119a7e",
                fqdn: "dhcp43-226.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "338a58f6-d5a9-4e61-8ab9-1e3c51b4218f",
                fqdn: "dhcp43-143.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }]
        }],
        sortedformattedOutputName: [{
            integrationId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "f755f0cd-b784-4920-83c3-db9d576d5935",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Enabled",
            managed: "No",
            importStatus: "",
            importTaskId: "",
            volCount: 0,
            alertCount: 0,
            errors: [],
            message: "Ready to Import",
            clusterId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            hosts: [{
                nodeId: "307a15fa-9460-4679-8aee-c58e9a119a7e",
                fqdn: "dhcp43-226.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "338a58f6-d5a9-4e61-8ab9-1e3c51b4218f",
                fqdn: "dhcp43-143.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }],
            status: "unmanaged"
        }, {
            integrationId: "e372c01c-5022-41ce-9412-e96038bca305",
            sdsVersion: "3.4.4",
            sdsName: "gluster",
            name: "e372c01c-5022-41ce-9412-e96038bca305",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Disabled",
            managed: "Yes",
            importStatus: "done",
            importTaskId: "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            volCount: 1,
            alertCount: 0,
            status: "HEALTH_OK",
            statusIcon: "Healthy",
            errors: [],
            message: "Ready to Use",
            clusterId: "e372c01c-5022-41ce-9412-e96038bca305",
            hosts: [{
                nodeId: "3d2b015c-08c7-440d-b9af-23aeb4c17f9f",
                fqdn: "dhcp43-237.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "5083d729-d666-47ac-a83c-3b6373f73ff2",
                fqdn: "dhcp43-238.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "d7fd2f04-b829-4d7b-98b3-2fccdace918d",
                fqdn: "dhcp43-232.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }]
        }],
        profileStatus: [{
            enabled: "Enabled",
            disabled: "Disabled",
            mixed: "Mixed"
        }],
        sortedformattedOutputSds: [{
            integrationId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "f755f0cd-b784-4920-83c3-db9d576d5935",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Enabled",
            managed: "No",
            importStatus: "",
            importTaskId: "",
            volCount: 0,
            alertCount: 0,
            errors: [],
            message: "Ready to Import",
            clusterId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            hosts: [{
                nodeId: "307a15fa-9460-4679-8aee-c58e9a119a7e",
                fqdn: "dhcp43-226.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "338a58f6-d5a9-4e61-8ab9-1e3c51b4218f",
                fqdn: "dhcp43-143.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }],
            status: "unmanaged"
        }, {
            integrationId: "e372c01c-5022-41ce-9412-e96038bca305",
            sdsVersion: "3.4.4",
            sdsName: "gluster",
            name: "e372c01c-5022-41ce-9412-e96038bca305",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Disabled",
            managed: "Yes",
            importStatus: "done",
            importTaskId: "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            volCount: 1,
            alertCount: 0,
            status: "HEALTH_OK",
            statusIcon: "Healthy",
            errors: [],
            message: "Ready to Use",
            clusterId: "e372c01c-5022-41ce-9412-e96038bca305",
            hosts: [{
                nodeId: "3d2b015c-08c7-440d-b9af-23aeb4c17f9f",
                fqdn: "dhcp43-237.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "5083d729-d666-47ac-a83c-3b6373f73ff2",
                fqdn: "dhcp43-238.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "d7fd2f04-b829-4d7b-98b3-2fccdace918d",
                fqdn: "dhcp43-232.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }]
        }],
        sortedformattedOutputStatus: [{
            integrationId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "f755f0cd-b784-4920-83c3-db9d576d5935",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Enabled",
            managed: "No",
            importStatus: "",
            importTaskId: "",
            volCount: 0,
            alertCount: 0,
            errors: [],
            message: "Ready to Import",
            clusterId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            hosts: [{
                nodeId: "307a15fa-9460-4679-8aee-c58e9a119a7e",
                fqdn: "dhcp43-226.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "338a58f6-d5a9-4e61-8ab9-1e3c51b4218f",
                fqdn: "dhcp43-143.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }],
            status: "unmanaged"
        }, {
            integrationId: "e372c01c-5022-41ce-9412-e96038bca305",
            sdsVersion: "3.4.4",
            sdsName: "gluster",
            name: "e372c01c-5022-41ce-9412-e96038bca305",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Disabled",
            managed: "Yes",
            importStatus: "done",
            importTaskId: "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            volCount: 1,
            alertCount: 0,
            status: "HEALTH_OK",
            statusIcon: "Healthy",
            errors: [],
            message: "Ready to Use",
            clusterId: "e372c01c-5022-41ce-9412-e96038bca305",
            hosts: [{
                nodeId: "3d2b015c-08c7-440d-b9af-23aeb4c17f9f",
                fqdn: "dhcp43-237.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "5083d729-d666-47ac-a83c-3b6373f73ff2",
                fqdn: "dhcp43-238.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "d7fd2f04-b829-4d7b-98b3-2fccdace918d",
                fqdn: "dhcp43-232.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }]
        }],
        sortedformattedOutputManaged: [{
            integrationId: "e372c01c-5022-41ce-9412-e96038bca305",
            sdsVersion: "3.4.4",
            sdsName: "gluster",
            name: "e372c01c-5022-41ce-9412-e96038bca305",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Disabled",
            managed: "Yes",
            importStatus: "done",
            importTaskId: "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            volCount: 1,
            alertCount: 0,
            status: "HEALTH_OK",
            statusIcon: "Healthy",
            errors: [],
            message: "Ready to Use",
            clusterId: "e372c01c-5022-41ce-9412-e96038bca305",
            hosts: [{
                nodeId: "3d2b015c-08c7-440d-b9af-23aeb4c17f9f",
                fqdn: "dhcp43-237.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "5083d729-d666-47ac-a83c-3b6373f73ff2",
                fqdn: "dhcp43-238.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "d7fd2f04-b829-4d7b-98b3-2fccdace918d",
                fqdn: "dhcp43-232.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }]
        }, {
            integrationId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "f755f0cd-b784-4920-83c3-db9d576d5935",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Enabled",
            managed: "No",
            importStatus: "",
            importTaskId: "",
            volCount: 0,
            alertCount: 0,
            errors: [],
            message: "Ready to Import",
            clusterId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            hosts: [{
                nodeId: "307a15fa-9460-4679-8aee-c58e9a119a7e",
                fqdn: "dhcp43-226.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "338a58f6-d5a9-4e61-8ab9-1e3c51b4218f",
                fqdn: "dhcp43-143.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }],
            status: "unmanaged"
        }],
        filteredNameFormattedOutput: [{
            integrationId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "f755f0cd-b784-4920-83c3-db9d576d5935",
            currentTaskId: "01c-5022-41ce-9412-e96038bca305",
            isProfilingEnabled: "Enabled",
            managed: "No",
            importStatus: "",
            importTaskId: "",
            volCount: 0,
            alertCount: 0,
            errors: [],
            message: "Ready to Import",
            clusterId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            hosts: [{
                nodeId: "307a15fa-9460-4679-8aee-c58e9a119a7e",
                fqdn: "dhcp43-226.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }, {
                nodeId: "338a58f6-d5a9-4e61-8ab9-1e3c51b4218f",
                fqdn: "dhcp43-143.lab.eng.blr.redhat.com",
                status: "UP",
                role: "Gluster Peer",
                release: "gluster"
            }],
            status: "unmanaged"
        }],
        fields: [{
            id: "name",
            title: "Name",
            sortType: "alpha"
        }, {
            id: "status",
            title: "Status",
            sortType: "alpha"
        }, {
            id: "sdsVersion",
            title: "Cluster Version",
            sortType: "alpha"
        }, {
            id: "managed",
            title: "Managed",
            sortType: "alpha"
        }],
        filterFields: [{
            id: "name",
            title: "Name",
            placeholder: "Filter by Name",
            filterType: "text"
        }, {
            id: "",
            title: "",
            placeholder: "",
            filterType: ""
        }],
        profilingResponse: {
            "volume_profiling_state": "enabled",
            "updated_at": "2018-01-15 08:20:04.985731+00:00",
            "sds_name": "gluster",
            "cluster_name": "gluster-6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625",
            "cluster_id": "e372c01c-5022-41ce-9412-e96038bca305",
            "integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
            "hash": "7daaa1782714800cd5c0ab4607d1d09f",
            "sds_version": "3.8.4",
            "errors": [],
            "globaldetails": {
                "peer_count": "3",
                "updated_at": "2018-01-30 07:09:18.023234+00:00",
                "vol_count": "1",
                "hash": "98ee577c4ddea839fe535874ed421ad2",
                "connection_count": "0",
                "status": "unhealthy",
                "connection_active": "0",
                "volume_up_degraded": "0"
            },
            "public_network": "",
            "cluster_network": "",
            "is_managed": "yes",
            "enable_volume_profiling": "yes",
            "import_status": "done",
            "import_job_id": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            "alert_counters": {
                "warning_count": "3",
                "updated_at": "2018-01-29 06:44:03.454402+00:00",
                "integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
                "hash": "f3ed56d00f83eb251c719911aedcd1d4"
            },
            "nodes": [{
                "updated_at": "2018-01-30 07:09:42.951119+00:00",
                "node_id": "3d2b015c-08c7-440d-b9af-23aeb4c17f9f",
                "last_sync": "2018-01-30 07:09:42.912923+00:00",
                "status": "UP",
                "hash": "8c78ab40f5ab575e8b53fb4c206581b6",
                "tags": ["tendrl/integration/gluster", "gluster/server", "tendrl/integration/e372c01c-5022-41ce-9412-e96038bca305", "tendrl/node_3d2b015c-08c7-440d-b9af-23aeb4c17f9f", "detected_cluster/6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625", "tendrl/node"],
                "sync_status": "done",
                "fqdn": "dhcp43-237.lab.eng.blr.redhat.com",
                "node_id": "3d2b015c-08c7-440d-b9af-23aeb4c17f9f"
            }, {
                "fqdn": "dhcp43-238.lab.eng.blr.redhat.com",
                "updated_at": "2018-01-29 06:39:17.381534+00:00",
                "node_id": "5083d729-d666-47ac-a83c-3b6373f73ff2",
                "last_sync": "2018-01-29 06:38:17.222975+00:00",
                "hash": "cafaefbb3798e9989d86e8bbefba22f1",
                "tags": ["tendrl/integration/gluster", "gluster/server", "tendrl/node_5083d729-d666-47ac-a83c-3b6373f73ff2", "tendrl/integration/e372c01c-5022-41ce-9412-e96038bca305", "detected_cluster/6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625", "tendrl/node"],
                "sync_status": "in_progress",
                "status": "DOWN",
                "node_id": "5083d729-d666-47ac-a83c-3b6373f73ff2"
            }, {
                "last_sync": "2018-01-30 07:09:11.299674+00:00",
                "status": "UP",
                "hash": "d43badd4fea0599df7c800b4e1efdab7",
                "tags": ["tendrl/node_d7fd2f04-b829-4d7b-98b3-2fccdace918d", "tendrl/integration/gluster", "gluster/server", "provisioner/e372c01c-5022-41ce-9412-e96038bca305", "tendrl/integration/e372c01c-5022-41ce-9412-e96038bca305", "detected_cluster/6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625", "tendrl/node"],
                "sync_status": "done",
                "fqdn": "dhcp43-232.lab.eng.blr.redhat.com",
                "updated_at": "2018-01-30 07:09:11.343364+00:00",
                "node_id": "d7fd2f04-b829-4d7b-98b3-2fccdace918d",
                "node_id": "d7fd2f04-b829-4d7b-98b3-2fccdace918d"
            }]
        }
    });

    testDataModule.value("volumeList", {
        volumes: [{
            "status": "Started",
            "rebalStatus": "not_started",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Enabled",
            "type": "Replicated",
            "volumeId": "3c4b48cc-1a61-4c64-90d6-eba840c00081",
            "alertCount": "0",
            "name": "vol1",
            "currentTask": "{}"
        }, {
            "status": "Stopped",
            "rebalStatus": "completed",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Pending",
            "type": "Distribute",
            "volumeId": "3d0fd8d44-4b93-46fb-b4ed-e5e5a390eca8",
            "alertCount": "0",
            "name": "vol2",
            "currentTask": { "status": "in_progress", "job_id": "f508cc8a-e037-4af0-bcbe-54735cc1692f", "job_name": "StartProfiling" }
        }],
        sortFields: [{
            id: "name",
            title: "Name",
            sortType: "alpha"
        }, {
            id: "status",
            title: "Status",
            sortType: "alpha"
        }],
        filterFields: [{
            id: "name",
            title: "Name",
            placeholder: "Filter by Name",
            filterType: "text"
        }, {
            id: "status",
            title: "Status",
            placeholder: "Filter by Status",
            filterType: "select",
            filterValues: ["Started", "Stopped"]
        }, {
            id: "type",
            title: "Type",
            placeholder: "Filter by Type",
            filterType: "select",
            filterValues: ["Distribute", "Replicated", "Dispersed", "Distributed-Dispersed"]
        }],
        profilingResponse: { "job_id": "f508cc8a-e037-4af0-bcbe-54735cc1692f" },
        sortedformattedOutputName: [{
            "status": "Stopped",
            "rebalStatus": "completed",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Pending",
            "type": "Distribute",
            "volumeId": "3d0fd8d44-4b93-46fb-b4ed-e5e5a390eca8",
            "alertCount": "0",
            "name": "vol2",
            "currentTask": { "status": "in_progress", "job_id": "f508cc8a-e037-4af0-bcbe-54735cc1692f", "job_name": "StartProfiling" }
        }, {
            "status": "Started",
            "rebalStatus": "not_started",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Enabled",
            "type": "Replicated",
            "volumeId": "3c4b48cc-1a61-4c64-90d6-eba840c00081",
            "alertCount": "0",
            "name": "vol1",
            "currentTask": "{}"
        }],
        sortedformattedOutputStatus: [{
            "status": "Stopped",
            "rebalStatus": "completed",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Pending",
            "type": "Distribute",
            "volumeId": "3d0fd8d44-4b93-46fb-b4ed-e5e5a390eca8",
            "alertCount": "0",
            "name": "vol2",
            "currentTask": { "status": "in_progress", "job_id": "f508cc8a-e037-4af0-bcbe-54735cc1692f", "job_name": "StartProfiling" }
        }, {
            "status": "Started",
            "rebalStatus": "not_started",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Enabled",
            "type": "Replicated",
            "volumeId": "3c4b48cc-1a61-4c64-90d6-eba840c00081",
            "alertCount": "0",
            "name": "vol1",
            "currentTask": "{}"
        }],
        filteredNameFormattedOutput: [{
            "status": "Stopped",
            "rebalStatus": "completed",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Pending",
            "type": "Distribute",
            "volumeId": "3d0fd8d44-4b93-46fb-b4ed-e5e5a390eca8",
            "alertCount": "0",
            "name": "vol2",
            "currentTask": { "status": "in_progress", "job_id": "f508cc8a-e037-4af0-bcbe-54735cc1692f", "job_name": "StartProfiling" }
        }],
        filteredStatusFormattedOutput: [{
            "status": "Started",
            "rebalStatus": "not_started",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Enabled",
            "type": "Replicated",
            "volumeId": "3c4b48cc-1a61-4c64-90d6-eba840c00081",
            "alertCount": "0",
            "name": "vol1",
            "currentTask": "{}"
        }],
        filteredTypeFormattedOutput: [{
            "status": "Stopped",
            "rebalStatus": "completed",
            "brickCount": "4",
            "deleted": "False",
            "profileStatus": "Pending",
            "type": "Distribute",
            "volumeId": "3d0fd8d44-4b93-46fb-b4ed-e5e5a390eca8",
            "alertCount": "0",
            "name": "vol2",
            "currentTask": { "status": "in_progress", "job_id": "f508cc8a-e037-4af0-bcbe-54735cc1692f", "job_name": "StartProfiling" }
        }]
    })

    testDataModule.value("hostList", {
        clusterList: [{
            "integrationId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "sdsVersion": "3.8.4",
            "sdsName": "gluster",
            "name": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "isProfilingEnabled": "Disabled",
            "managed": "Yes",
            "importStatus": "done",
            "status": "HEALTH_OK",
            "statusIcon": "Healthy",
            "jobType": "ExpandClusterWithDetectedPeers",
            "currentStatus": "in_progress",
            "importTaskId": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
            "volCount": "1",
            "alertCount": "0",
            "errors": [],
            "message": "Ready to Use",
            "clusterId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "hosts": [{
                "nodeId": "fc12302b-0025-467e-bf43-0f64d8217d21",
                "fqdn": "dhcp43-19.lab.eng.blr.redhat.com",
                "status": "DOWN",
                "role": "Monitor",
                "release": "gluster"
            }, {
                "nodeId": "f120a3f2-052a-4028-8fb2-7dddb310fec3",
                "fqdn": "dhcp43-27.lab.eng.blr.redhat.com",
                "status": "UP",
                "role": "Gluster Peer",
                "release": "gluster"
            }]
        }],

        nodes: [{
            "clusterId": "1ee0d16e7d9018ed72280fa520ec88e663642857f8b6c0720c53d4a01a59e841",
            "clusterName": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "id": "fc12302b-0025-467e-bf43-0f64d8217d21",
            "managed": "Yes",
            "status": "DOWN",
            "name": "dhcp43-19.lab.eng.blr.redhat.com",
            "ipAddress": "10.70.43.19",
            "role": "Monitor",
            "integrationId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "version": "4.1dev",
            "alerts": "0",
            "bricks": "2"
        }, {
            "clusterId": "1ee0d16e7d9018ed72280fa520ec88e663642857f8b6c0720c53d4a01a59e841",
            "clusterName": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "id": "f120a3f2-052a-4028-8fb2-7dddb310fec3",
            "managed": "No",
            "status": "Not Managed",
            "name": "dhcp43-27.lab.eng.blr.redhat.com",
            "ipAddress": "10.70.43.19",
            "role": "Gluster Peer",
            "integrationId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "version": "4.1dev",
            "alerts": "None",
            "bricks": "None"
        }],
        sortFields: [{
            id: "name",
            title: "Name",
            sortType: "alpha"
        }],
        filterFields: [{
            id: "name",
            title: "Name",
            placeholder: "Filter by Name",
            filterType: "text"
        }, {
            id: "status",
            title: "Status",
            placeholder: "Filter by Status",
            filterType: "select",
            filterValues: ["UP", "DOWN"]
        }],
        sortedformattedOutput: [{
            "clusterId": "1ee0d16e7d9018ed72280fa520ec88e663642857f8b6c0720c53d4a01a59e841",
            "clusterName": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "id": "f120a3f2-052a-4028-8fb2-7dddb310fec3",
            "managed": "No",
            "status": "Not Managed",
            "name": "dhcp43-27.lab.eng.blr.redhat.com",
            "ipAddress": "10.70.43.19",
            "role": "Gluster Peer",
            "integrationId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "version": "4.1dev",
            "alerts": "None",
            "bricks": "None"
        }, {
            "clusterId": "1ee0d16e7d9018ed72280fa520ec88e663642857f8b6c0720c53d4a01a59e841",
            "clusterName": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "id": "fc12302b-0025-467e-bf43-0f64d8217d21",
            "managed": "Yes",
            "status": "DOWN",
            "name": "dhcp43-19.lab.eng.blr.redhat.com",
            "ipAddress": "10.70.43.19",
            "role": "Monitor",
            "integrationId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "version": "4.1dev",
            "alerts": "0",
            "bricks": "2"
        }],
        filteredNameFormattedOutput: [{
            "clusterId": "1ee0d16e7d9018ed72280fa520ec88e663642857f8b6c0720c53d4a01a59e841",
            "clusterName": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "id": "f120a3f2-052a-4028-8fb2-7dddb310fec3",
            "managed": "No",
            "status": "Not Managed",
            "name": "dhcp43-27.lab.eng.blr.redhat.com",
            "ipAddress": "10.70.43.19",
            "role": "Gluster Peer",
            "integrationId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "version": "4.1dev",
            "alerts": "None",
            "bricks": "None"
        }],
        filteredStatusFormattedOutput: [{
            "clusterId": "1ee0d16e7d9018ed72280fa520ec88e663642857f8b6c0720c53d4a01a59e841",
            "clusterName": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "id": "fc12302b-0025-467e-bf43-0f64d8217d21",
            "managed": "Yes",
            "status": "DOWN",
            "name": "dhcp43-19.lab.eng.blr.redhat.com",
            "ipAddress": "10.70.43.19",
            "role": "Monitor",
            "integrationId": "7b05c774-f1e9-4ded-9e0b-7ac989a4f60c",
            "version": "4.1dev",
            "alerts": "0",
            "bricks": "2"
        }]
    })

})();