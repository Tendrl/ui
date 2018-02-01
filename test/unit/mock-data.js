(function() {

    var testDataModule = angular.module("TestDataModule", []);

    testDataModule.value("hostList", {
        nodes: [{
            node_id: "3038c577-b233-4513-926d-a8a1ac63b0a3",
            status: "UP",
            fqdn: "dhcp43-189.lab.eng.blr.redhat.com",
            node_context: {
                fqdn: "dhcp43-189.lab.eng.blr.redhat.com",
                machine_id: "a2e4163a1a8e4b28afb1a17e6a1d9962",
                node_id: "3038c577-b233-4513-926d-a8a1ac63b0a3"
            },
            tendrl_context: {
                sds_version: "3.9rc1",
                cluster_id: "49f878e3-e253-4fad-a947-cb987bba503d",
                node_id: "3038c577-b233-4513-926d-a8a1ac63b0a3",
                sds_name: "glusterfs"
            },
            stats: "{'alert_cnt': 10, 'storage': {'total': 42949672960, 'used': 21474836480, 'updated_at': '2016-12-19T23:12:51.278616', 'percent_used': 50}, 'cpu': {'updated_at': '2016-12-19T23:12:51.278516', 'percent_used': 4.5}, 'memory': {'total': 4294967296, 'used': 2147483648, 'updated_at': '2016-12-19T23:12:51.278593', 'percent_used': 50}}"
        }],

        formattedOutput: [{

            alert_count: 10,
            cluster_name: "Unassigned",
            cpu: {
                percent_used: 4.5,
                updated_at: "2016-12-19T23:12:51.278516"
            },
            id: "3038c577-b233-4513-926d-a8a1ac63b0a3",
            memory: {
                percent_used: 50,
                total: 4294967296,
                updated_at: "2016-12-19T23:12:51.278593",
                used: 2147483648
            },
            name: "dhcp43-189.lab.eng.blr.redhat.com",
            role: undefined,
            status: "UP",
            storage: {
                percent_used: 50,
                total: 42949672960,
                updated_at: "2016-12-19T23:12:51.278616",
                used: 21474836480
            }
        }],

        clusterName: "gluster"
    });

    testDataModule.value("taskList", {
        jobs: [{
                    "created_at": "2018-01-15T08:31:42Z",
                    "errors": "",
                    "flow": "ImportCluster",
                    "job_id": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
                    "messages_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
                    "output_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
                    "parameters": { 
                        "Cluster.enable_volume_profiling": "no", 
                        "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305", 
                        "enable_volume_profiling": "no" 
                    },
                    "status": "Completed",
                    "status_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
                    "updated_at": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }, {
                    "created_at": "2018-01-20T08:31:42Z",
                    "errors": "",
                    "flow": "ImportCluster",
                    "job_id": "faf62e32-3929-4d3d-9cbc-9a83587b533c",
                    "messages_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
                    "output_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
                    "parameters": { 
                        "Cluster.enable_volume_profiling": "no", 
                        "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305", 
                        "enable_volume_profiling": "no" 
                    },
                    "status": "Completed",
                    "status_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
                    "updated_at": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }],
        formattedJobs: [{
                    "created_at": "2018-01-15T08:31:42Z",
                    "errors": "",
                    "flow": "ImportCluster",
                    "job_id": "baf62e32-3929-4d3d-9cbc-9a83587b533c",
                    "messages_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
                    "output_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
                    "parameters": { 
                        "Cluster.enable_volume_profiling": "no", 
                        "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305", 
                        "enable_volume_profiling": "no" 
                    },
                    "status": "Completed",
                    "status_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
                    "updated_at": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }, {
                    "created_at": "2018-01-20T08:31:42Z",
                    "errors": "",
                    "flow": "ImportCluster",
                    "job_id": "faf62e32-3929-4d3d-9cbc-9a83587b533c",
                    "messages_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/messages",
                    "output_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/output",
                    "parameters": { 
                        "Cluster.enable_volume_profiling": "no", 
                        "TendrlContext.integration_id": "e372c01c-5022-41ce-9412-e96038bca305", 
                        "enable_volume_profiling": "no" 
                    },
                    "status": "Completed",
                    "status_url": "/jobs/baf62e32-3929-4d3d-9cbc-9a83587b533c/status",
                    "updated_at": "Mon Jan 15 2018 16:05:13 GMT+0530 (IST)"
        }],
        integration_id : "f755f0cd-b784-4920-83c3-db9d576d5935",
        date : {
            fromDate: "",
            toDate: "",
        },
        status : ["finished", "failed", "warning", "processing", "new"]
    });

    testDataModule.value("clusterList", {
        clusters: [{
            "sds_name": "gluster",
            "cluster_name": "gluster-6561e70789dc2fd78f67b176068c0d69c48dd33f78a801b1dba264d4afa32625",
            "cluster_id": "e372c01c-5022-41ce-9412-e96038bca305",
            "integration_id": "e372c01c-5022-41ce-9412-e96038bca305",
            "hash": "7daaa1782714800cd5c0ab4607d1d09f",
            "sds_version": "3.8.4",
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
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "e372c01c-5022-41ce-9412-e96038bca305",
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
        sortedformattedOutput: [{
            integrationId: "f755f0cd-b784-4920-83c3-db9d576d5935",
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "f755f0cd-b784-4920-83c3-db9d576d5935",
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
            sdsVersion: "3.8.4",
            sdsName: "gluster",
            name: "e372c01c-5022-41ce-9412-e96038bca305",
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
        profilingResponse: {
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

})();