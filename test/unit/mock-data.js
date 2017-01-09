(function() {

    var testDataModule = angular.module("TestDataModule", []);

    testDataModule.value("generateForm", {
        formAttributes: [{
            "type": "String",
            "name": "volumeName",
            "value": "Volume1",
            "required": true
        }, {
            "type": "Integer",
            "name": "stripe_count",
            "value": 3,
            "required": false
        }, {
            "type": "Integer",
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
            "type": "String",
            "name": "Name",
            "value": "Volume1"
        },
        stringKey: "volName",
        integerAttribute: {
            "type": "Integer",
            "name": "Stripe Count",
            "value": 3
        },
        integerKey: "stripe_count",
        booleanAttribute: {
            "type": "Boolean",
            "name": "Force"
        },
        booleanKey: "force",
        listAttribute: {
            "type": "List",
            "name": "Brick Details"
        },
        listKey: "brickdetails",
        listOptions: [{
            "fqdn": "dhcp10-10.abc.com",
            "machine_id": "a34kjsl3545l451d9962",
            "node_id": "3038c577-a8a1ab534b0bc4"
        }, {
            "fqdn": "dhcp10-11.abc.com",
            "machine_id": "a34kjsl3545l451d9452",
            "node_id": "3038c577-a8a1ab534b0a2"
        }]
    });

    testDataModule.value("importCluster", {
        generateFlows: [{
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
            }

        ],
        flowInfo: {
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
        }, {
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
            "name": "replica_count",
            "type": "Integer",
            "required": true
        }],
        actionDetails: {
            "actionName": "create",
            "action": {
                "method": "POST",
                "url": "http://10.70.7.196:8080/api/actions.json"
            }
        },
        requestData: {
            clusterId: "3969b68f-e927-45da-84d6-004c67974f07",
            inventoryName: "volume"
        }
    });

    testDataModule.value("poolList", {
        pools: [{
            cluster_id: "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
            min_size: "2",
            pg_num: "64",
            pool_id: "0",
            poolname: "rbd",
            updated: "1479895109.37"
        }],

        formattedOutput: [{
            alertCount: "NA",
            clusterId: "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
            clusterName: "zats",
            name: "rbd",
            osdCount: "NA",
            pgCount: "64",
            quotas: "NA",
            replicaCount: "NA",
            status: "NA",
            utilization: "Utilisation-NA"
        }],

        clusterName: "zats"
    });

    testDataModule.value("clusterList", {
        clusters: [{
            "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3": {
                "tendrl_context": {
                    "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
                    "sds_name": "zats",
                    "sds_version": "10.2.3"
                },
                "volumes": {
                    "9dd1a450-868d-4a65-a3f7-704623985765": {
                        "name": "new Vol786",
                        "status": "Started",
                        "vol_id": "9dd1a450-868d-4a65-a3f7-704623981f40",
                        "vol_type": "Distribute",
                        "bricks": {
                            "dhcp42-98.lab.eng.blr.redhat.com:_root_bricks_vol100_b1": {
                                "hostname": "dhcp42-98.lab.eng.blr.redhat.com",
                                "mount_opts": "",
                                "path": "dhcp42-98.lab.eng.blr.redhat.com:/root/bricks/vol100_b1",
                                "port": "None",
                                "status": "None",
                                "vol_id": "9dd1a450-868d-4a65-a3f7-704623981f40",
                                "cluster_id": "49f878e3-e253-4fad-a947-cb987bba503d",
                                "fs_type": "None"
                            }
                        },
                        "brick_count": "1",
                        "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
                        "deleted": "True"
                    }
                },
                "maps": {
                    "mon_status": {
                        "fsid": "d1e34dd4-bcdb-47c7-9832-915e80fe3779",
                        "sync_type": "mon_status",
                        "updated": "1479895109.44",
                        "version": "4",
                        "when": "2016-11-23 09:58:29.436007+00:00",
                        "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
                        "cluster_name": "ceph",
                        "data": "{'election_epoch': 4, 'name': 'dhcp41-178', 'state': 'leader', 'rank': 0, 'outside_quorum': [], 'monmap': {'epoch': 1, 'created': '2016-11-18 15:59:49.592801', 'mons': [{'name': 'dhcp41-178', 'rank': 0, 'addr': '10.70.41.178:6789/0'}], 'fsid': 'd1e34dd4-bcdb-47c7-9832-915e80fe3779', 'modified': '2016-11-18 15:59:49.592801'}, 'extra_probe_peers': [], 'sync_provider': [], 'quorum': [0]}"
                    },
                    "pg_summary": {
                        "cluster_name": "ceph",
                        "data": "{'by_osd': {0: {'active+remapped': 34, 'active+undersized+degraded': 16}, 1: {'active+remapped': 40, 'active+undersized+degraded': 16}, 2: {'active+remapped': 36}, 3: {'active+remapped': 34}}, 'by_pool': {0: {'active+remapped': 48, 'active+undersized+degraded': 16}}, 'all': {'active+remapped': 48, 'active+undersized+degraded': 16}}",
                        "fsid": "d1e34dd4-bcdb-47c7-9832-915e80fe3779",
                        "sync_type": "pg_summary",
                        "updated": "1479895109.47",
                        "version": "None",
                        "when": "2016-11-23 09:58:29.470666+00:00",
                        "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3"
                    },
                    "health": {
                        "data": "{'timechecks': {'round_status': 'finished', 'epoch': 4, 'round': 0}, 'overall_status': 'HEALTH_WARN', 'health': {'health_services': [{'mons': [{'last_updated': '2016-11-23 15:35:15.680046', 'name': 'dhcp41-178', 'avail_percent': 97, 'kb_total': 52403200, 'kb_avail': 50865108, 'health': 'HEALTH_OK', 'kb_used': 1538092, 'store_stats': {'bytes_total': 26092811, 'bytes_log': 7274496, 'last_updated': '0.000000', 'bytes_misc': 65552, 'bytes_sst': 18752763}}]}]}, 'detail': [], 'summary': [{'severity': 'HEALTH_WARN', 'summary': '16 pgs degraded'}, {'severity': 'HEALTH_WARN', 'summary': '64 pgs stuck unclean'}, {'severity': 'HEALTH_WARN', 'summary': '16 pgs undersized'}]}",
                        "fsid": "d1e34dd4-bcdb-47c7-9832-915e80fe3779",
                        "sync_type": "health",
                        "updated": "1479895518.84",
                        "version": "None",
                        "when": "2016-11-23 10:05:18.839809+00:00",
                        "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
                        "cluster_name": "ceph"
                    },
                    "config": {
                        "fsid": "d1e34dd4-bcdb-47c7-9832-915e80fe3779",
                        "sync_type": "config",
                        "updated": "1479895109.56",
                        "version": "None",
                        "when": "2016-11-23 09:58:29.560424+00:00",
                        "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
                        "cluster_name": "ceph",
                        "data": "{'auth_mon_ticket_ttl': '43200', 'mds_tick_interval': '5', 'filestore_punch_hole': 'false', 'bluestore_sync_submit_transaction': 'false', 'ms_inject_delay_max': '1', 'async_compressor_thread_suicide_timeout': '30', 'crushtool': 'crushtool', 'rgw_swift_auth_url': '', 'osd_debug_scrub_chance_rewrite_digest': '0', 'rocksdb_log_to_ceph_log': 'true', 'osd_objectstore_fuse': 'false', 'rgw_ldap_dnattr': 'uid', 'rgw_bucket_default_quota_max_objects': '-1', 'rbd_default_stripe_count': '0', 'mon_osd_laggy_weight': '0.3', 'mon_max_pgmap_epochs': '500', 'filestore_apply_finisher_threads': '1', 'mon_daemon_bytes': '419430400', 'client_cache_size': '16384', 'ms_async_send_inline': 'true', 'osd_use_stale_snap': 'false', 'kstore_max_ops': '512', 'auth_client_required': 'cephx, none', 'osd_deep_scrub_update_digest_min_age': '7200', 'bluestore_wal_max_bytes': '134217728', 'client_readahead_max_periods': '4', 'mon_probe_timeout': '2', 'osd_enable_op_tracker': 'true', 'mon_osd_allow_primary_affinity': 'false', 'mon_osd_laggy_halflife': '3600', 'rgw_keystone_admin_token': '', 'mds_max_purge_files': '64', 'osd_recover_clone_overlap_limit': '10', 'bluestore_block_wal_size': '100663296', 'osd_scrub_chunk_max': '25', 'osd_os_flags': '0', 'rgw_swift_url_prefix': 'swift', 'mon_debug_dump_location': '/var/log/ceph/ceph-mon.dhcp41-178.tdump', 'osd_deep_scrub_randomize_ratio': '0.15', 'cephx_service_require_signatures': 'false', 'rgw_data': '/var/lib/ceph/radosgw/ceph-dhcp41-178', 'rbd_mirror_concurrent_image_syncs': '5', 'paxos_max_join_drift': '10', 'debug_osd': '0/5', 'mds_kill_journal_replay_at': '0', 'paxos_trim_min': '250', 'bluestore_bluefs_reclaim_ratio': '0.2', 'auth_service_required': 'cephx', 'rbd_validate_pool': 'true', 'filestore_debug_inject_read_err': 'false', 'mds_snap_max_uid': '65536', 'mds_bal_split_wr': '10000', 'rgw_multipart_min_part_size': '5242880', 'rgw_period_push_interval_max': '30', 'filestore_queue_max_bytes': '104857600', 'rgw_log_object_name': '%Y-%m-%d-%H-%i-%n', 'heartbeat_file': '', 'filestore_wbthrottle_btrfs_ios_start_flusher': '500', 'public_network': '', 'mon_pg_min_inactive': '1', 'debug_mds_balancer': '1/5', 'ms_type': 'simple', 'osd_pool_default_min_size': '0', 'filestore_update_to': '1000', 'rbd_journal_object_flush_age': '0', 'mds_bal_need_max': '1.2', 'rgw_zonegroup': '', 'client_mount_gid': '-1', 'debug_crypto': '1/5', 'osd_max_pgls': '1024', 'rbd_non_blocking_aio': 'true', 'rgw_objexp_chunk_size': '100', 'rgw_default_zonegroup_info_oid': 'default.zonegroup', 'mon_inject_transaction_delay_probability': '0', 'rgw_swift_account_in_url': 'false', 'mon_pg_stuck_threshold': '300', 'journaler_write_head_interval': '15', 'filestore_wbthrottle_xfs_inodes_start_flusher': '500', 'kinetic_host': '', 'debug_compressor': '1/5', 'debug_none': '0/5', 'debug_crush': '1/1', 'mon_clock_drift_allowed': '0.05', 'rgw_init_timeout': '300', 'osd_verify_sparse_read_holes': 'false', 'mds_replay_interval': '1', 'osd_tier_default_cache_mode': 'writeback', 'osd_debug_randomize_hobject_sort_order': 'false', 'mds_snap_rstat': 'false', 'osd_max_scrubs': '1', 'erasure_code_dir': '/usr/lib64/ceph/erasure-code', 'mds_kill_journal_at': '0', 'cluster_addr': ':/0', 'async_compressor_threads': '2', 'mon_client_hunt_interval': '3', 'osd_pg_object_context_cache_count': '64', 'log_to_syslog': 'false', 'mon_compact_on_trim': 'true', 'filestore_max_alloc_hint_size': '1048576', 'bdev_nvme_unbind_from_kernel': 'false', 'xio_mp_max_1k': '8192', 'rbd_validate_names': 'true', 'mon_max_mdsmap_epochs': '500', 'osd_debug_verify_snaps_on_info': 'false', 'rbd_balance_parent_reads': 'false', 'bluefs_alloc_size': '1048576', 'mds_action_on_write_error': '1', 'objecter_inject_no_watch_ping': 'false', 'paxos_kill_at': '0', 'rgw_default_zone_info_oid': 'default.zone', 'mds_wipe_ino_prealloc': 'false', 'osd_max_push_objects': '10', 'objecter_timeout': '10', 'osd_agent_max_ops': '4', 'osd_heartbeat_addr': ':/0', 'mon_osd_down_out_interval': '300', 'rgw_bucket_quota_ttl': '600', 'fatal_signal_handlers': 'true', 'mon_debug_unsafe_allow_tier_with_nonempty_snaps': 'false', 'mds_bal_merge_wr': '1000', 'osd_pg_bits': '6', 'paxos_service_trim_max': '500', 'mon_session_timeout': '300', 'filestore_caller_concurrency': '10', 'osd_tier_default_cache_hit_set_period': '1200', 'objecter_tick_interval': '5', 'mon_pg_create_interval': '30', 'osd_pg_log_trim_min': '100', 'filestore_debug_omap_check': 'false', 'rgw_ops_log_rados': 'true', 'kstore_fsck_on_mount': 'false', 'mds_kill_journal_expire_at': '0', 'daemonize': 'false', 'rbd_default_format': '2', 'client_quota_df': 'true', 'rocksdb_db_paths': '', 'xio_trace_xcon': 'false', 'mon_reweight_max_osds': '4', 'rgw_keystone_token_cache_size': '10000', 'osd_hit_set_namespace': '.ceph-internal', 'mds_bal_minchunk': '0.001', 'bluestore_kvbackend': 'rocksdb', 'filestore_wbthrottle_xfs_inodes_hard_limit': '5000', 'mds_health_summarize_threshold': '10', 'mon_initial_members': '', 'mon_scrub_inject_crc_mismatch': '0', 'filestore_split_multiple': '2', 'osd_recovery_sleep': '0', 'mds_kill_rename_at': '0', 'mon_osd_nearfull_ratio': '0.85', 'debug_tp': '0/5', 'filestore_btrfs_clone_range': 'true', 'osd_mon_shutdown_timeout': '5', 'bluestore_debug_freelist': 'false', 'bluestore_onode_map_size': '1024', 'client_oc_max_dirty': '104857600', 'perf': 'true', 'filestore_max_inline_xattr_size_btrfs': '2048', 'osd_check_for_log_corruption': 'false', 'rbd_journal_order': '24', 'osd_pool_default_flag_nopgchange': 'false', 'setuser_match_path': '', 'rgw_keystone_accepted_roles': 'Member, admin', 'crush_location': '', 'xio_mp_max_256': '8192', 'log_graylog_host': '127.0.0.1', 'pid_file': '', 'xio_mp_max_64': '65536', 'mon_scrub_max_keys': '100', 'osd_op_thread_suicide_timeout': '150', 'max_mds': '1', 'cephx_cluster_require_signatures': 'false', 'restapi_base_url': '', 'lockdep_force_backtrace': 'false', 'bluestore_max_dir_size': '1000000', 'ms_die_on_skipped_message': 'false', 'osd_command_max_records': '256', 'mon_max_pool_pg_num': '65536', 'bluestore_bluefs_min': '1073741824', 'ms_inject_delay_msg_type': '', 'mon_cluster_log_file_level': 'info', 'mds_kill_export_at': '0', 'rbd_cache_max_dirty_age': '1', 'mds_inject_traceless_reply_probability': '0', 'mds_standby_for_name': '', 'chdir': '/', 'mds_kill_mdstable_at': '0', 'mon_client_hunt_interval_backoff': '2', 'client_try_dentry_invalidate': 'true', 'rgw_dns_name': '', 'bluestore_max_bytes': '67108864', 'osd_pool_default_pg_num': '8', 'debug_objecter': '0/1', 'rbd_clone_copy_on_read': 'false', 'rgw_fcgi_socket_backlog': '1024', 'osd_op_complaint_time': '30', 'debug_kinetic': '1/5', 'filestore_max_xattr_value_size': '0', 'mon_data': '/var/lib/ceph/mon/ceph-dhcp41-178', 'filestore_journal_parallel': 'false', 'rgw_keystone_admin_password': '', 'journaler_prefetch_periods': '10', 'clock_offset': '0', 'mon_data_avail_warn': '30', 'fuse_big_writes': 'true', 'inject_early_sigterm': 'false', 'mon_osd_prime_pg_temp': 'true', 'client_oc_max_dirty_age': '5', 'rgw_expose_bucket': 'false', 'osd_backfill_scan_max': '512', 'osd_pool_use_gmt_hitset': 'true', 'mon_osd_reporter_subtree_level': 'host', 'filestore_wbthrottle_btrfs_inodes_hard_limit': '5000', 'kstore_onode_map_size': '1024', 'mds_bal_fragment_size_max': '100000', 'rgw_log_object_name_utc': 'false', 'xio_queue_depth': '128', 'bluestore_block_create': 'true', 'mon_warn_on_cache_pools_without_hit_sets': 'true', 'rgw_objexp_gc_interval': '600', 'mon_warn_on_no_sortbitwise': 'true', 'journal_max_corrupt_search': '10485760', 'client_check_pool_perm': 'true', 'mds_bal_max_until': '-1', 'ms_rwthread_stack_bytes': '1048576', 'debug_asok': '1/5', 'osd_op_pq_min_cost': '65536', 'mds_early_reply': 'true', 'rgw_usage_log_flush_threshold': '1024', 'osd_map_dedup': 'true', 'bluestore_debug_prefill': '0', 'mon_subscribe_interval': '86400', 'rbd_op_thread_timeout': '60', 'mon_sync_debug_provider_fallback': '-1', 'leveldb_bloom_size': '0', 'debug_timer': '0/1', 'paxos_min': '500', 'threadpool_empty_queue_max_wait': '2', 'mds_standby_for_fscid': '-1', 'osd_pool_erasure_code_stripe_width': '4096', 'rbd_journal_pool': '', 'osd_max_push_cost': '8388608', 'bluestore_fsck_on_umount': 'false', 'heartbeat_inject_failure': '0', 'osd_loop_before_reset_tphandle': '64', 'bluestore_rocksdb_options': 'compression=kNoCompression,max_write_buffer_number=16,min_write_buffer_number_to_merge=3,recycle_log_file_num=16', 'mon_crush_min_required_version': 'firefly', 'mon_health_to_clog_tick_interval': '60', 'xio_mp_max_page': '4096', 'filestore_debug_disable_sharded_check': 'false', 'rbd_journal_splay_width': '4', 'osd_hit_set_min_size': '1000', 'osd_journal': '/var/lib/ceph/osd/ceph-dhcp41-178/journal', 'journal_zero_on_create': 'false', 'log_graylog_port': '12201', 'osd_op_pq_max_tokens_per_priority': '4194304', 'mds_dirstat_min_interval': '1', 'filestore_fiemap_threshold': '4096', 'filestore_collect_device_partition_information': 'true', 'osd_debug_drop_ping_probability': '0', 'bluestore_open_by_handle': 'true', 'keyfile': '', 'clog_to_graylog_host': '127.0.0.1', 'mon_cluster_log_to_graylog_host': '127.0.0.1', 'log_stop_at_utilization': '0.97', 'async_compressor_enabled': 'false', 'journaler_allow_split_entries': 'true', 'rgw_swift_versioning_enabled': 'false', 'osd_agent_min_evict_effort': '0.1', 'mds_op_log_threshold': '5', 'osd_pool_default_cache_target_dirty_high_ratio': '0.6', 'osd_scrub_max_interval': '604800', 'auth_cluster_required': 'cephx', 'fuse_atomic_o_trunc': 'true', 'mon_pool_quota_crit_threshold': '0', 'journal_force_aio': 'false', 'clog_to_syslog_facility': 'default=daemon audit=local0', 'osd_mon_report_interval_min': '5', 'client_die_on_failed_remount': 'true', 'mon_osd_down_out_subtree_limit': 'rack', 'mon_pool_quota_warn_threshold': '0', 'mon_pg_warn_min_objects': '10000', 'mds_session_timeout': '60', 'osd_read_ec_check_for_errors': 'false', 'fuse_multithreaded': 'true', 'debug_rbd_replay': '0/5', 'mon_clock_drift_warn_backoff': '5', 'rgw_gc_max_objs': '32', 'client_inject_fixed_oldest_tid': 'false', 'mon_max_log_entries_per_event': '4096', 'mon_osd_min_down_reporters': '2', 'mon_osd_adjust_down_out_interval': 'true', 'osd_open_classes_on_start': 'true', 'debug_refs': '0/0', 'osd_pg_stat_report_interval_max': '500', 'ms_die_on_bad_msg': 'false', 'ms_inject_internal_delays': '0', 'mds_bal_merge_size': '50', 'err_to_graylog': 'false', 'rgw_zonegroup_root_pool': '.rgw.root', 'osd_debug_op_order': 'false', 'mon_sync_debug_leader': '-1', 'ms_tcp_nodelay': 'true', 'mon_osd_report_timeout': '900', 'mon_scrub_inject_missing_keys': '0', 'filestore_wbthrottle_enable': 'true', 'bluestore_block_path': '', 'filestore_fd_cache_shards': '16', 'osd_recovery_thread_timeout': '30', 'mds_bal_midchunk': '0.3', 'kstore_rocksdb_options': 'compression=kNoCompression', 'rgw_realm_reconfigure_delay': '2', 'filestore_queue_high_delay_multiple': '0', 'mon_reweight_min_bytes_per_osd': '104857600', 'rbd_journal_object_flush_interval': '0', 'osd_op_log_threshold': '5', 'rgw_swift_enforce_content_length': 'false', 'name': 'mon.dhcp41-178', 'mon_timecheck_skew_interval': '30', 'osd_scrub_cost': '52428800', 'osd_kill_backfill_at': '0', 'rbd_cache_size': '33554432', 'mon_tick_interval': '5', 'mon_osd_auto_mark_auto_out_in': 'true', 'journal_max_write_entries': '100', 'rocksdb_cache_size': '134217728', 'osd_stats_ack_timeout_decay': '0.9', 'rgw_gc_processor_max_time': '3600', 'mon_rocksdb_options': 'cache_size=536870912,write_buffer_size=33554432,block_size=65536,compression=kNoCompression', 'bluestore_sync_io': 'false', 'mon_osd_max_op_age': '32', 'mon_lease': '5', 'rgw_swift_url': '', 'client_permissions': 'true', 'bluestore_bluefs_env_mirror': 'false', 'filestore_kill_at': '0', 'journal_throttle_max_multiple': '0', 'mon_keyvaluedb': 'leveldb', 'osd_scrub_chunk_min': '5', 'rgw_nfs_lru_lanes': '5', 'mds_freeze_tree_timeout': '30', 'xio_portal_threads': '2', 'xio_transport_type': 'rdma', 'err_to_syslog': 'false', 'rgw_user_quota_bucket_sync_interval': '180', 'rgw_data_log_window': '30', 'journaler_batch_max': '0', 'mon_osd_max_split_count': '32', 'mds_decay_halflife': '5', 'rgw_ldap_secret': '/etc/openldap/secret', 'client_mount_timeout': '300', 'mon_compact_on_start': 'false', 'mon_cluster_log_to_syslog': 'default=false', 'rgw_keystone_url': '', 'osd_agent_max_low_ops': '2', 'osd_allow_recovery_below_min_size': 'true', 'mon_client_max_log_entries_per_message': '1000', 'filestore_ondisk_finisher_threads': '1', 'debug_monc': '0/10', 'filestore_max_xattr_value_size_xfs': '65536', 'filestore_omap_header_cache_size': '1024', 'osd_pg_op_threshold_ratio': '2', 'osd_client_message_cap': '100', 'mon_cluster_log_file': 'default=/var/log/ceph/ceph.$channel.log cluster=/var/log/ceph/ceph.log', 'osd_recovery_op_priority': '3', 'mds_dump_cache_after_rejoin': 'false', 'debug_mds_locker': '1/5', 'mds_debug_auth_pins': 'false', 'mon_reweight_max_change': '0.05', 'rgw_intent_log_object_name': '%Y-%m-%d-%i-%n', 'osd_tier_default_cache_hit_set_search_last_n': '1', 'mon_sync_provider_kill_at': '0', 'rgw_keystone_api_version': '2', 'osd_data': '/var/lib/ceph/osd/ceph-dhcp41-178', 'osd_debug_reject_backfill_probability': '0', 'rgw_content_length_compat': 'false', 'bluestore_overlay_max': '0', 'ms_async_set_affinity': 'true', 'xio_mp_max_hint': '4096', 'kstore_sync_submit_transaction': 'false', 'osd_map_cache_size': '200', 'filestore_queue_low_threshhold': '0.3', 'osd_scrub_priority': '5', 'auth_debug': 'false', 'filestore_sloppy_crc_block_size': '65536', 'rbd_request_timed_out_seconds': '30', 'rgw_keystone_admin_tenant': '', 'osd_agent_delay_time': '5', 'mds_kill_create_at': '0', 'filestore_odsync_write': 'false', 'rgw_bucket_index_max_aio': '8', 'rgw_num_control_oids': '8', 'rgw_keystone_verify_ssl': 'true', 'client_cache_mid': '0.75', 'ms_die_on_unhandled_msg': 'false', 'rgw_exit_timeout_secs': '120', 'async_compressor_type': 'snappy', 'osd_map_message_max': '100', 'fuse_allow_other': 'true', 'mon_osd_allow_primary_temp': 'false', 'mutex_perf_counter': 'false', 'log_max_recent': '10000', 'mon_compact_on_bootstrap': 'false', 'mon_client_hunt_interval_max_multiple': '10', 'mon_max_log_epochs': '500', 'mds_max_scrub_ops_in_progress': '5', 'osd_check_max_object_name_len_on_startup': 'true', 'filestore_fsync_flushes_journal_data': 'false', 'mds_wipe_sessions': 'false', 'client_quota': 'false', 'rgw_enable_usage_log': 'false', 'journaler_prezero_periods': '5', 'osd_heartbeat_use_min_delay_socket': 'false', 'mon_warn_on_osd_down_out_interval_zero': 'true', 'debug_journaler': '0/5', 'filestore_op_threads': '2', 'mds_bal_replicate_threshold': '8000', 'leveldb_max_open_files': '0', 'osd_pool_default_cache_target_full_ratio': '0.8', 'rgw_s3_success_create_obj_status': '0', 'journaler_batch_interval': '0.001', 'osd_mon_ack_timeout': '30', 'fuse_default_permissions': 'true', 'osd_debug_drop_op_probability': '0', 'mon_pg_warn_max_object_skew': '10', 'osd_class_dir': '/usr/lib64/rados-classes', 'ms_inject_delay_probability': '0', 'mds_enable_op_tracker': 'true', 'osd_tier_promote_max_bytes_sec': '25', 'ms_async_op_threads': '3', 'osd_scrub_load_threshold': '0.5', 'osd_max_backfills': '1', 'osd_num_op_tracker_shard': '32', 'debug_rados': '0/5', 'osd_max_markdown_count': '5', 'admin_socket': '/var/run/ceph/ceph-mon.dhcp41-178.asok', 'osd_debug_drop_ping_duration': '0', 'filestore_queue_high_threshhold': '0.9', 'max_open_files': '131072', 'bluestore_max_ops': '512', 'bdev_inject_crash_flush_delay': '2', 'rgw_num_rados_handles': '1', 'auth_service_ticket_ttl': '3600', 'paxos_trim_max': '500', 'rgw_user_quota_sync_idle_users': 'false', 'xio_trace_msgcnt': 'false', 'rgw_realm_root_pool': '.rgw.root', 'ms_dump_corrupt_message_level': '1', 'client_notify_timeout': '10', 'rgw_host': '', 'mds_bal_target_removal_min': '5', 'ms_tcp_rcvbuf': '0', 'mon_election_timeout': '5', 'ms_bind_retry_count': '3', 'osd_op_history_duration': '600', 'mon_accept_timeout_factor': '2', 'mds_bal_unreplicate_threshold': '0', 'leveldb_block_size': '65536', 'mon_debug_dump_json': 'false', 'osd_remove_thread_timeout': '3600', 'osd_scan_list_ping_tp_interval': '100', 'bluestore_debug_no_reuse_blocks': 'false', 'filestore_queue_max_delay_multiple': '0', 'mds_debug_frag': 'false', 'debug_javaclient': '1/5', 'rgw_op_thread_timeout': '600', 'mon_slurp_bytes': '262144', 'ms_initial_backoff': '0.2', 'mds_op_history_size': '20', 'filestore_min_sync_interval': '0.01', 'host': 'dhcp41-178', 'internal_safe_to_start_threads': 'true', 'rgw_socket_path': '', 'mds_verify_scatter': 'false', 'osd_find_best_info_ignore_history_les': 'false', 'mon_health_data_update_interval': '60', 'filestore_inject_stall': '0', 'client_max_inline_size': '4096', 'rbd_default_order': '22', 'osd_tier_default_cache_hit_set_count': '4', 'osd_inject_bad_map_crc_probability': '0', 'mon_debug_dump_transactions': 'false', 'osd_backfill_retry_interval': '10', 'filestore_max_inline_xattr_size_xfs': '65536', 'mds_log_max_segments': '30', 'rbd_journal_max_payload_bytes': '16384', 'mon_warn_not_scrubbed': '0', 'rgw_num_zone_opstate_shards': '128', 'objecter_completion_locks_per_session': '32', 'client_readahead_min': '131072', 'mds_op_complaint_time': '30', 'osd_snap_trim_priority': '5', 'osd_tier_default_cache_min_write_recency_for_promote': '1', 'bdev_aio_poll_ms': '250', 'osd_hit_set_max_size': '100000', 'osd_pg_epoch_persisted_max_stale': '150', 'fuse_syncfs_on_mksnap': 'true', 'paxos_stash_full_interval': '25', 'debug_civetweb': '1/10', 'filestore_wbthrottle_xfs_bytes_start_flusher': '41943040', 'osd_rollback_to_cluster_snap': '', 'osd_mon_report_max_in_flight': '2', 'client_oc_target_dirty': '8388608', 'ms_async_affinity_cores': '', 'filestore_commit_timeout': '600', 'memstore_page_set': 'true', 'mds_bal_fragment_interval': '5', 'osd_pool_default_hit_set_bloom_fpp': '0.05', 'mon_osd_cache_size': '10', 'osd_preserve_trimmed_log': 'false', 'mon_health_to_clog_interval': '3600', 'osd_disk_thread_ioprio_class': '', 'mon_warn_on_crush_straw_calc_version_zero': 'true', 'ms_async_max_op_threads': '5', 'paxos_min_wait': '0.05', 'rgw_cache_lru_size': '10000', 'num_client': '1', 'rgw_log_nonexistent_bucket': 'false', 'client_oc': 'true', 'keyring': '/etc/ceph/ceph.mon.dhcp41-178.keyring,/etc/ceph/ceph.keyring,/etc/ceph/keyring,/etc/ceph/keyring.bin', 'bluefs_max_log_runway': '4194304', 'client_mds_namespace': '-1', 'filestore_sloppy_crc': 'false', 'bluestore_block_db_path': '', 'filestore_wbthrottle_xfs_ios_start_flusher': '500', 'osd_tier_default_cache_hit_set_grade_decay_rate': '20', 'osd_peering_wq_batch_size': '20', 'rgw_usage_log_tick_interval': '30', 'log_file': '/var/log/ceph/ceph-mon.dhcp41-178.log', 'mon_client_bytes': '104857600', 'throttler_perf_counter': 'true', 'mds_dir_max_commit_size': '10', 'osd_heartbeat_grace': '20', 'mds_max_file_recover': '32', 'mon_pg_warn_min_pool_objects': '1000', 'rgw_extended_http_attrs': '', 'osd_max_write_size': '90', 'rbd_readahead_disable_after_bytes': '52428800', 'rbd_cache_max_dirty_object': '0', 'mon_inject_sync_get_chunk_delay': '0', 'client_trace': '', 'debug_leveldb': '4/5', 'rgw_olh_pending_timeout_sec': '3600', 'mon_lease_renew_interval_factor': '0.6', 'bluefs_log_compact_min_size': '16777216', 'debug_buffer': '0/1', 'osd_heartbeat_interval': '6', 'filestore_dump_file': '', 'rgw_list_buckets_max_chunk': '1000', 'journal_ignore_corruption': 'false', 'mds_log_max_events': '-1', 'kstore_sync_transaction': 'false', 'mon_osd_force_trim_to': '0', 'bdev_debug_inflight_ios': 'false', 'rgw_admin_entry': 'admin', 'rbd_enable_alloc_hint': 'true', 'mon_pg_warn_min_per_osd': '30', 'rgw_nfs_fhcache_size': '2017', 'debug_objclass': '0/5', 'mon_health_to_clog': 'true', 'filestore_fd_cache_size': '128', 'mds_bal_frag': 'false', 'mon_osd_pool_ec_fast_read': 'false', 'kinetic_hmac_key': 'asdfasdf', 'client_use_faked_inos': 'false', 'mds_bal_idle_threshold': '0', 'osd_tier_default_cache_hit_set_type': 'bloom', 'rgw_bucket_quota_soft_threshold': '0.95', 'osd_compact_leveldb_on_mount': 'false', 'bluestore_block_size': '10737418240', 'osd_scrub_interval_randomize_ratio': '0.5', 'enable_experimental_unrecoverable_data_corrupting_features': '', 'mon_min_osdmap_epochs': '500', 'mon_data_avail_crit': '5', 'rgw_ldap_searchdn': 'cn=users,cn=accounts,dc=example,dc=com', 'rgw_period_latest_epoch_info_oid': '.latest_epoch', 'filestore_merge_threshold': '10', 'rgw_frontends': 'fastcgi, civetweb port=7480', 'mds_bal_mode': '0', 'mon_config_key_max_entry_size': '4096', 'osd_pool_default_flag_nodelete': 'false', 'osd_op_thread_timeout': '15', 'osd_pool_default_flag_nosizechange': 'false', 'rgw_user_quota_sync_interval': '86400', 'objecter_inflight_op_bytes': '104857600', 'journal_throttle_high_multiple': '0', 'mds_debug_scatterstat': 'false', 'rgw_objexp_hints_num_shards': '127', 'filestore_blackhole': 'false', 'mds_max_completed_requests': '100000', 'mon_scrub_timeout': '300', 'debug_striper': '0/1', 'rgw_swift_tenant_name': '', 'bluestore_bluefs_gift_ratio': '0.02', 'mon_force_quorum_join': 'false', 'osd_failsafe_nearfull_ratio': '0.9', 'mon_max_osd': '10000', 'rbd_skip_partial_discard': 'false', 'osd_debug_verify_stray_on_activate': 'false', 'filestore_wbthrottle_btrfs_bytes_start_flusher': '41943040', 'osd_disk_thread_ioprio_priority': '-1', 'mds_snap_min_uid': '0', 'mon_timecheck_interval': '300', 'mds_bal_split_rd': '25000', 'kstore_cache_tails': 'true', 'log_to_graylog': 'false', 'osd_debug_override_acting_compat': 'false', 'osd_stats_ack_timeout_factor': '2', 'debug_mds_log_expire': '1/5', 'rgw_bucket_quota_cache_size': '10000', 'osd_max_pg_log_entries': '10000', 'osd_bench_large_size_max_throughput': '104857600', 'rbd_readahead_trigger_requests': '10', 'mon_mds_force_trim_to': '0', 'filestore_max_inline_xattr_size_other': '512', 'rgw_max_put_size': '5368709120', 'mon_cluster_log_to_syslog_level': 'info', 'xio_max_send_inline': '512', 'rgw_swift_token_expiration': '86400', 'filestore_xfs_extsize': 'false', 'debug_kstore': '1/5', 'filestore_op_thread_timeout': '60', 'log_to_stderr': 'false', 'rgw_usage_max_shards': '32', 'filestore_max_inline_xattr_size': '0', 'osd_deep_scrub_stride': '524288', 'debug_lockdep': '0/1', 'journal_max_write_bytes': '10485760', 'mds_enforce_unique_name': 'true', 'osd_compression_plugins': 'zlib snappy', 'mon_osd_auto_mark_in': 'false', 'debug_filestore': '1/3', 'filestore_journal_trailing': 'false', 'mds_beacon_grace': '15', 'client_debug_force_sync_read': 'false', 'rbd_readahead_max_bytes': '524288', 'mon_osd_laggy_max_interval': '300', 'mds_log_skip_corrupt_events': 'false', 'filestore_max_xattr_value_size_other': '1024', 'mds_bal_split_bits': '3', 'bluestore_debug_small_allocations': '0', 'client_debug_inject_tick_delay': '0', 'leveldb_log_to_ceph_log': 'true', 'client_readahead_max_bytes': '0', 'cephx_require_signatures': 'false', 'client_use_random_mds': 'false', 'filestore_wbthrottle_btrfs_ios_hard_limit': '5000', 'rgw_port': '', 'mds_log_pause': 'false', 'ms_crc_header': 'true', 'rgw_zone': '', 'mds_root_ino_uid': '0', 'bluefs_min_log_runway': '1048576', 'bluestore_o_direct': 'true', 'run_dir': '/var/run/ceph', 'osd_mon_report_interval_max': '600', 'osd_bench_max_block_size': '67108864', 'debug_heartbeatmap': '1/5', 'osd_recovery_threads': '1', 'rados_mon_op_timeout': '0', 'mon_inject_transaction_delay_max': '10', 'rgw_enable_ops_log': 'false', 'lockdep': 'false', 'osd_journal_size': '5120', 'osd_max_attr_size': '0', 'rgw_gc_obj_min_wait': '7200', 'osd_inject_failure_on_pg_removal': 'false', 'cluster_network': '', 'rbd_concurrent_management_ops': '10', 'bluestore_wal_max_ops': '512', 'osd_tracing': 'false', 'osd_recovery_op_warn_multiple': '16', 'mds_bal_max': '-1', 'rgw_s3_auth_use_keystone': 'false', 'key': '', 'rbd_cache_writethrough_until_flush': 'true', 'bluestore_block_db_create': 'false', 'rgw_enable_quota_threads': 'true', 'public_addr': ':/0', 'osd_backfill_full_ratio': '0.85', 'ms_tcp_read_timeout': '900', 'rocksdb_separate_wal_dir': 'false', 'mds_kill_import_at': '0', 'osd_recovery_forget_lost_objects': 'false', 'ms_crc_data': 'true', 'osd_target_transaction_size': '30', 'mon_sync_debug_provider': '-1', 'osd_default_notify_timeout': '30', 'mon_cluster_log_to_syslog_facility': 'daemon', 'rgw_user_default_quota_max_objects': '-1', 'mon_stat_smooth_intervals': '2', 'debug_mds_log': '1/5', 'mds_mon_shutdown_timeout': '5', 'mds_debug_subtrees': 'false', 'debug_bluestore': '1/5', 'rgw_print_continue': 'true', 'osd_objectstore_tracing': 'false', 'mds_recall_state_timeout': '60', 'mon_force_standby_active': 'true', 'rgw_default_region_info_oid': 'default.region', 'mon_sync_fs_threshold': '5', 'mon_cache_target_full_warn_ratio': '0.66', 'bluestore_clone_cow': 'true', 'fuse_disable_pagecache': 'false', 'bluestore_wal_threads': '4', 'rbd_balance_snap_reads': 'false', 'client_mountpoint': '/', 'rgw_data_log_obj_prefix': 'data_log', 'rgw_keystone_admin_domain': '', 'osd_snap_trim_sleep': '0', 'bluestore_nid_prealloc': '1024', 'osd_client_watch_timeout': '30', 'mds_verify_backtrace': '1', 'debug_rbd': '0/5', 'osd_heartbeat_min_healthy_ratio': '0.33', 'rgw_data_log_changes_size': '1000', 'bluestore_min_alloc_size': '65536', 'mds_data': '/var/lib/ceph/mds/ceph-dhcp41-178', 'rgw_ldap_uri': 'ldaps://<ldap.your.domain>', 'rgw_keystone_implicit_tenants': 'false', 'rgw_obj_stripe_size': '4194304', 'bluestore_wal_thread_suicide_timeout': '120', 'osd_pool_default_flags': '0', 'cluster': 'ceph', 'mds_root_ino_gid': '0', 'rgw_num_async_rados_threads': '32', 'mds_kill_link_at': '0', 'filer_max_purge_ops': '10', 'ms_bind_port_max': '7300', 'client_inject_release_failure': 'false', 'bluestore_debug_prefragment_max': '1048576', 'rgw_gc_processor_period': '3600', 'mon_osd_full_ratio': '0.95', 'mds_blacklist_interval': '1440', 'osd_scrub_invalid_stats': 'true', 'osd_client_message_size_cap': '524288000', 'ms_inject_delay_type': '', 'clog_to_syslog': 'false', 'bluestore_fsck_on_mount': 'false', 'mds_kill_openc_at': '0', 'journal_throttle_low_threshhold': '0.6', 'rgw_get_obj_max_req_size': '4194304', 'debug_context': '0/1', 'osd_agent_slop': '0.02', 'ms_max_backoff': '15', 'rgw_period_push_interval': '2', 'osd_scrub_sleep': '0', 'osd_max_markdown_period': '600', 'osd_command_thread_suicide_timeout': '900', 'clog_to_graylog_port': '12201', 'bluefs_min_flush_size': '65536', 'osd_recovery_max_active': '3', 'async_compressor_thread_timeout': '5', 'mds_journal_format': '1', 'osd_recovery_thread_suicide_timeout': '300', 'debug_journal': '1/3', 'journal_block_align': 'true', 'debug_auth': '1/5', 'journal_throttle_high_threshhold': '0.9', 'rgw_defer_to_bucket_acls': '', 'journal_aio': 'true', 'xio_trace_mempool': 'false', 'rbd_blacklist_on_break_lock': 'true', 'monmap': '', 'mds_max_file_size': '1099511627776', 'rgw_relaxed_s3_bucket_names': 'false', 'mon_mds_skip_sanity': 'false', 'rgw_get_obj_window_size': '16777216', 'kstore_nid_prealloc': '1024', 'debug_paxos': '1/5', 'mds_cache_mid': '0.7', 'osd_op_queue': 'prio', 'mon_sync_debug': 'false', 'mds_max_completed_flushes': '100000', 'mds_standby_replay': 'false', 'osd_scrub_auto_repair': 'false', 'osd_auto_mark_unfound_lost': 'false', 'debug_ms': '0/5', 'mon_osd_auto_mark_new_in': 'true', 'mds_damage_table_max_entries': '10000', 'bdev_block_size': '4096', 'filestore_wbthrottle_xfs_bytes_hard_limit': '419430400', 'filestore_max_inline_xattrs': '0', 'osd_remove_thread_suicide_timeout': '36000', 'rgw_ldap_binddn': 'uid=admin,cn=users,dc=example,dc=com', 'osd_agent_hist_halflife': '1000', 'osd_tier_default_cache_min_read_recency_for_promote': '1', 'osd_map_max_advance': '150', 'mds_bal_min_start': '0.2', 'rgw_nfs_fhcache_partitions': '3', 'mon_osd_adjust_heartbeat_grace': 'true', 'rgw_obj_tombstone_cache_size': '1000', 'leveldb_compression': 'false', 'mon_client_ping_timeout': '30', 'rgw_keystone_revocation_interval': '900', 'rbd_cache_target_dirty': '16777216', 'mon_reweight_min_pgs_per_osd': '10', 'mds_revoke_cap_timeout': '60', 'filestore_omap_backend': 'leveldb', 'debug_throttle': '1/1', 'journal_discard': 'false', 'osd_pool_default_flag_hashpspool': 'true', 'osd_failsafe_full_ratio': '0.97', 'client_caps_release_delay': '5', 'mds_session_autoclose': '300', 'ms_bind_ipv6': 'false', 'mon_warn_on_legacy_crush_tunables': 'true', 'filestore_fail_eio': 'true', 'osd_bench_duration': '30', 'mds_bal_merge_rd': '1000', 'mon_osd_min_up_ratio': '0.3', 'client_oc_size': '209715200', 'filestore_op_thread_suicide_timeout': '180', 'filestore_max_inline_xattrs_xfs': '10', 'mds_bal_split_size': '10000', 'bdev_aio': 'true', 'mds_bal_target_removal_max': '10', 'mds_bal_min_rebalance': '0.1', 'rgw_user_max_buckets': '1000', 'debug_rgw': '1/5', 'client_oc_max_objects': '1000', 'bluestore_block_wal_create': 'false', 'bluestore_default_buffered_read': 'false', 'rbd_localize_parent_reads': 'true', 'mon_warn_not_deep_scrubbed': '0', 'mds_dump_cache_on_map': 'false', 'bdev_inject_crash': '0', 'fuse_debug': 'false', 'debug_mds': '1/5', 'filestore_rocksdb_options': '', 'osd_max_object_name_len': '2048', 'osd_recovery_max_chunk': '8388608', 'mon_debug_deprecated_as_obsolete': 'false', 'kinetic_user_id': '1', 'rbd_tracing': 'false', 'rbd_mirror_journal_max_fetch_bytes': '32768', 'rgw_ops_log_socket_path': '', 'mon_warn_on_old_mons': 'true', 'bluestore_inject_wal_apply_delay': '0', 'osd_pool_default_crush_replicated_ruleset': '0', 'mon_client_ping_interval': '10', 'osd_min_recovery_priority': '0', 'clog_to_monitors': 'default=true', 'rgw_intent_log_object_name_utc': 'false', 'heartbeat_interval': '5', 'osd_debug_inject_copyfrom_error': 'false', 'mon_sync_timeout': '60', 'mds_thrash_exports': '0', 'rbd_journal_object_flush_bytes': '0', 'rgw_opstate_ratelimit_sec': '30', 'compression_dir': '/usr/lib64/ceph/compressor', 'clog_to_graylog': 'false', 'rgw_md_log_max_shards': '64', 'osd_mon_heartbeat_interval': '30', 'kinetic_port': '8123', 'fsid': 'd1e34dd4-bcdb-47c7-9832-915e80fe3779', 'osd_pgp_bits': '6', 'osd_copyfrom_max_chunk': '8388608', 'kstore_default_stripe_size': '65536', 'ms_pq_min_cost': '65536', 'mds_scatter_nudge_interval': '5', 'kstore_backend': 'rocksdb', 'bluestore_bluefs_min_ratio': '0.02', 'mds_log_segment_size': '0', 'mon_scrub_interval': '86400', 'mds_skip_ino': '0', 'mon_host': '', 'filestore_expected_throughput_ops': '200', 'client_metadata': '', 'osd_recovery_delay_start': '0', 'mon_osd_min_in_ratio': '0.3', 'clog_to_syslog_level': 'info', 'rgw_mime_types_file': '/etc/mime.types', 'fuse_require_active_mds': 'true', 'mds_thrash_fragments': '0', 'mon_osd_prime_pg_temp_max_time': '0.5', 'client_dirsize_rbytes': 'true', 'ms_pq_max_tokens_per_priority': '16777216', 'rgw_copy_obj_progress_every_bytes': '1048576', 'bluestore_fid_prealloc': '1024', 'debug_mon': '1/5', 'debug_optracker': '0/5', 'memstore_page_size': '65536', 'osd_scrub_auto_repair_num_errors': '5', 'osd_max_object_size': '107374182400', 'ms_inject_socket_failures': '0', 'mds_default_dir_hash': '2', 'cephx_sign_messages': 'true', 'osd_min_pg_log_entries': '3000', 'journal_block_size': '4096', 'osd_agent_quantize_effort': '0.1', 'rgw_objexp_time_step': '4096', 'rgw_zone_root_pool': '.rgw.root', 'filestore_max_inline_xattrs_other': '2', 'filestore_seek_data_hole': 'false', 'rgw_default_realm_info_oid': 'default.realm', 'filestore_debug_verify_split': 'false', 'filestore_max_sync_interval': '5', 'objecter_inflight_ops': '1024', 'journal_replay_from': '0', 'rgw_script_uri': '', 'rgw_bucket_default_quota_max_size': '-1', 'debug_objectcacher': '0/5', 'bluestore_block_wal_path': '', 'osd_pool_default_erasure_code_profile': 'plugin=jerasure technique=reed_sol_van k=2 m=1 ', 'ms_tcp_prefetch_max_size': '4096', 'journal_align_min_size': '65536', 'ms_dump_on_send': 'false', 'osd_disk_threads': '1', 'osd_command_thread_timeout': '600', 'rbd_op_threads': '1', 'journal_dio': 'true', 'osd_uuid': '00000000-0000-0000-0000-000000000000', 'ms_bind_port_min': '6800', 'rgw_s3_auth_use_ldap': 'false', 'rgw_ops_log_data_backlog': '5242880', 'osd_max_attr_name_len': '100', 'mon_delta_reset_interval': '10', 'rbd_mirror_journal_commit_age': '5', 'osd_objectstore': 'filestore', 'rgw_override_bucket_index_max_shards': '0', 'filestore_wbthrottle_xfs_ios_hard_limit': '5000', 'paxos_propose_interval': '1', 'filestore_wbthrottle_btrfs_inodes_start_flusher': '500', 'client_debug_getattr_caps': 'false', 'xio_mp_min': '128', 'rgw_swift_auth_entry': 'auth', 'debug_xio': '1/5', 'rbd_mirror_sync_point_update_age': '30', 'rbd_default_features': '61', 'log_max_new': '1000', 'paxos_service_trim_min': '250', 'mds_bal_need_min': '0.8', 'mds_bal_sample_interval': '3', 'rgw_max_slo_entries': '1000', 'ms_bind_retry_delay': '5', 'err_to_stderr': 'true', 'filestore_zfs_snap': 'false', 'filestore_max_inline_xattrs_btrfs': '10', 'rbd_cache_block_writes_upfront': 'false', 'rgw_cache_enabled': 'true', 'journal_write_header_frequency': '0', 'setgroup': 'ceph', 'rbd_default_stripe_unit': '0', 'bluestore_block_db_size': '0', 'filestore_expected_throughput_bytes': '2.09715e+08', 'leveldb_log': '', 'rbd_cache': 'true', 'filestore_journal_writeahead': 'false', 'rgw_remote_addr_param': 'REMOTE_ADDR', 'leveldb_paranoid': 'false', 'debug_finisher': '1/1', 'bluestore_sync_wal_apply': 'true', 'osd_default_data_pool_replay_window': '45', 'debug_rocksdb': '4/5', 'mon_pg_check_down_all_threshold': '0.5', 'debug_bdev': '1/3', 'osd_max_object_namespace_len': '256', 'rbd_cache_max_dirty': '25165824', 'threadpool_default_timeout': '60', 'mon_pg_warn_max_per_osd': '300', 'mds_max_purge_ops': '8192', 'osd_pg_max_concurrent_snap_trims': '2', 'rgw_user_default_quota_max_size': '-1', 'mon_lease_ack_timeout_factor': '2', 'rgw_dns_s3website_name': '', 'client_snapdir': '.snap', 'rgw_sync_lease_period': '120', 'osd_debug_pg_log_writeout': 'false', 'rgw_period_root_pool': '.rgw.root', 'rados_tracing': 'false', 'filestore_index_retry_probability': '0', 'rgw_md_notify_interval_msec': '200', 'osd_scrub_end_hour': '24', 'osd_pool_default_crush_rule': '-1', 'osd_op_history_size': '20', 'debug_filer': '0/1', 'mon_allow_pool_delete': 'true', 'rgw_enforce_swift_acls': 'true', 'rgw_user_quota_sync_wait_time': '86400', 'rados_osd_op_timeout': '0', 'rbd_default_map_options': '', 'rgw_curl_wait_timeout_ms': '1000', 'client_acl_type': '', 'osd_op_threads': '2', 'debug_rbd_mirror': '0/5', 'osd_map_share_max_epochs': '100', 'rgw_replica_log_obj_prefix': 'replica_log', 'mon_slurp_timeout': '10', 'filestore_fadvise': 'true', 'rgw_request_uri': '', 'mds_client_prealloc_inos': '1000', 'rbd_localize_snap_reads': 'false', 'rgw_max_chunk_size': '524288', 'osd_recover_clone_overlap': 'true', 'log_flush_on_exit': 'true', 'client_mount_uid': '-1', 'rbd_blacklist_expire_seconds': '0', 'filestore_btrfs_snap': 'true', 'osd_pool_default_pgp_num': '8', 'rgw_multipart_part_upload_limit': '10000', 'mds_bal_interval': '10', 'osd_pool_default_cache_max_evict_check_size': '10', 'osd_tier_promote_max_objects_sec': '5242880', 'fuse_use_invalidate_cb': 'true', 'osd_op_num_threads_per_shard': '2', 'osd_push_per_object_cost': '1000', 'mds_shutdown_check': '0', 'osd_scrub_begin_hour': '0', 'mds_standby_for_rank': '-1', 'osd_pool_default_size': '3', 'osd_bench_small_size_max_iops': '100', 'debug_mds_migrator': '1/5', 'leveldb_compact_on_mount': 'false', 'osd_pool_default_cache_target_dirty_ratio': '0.4', 'plugin_dir': '/usr/lib64/ceph', 'rgw_nfs_lru_lane_hiwat': '911', 'mon_sync_requester_kill_at': '0', 'osd_op_queue_cut_off': 'low', 'mds_cache_size': '100000', 'rbd_journal_commit_age': '5', 'rgw_enable_gc_threads': 'true', 'debug_client': '0/5', 'rgw_realm': '', 'filestore_wbthrottle_btrfs_bytes_hard_limit': '419430400', 'rgw_s3_auth_use_rados': 'true', 'rocksdb_block_size': '4096', 'bluestore_bluefs_max_ratio': '0.9', 'mds_log_events_per_segment': '1024', 'mon_data_size_warn': '16106127360', 'mds_sessionmap_keys_per_op': '1024', 'mon_cluster_log_to_graylog': 'false', 'rgw_enable_apis': 's3, s3website, swift, swift_auth, admin', 'ms_dispatch_throttle_bytes': '104857600', 'debug_fuse': '1/5', 'leveldb_write_buffer_size': '33554432', 'bluefs_max_prefetch': '1048576', 'osd_backfill_scan_min': '64', 'nss_db_path': '', 'rgw_op_thread_suicide_timeout': '0', 'mds_log_max_expiring': '20', 'rgw_enable_static_website': 'false', 'debug_deliberately_leak_memory': 'false', 'restapi_log_level': '', 'osd_op_num_shards': '5', 'rgw_keystone_admin_project': '', 'osd_pool_default_cache_min_flush_age': '0', 'leveldb_cache_size': '536870912', 'memstore_device_bytes': '1073741824', 'bluestore_cache_tails': 'true', 'rgw_copy_obj_progress': 'true', 'bluestore_fail_eio': 'true', 'mon_cluster_log_to_graylog_port': '12201', 'osd_recovery_max_single_start': '1', 'mds_log': 'true', 'osd_pool_default_cache_min_evict_age': '0', 'osd_debug_skip_full_check_in_backfill_reservation': 'false', 'mds_op_history_duration': '600', 'rgw_usage_max_user_shards': '1', 'debug_perfcounter': '1/5', 'mon_sync_max_payload_size': '1048576', 'filestore_queue_max_ops': '50', 'rgw_region': '', 'debug_newstore': '1/5', 'mds_max_purge_ops_per_pg': '0.5', 'osd_scrub_min_interval': '86400', 'osd_max_pg_blocked_by': '16', 'mds_beacon_interval': '4', 'rgw_run_sync_thread': 'true', 'bdev_nvme_retry_count': '-1', 'rgw_resolve_cname': 'false', 'rbd_mirror_journal_poll_age': '5', 'osd_client_op_priority': '63', 'rgw_keystone_admin_user': '', 'mds_reconnect_timeout': '45', 'setuser': 'ceph', 'kinetic_use_ssl': 'false', 'osd_deep_scrub_interval': '604800', 'bluestore_overlay_max_length': '65536', 'client_tick_interval': '1', 'osd_heartbeat_min_peers': '10', 'filestore_max_xattr_value_size_btrfs': '65536', 'bluefs_log_compact_min_ratio': '5', 'osd_crush_chooseleaf_type': '1', 'osd_erasure_code_plugins': 'jerasure lrc isa', 'osd_snap_trim_cost': '1048576', 'mon_globalid_prealloc': '10000', 'bluestore_bluefs': 'true', 'kstore_max_bytes': '67108864', 'bluestore_debug_misc': 'false', 'bluestore_wal_thread_timeout': '30', 'debug_bluefs': '1/5', 'rgw_data_log_num_shards': '128', 'bluestore_sync_transaction': 'false', 'ms_die_on_old_message': 'false', 'auth_supported': '', 'rgw_thread_pool_size': '100', 'bdev_aio_max_queue_depth': '32', 'filestore_fiemap': 'false'}"
                    },
                    "osd_map": {
                        "version": "33",
                        "when": "2016-11-23 09:58:29.343758+00:00",
                        "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
                        "cluster_name": "ceph",
                        "data": "{'pool_max': 0, 'erasure_code_profiles': {'default': {'k': '2', 'technique': 'reed_sol_van', 'm': '1', 'plugin': 'jerasure'}}, 'max_osd': 4, 'created': '2016-11-18 15:59:51.693774', 'crush_map_text': '# begin crush map\\ntunable choose_local_tries 0\\ntunable choose_local_fallback_tries 0\\ntunable choose_total_tries 50\\ntunable chooseleaf_descend_once 1\\ntunable chooseleaf_vary_r 1\\ntunable straw_calc_version 1\\n\\n# devices\\ndevice 0 osd.0\\ndevice 1 osd.1\\ndevice 2 osd.2\\ndevice 3 osd.3\\n\\n# types\\ntype 0 osd\\ntype 1 host\\ntype 2 chassis\\ntype 3 rack\\ntype 4 row\\ntype 5 pdu\\ntype 6 pod\\ntype 7 room\\ntype 8 datacenter\\ntype 9 region\\ntype 10 root\\n\\n# buckets\\nhost dhcp41-176 {\\n\\tid -2\\t\\t# do not change unnecessarily\\n\\t# weight 0.566\\n\\talg straw\\n\\thash 0\\t# rjenkins1\\n\\titem osd.0 weight 0.283\\n\\titem osd.2 weight 0.283\\n}\\nhost dhcp43-2 {\\n\\tid -3\\t\\t# do not change unnecessarily\\n\\t# weight 0.566\\n\\talg straw\\n\\thash 0\\t# rjenkins1\\n\\titem osd.1 weight 0.283\\n\\titem osd.3 weight 0.283\\n}\\nroot default {\\n\\tid -1\\t\\t# do not change unnecessarily\\n\\t# weight 1.132\\n\\talg straw\\n\\thash 0\\t# rjenkins1\\n\\titem dhcp41-176 weight 0.566\\n\\titem dhcp43-2 weight 0.566\\n}\\n\\n# rules\\nrule replicated_ruleset {\\n\\truleset 0\\n\\ttype replicated\\n\\tmin_size 1\\n\\tmax_size 10\\n\\tstep take default\\n\\tstep chooseleaf firstn 0 type host\\n\\tstep emit\\n}\\n\\n# end crush map\\n', 'crush': {'rules': [{'min_size': 1, 'rule_name': 'replicated_ruleset', 'steps': [{'item_name': 'default', 'item': -1, 'op': 'take'}, {'num': 0, 'type': 'host', 'op': 'chooseleaf_firstn'}, {'op': 'emit'}], 'ruleset': 0, 'type': 1, 'rule_id': 0, 'max_size': 10}], 'tunables': {'profile': 'firefly', 'minimum_required_version': 'firefly', 'has_v3_rules': 0, 'require_feature_tunables5': 0, 'choose_total_tries': 50, 'require_feature_tunables3': 1, 'legacy_tunables': 0, 'chooseleaf_descend_once': 1, 'has_v4_buckets': 0, 'chooseleaf_stable': 0, 'choose_local_fallback_tries': 0, 'has_v2_rules': 0, 'straw_calc_version': 1, 'allowed_bucket_algs': 22, 'optimal_tunables': 0, 'has_v5_rules': 0, 'require_feature_tunables2': 1, 'choose_local_tries': 0, 'chooseleaf_vary_r': 1, 'require_feature_tunables': 1}, 'buckets': [{'hash': 'rjenkins1', 'name': 'default', 'weight': 1.13238525390625, 'type_id': 10, 'alg': 'straw', 'type_name': 'root', 'items': [{'id': -2, 'weight': 0.566192626953125, 'pos': 0}, {'id': -3, 'weight': 0.566192626953125, 'pos': 1}], 'id': -1}, {'hash': 'rjenkins1', 'name': 'dhcp41-176', 'weight': 0.566192626953125, 'type_id': 1, 'alg': 'straw', 'type_name': 'host', 'items': [{'id': 0, 'weight': 0.2830963134765625, 'pos': 0}, {'id': 2, 'weight': 0.2830963134765625, 'pos': 1}], 'id': -2}, {'hash': 'rjenkins1', 'name': 'dhcp43-2', 'weight': 0.566192626953125, 'type_id': 1, 'alg': 'straw', 'type_name': 'host', 'items': [{'id': 1, 'weight': 0.2830963134765625, 'pos': 0}, {'id': 3, 'weight': 0.2830963134765625, 'pos': 1}], 'id': -3}], 'devices': [{'id': 0, 'name': 'osd.0'}, {'id': 1, 'name': 'osd.1'}, {'id': 2, 'name': 'osd.2'}, {'id': 3, 'name': 'osd.3'}], 'types': [{'name': 'osd', 'type_id': 0}, {'name': 'host', 'type_id': 1}, {'name': 'chassis', 'type_id': 2}, {'name': 'rack', 'type_id': 3}, {'name': 'row', 'type_id': 4}, {'name': 'pdu', 'type_id': 5}, {'name': 'pod', 'type_id': 6}, {'name': 'room', 'type_id': 7}, {'name': 'datacenter', 'type_id': 8}, {'name': 'region', 'type_id': 9}, {'name': 'root', 'type_id': 10}]}, 'tree': {'nodes': [{'id': -1, 'type': 'root', 'children': [-3, -2], 'name': 'default', 'type_id': 10}, {'id': -2, 'type': 'host', 'children': [2, 0], 'name': 'dhcp41-176', 'type_id': 1}, {'status': 'up', 'name': 'osd.0', 'exists': 1, 'reweight': 1.0, 'type_id': 0, 'crush_weight': 0.283096, 'primary_affinity': 1.0, 'depth': 2, 'type': 'osd', 'id': 0}, {'status': 'up', 'name': 'osd.2', 'exists': 1, 'reweight': 1.0, 'type_id': 0, 'crush_weight': 0.283096, 'primary_affinity': 1.0, 'depth': 2, 'type': 'osd', 'id': 2}, {'id': -3, 'type': 'host', 'children': [3, 1], 'name': 'dhcp43-2', 'type_id': 1}, {'status': 'up', 'name': 'osd.1', 'exists': 1, 'reweight': 1.0, 'type_id': 0, 'crush_weight': 0.283096, 'primary_affinity': 1.0, 'depth': 2, 'type': 'osd', 'id': 1}, {'status': 'up', 'name': 'osd.3', 'exists': 1, 'reweight': 1.0, 'type_id': 0, 'crush_weight': 0.283096, 'primary_affinity': 1.0, 'depth': 2, 'type': 'osd', 'id': 3}], 'stray': []}, 'modified': '2016-11-23 11:24:53.479883', 'osd_xinfo': [{'laggy_probability': 0.0, 'laggy_interval': 0, 'features': 576460752032874495, 'old_weight': 65536, 'down_stamp': '2016-11-19 15:39:13.776574', 'osd': 0}, {'laggy_probability': 0.0, 'laggy_interval': 0, 'features': 576460752032874495, 'old_weight': 0, 'down_stamp': '2016-11-23 11:24:50.111321', 'osd': 1}, {'laggy_probability': 0.0, 'laggy_interval': 0, 'features': 576460752032874495, 'old_weight': 65536, 'down_stamp': '2016-11-19 15:39:18.786638', 'osd': 2}, {'laggy_probability': 0.0, 'laggy_interval': 0, 'features': 576460752032874495, 'old_weight': 65536, 'down_stamp': '2016-11-19 15:43:38.812004', 'osd': 3}], 'osds': [{'down_at': 18, 'uuid': '7af85b7f-7ef8-4029-8a51-7db872ce6942', 'weight': 1.0, 'primary_affinity': 1.0, 'heartbeat_front_addr': '10.70.41.176:6807/2761', 'heartbeat_back_addr': '10.70.41.176:6806/2761', 'up': 1, 'lost_at': 0, 'up_from': 27, 'state': ['exists', 'up'], 'last_clean_begin': 6, 'last_clean_end': 17, 'in': 1, 'public_addr': '10.70.41.176:6804/2761', 'up_thru': 32, 'cluster_addr': '10.70.41.176:6805/2761', 'osd': 0}, {'down_at': 29, 'uuid': '6512b6bb-9ebe-40c5-ad3c-dae8159ddeda', 'weight': 1.0, 'primary_affinity': 1.0, 'heartbeat_front_addr': '10.70.43.2:6803/1691', 'heartbeat_back_addr': '10.70.43.2:6802/1691', 'up': 1, 'lost_at': 0, 'up_from': 30, 'state': ['exists', 'up'], 'last_clean_begin': 7, 'last_clean_end': 17, 'in': 1, 'public_addr': '10.70.43.2:6800/1691', 'up_thru': 31, 'cluster_addr': '10.70.43.2:6801/1691', 'osd': 1}, {'down_at': 19, 'uuid': '495ee56e-c617-4934-bc93-7766c7fb8e9f', 'weight': 1.0, 'primary_affinity': 1.0, 'heartbeat_front_addr': '10.70.41.176:6803/1664', 'heartbeat_back_addr': '10.70.41.176:6802/1664', 'up': 1, 'lost_at': 0, 'up_from': 25, 'state': ['exists', 'up'], 'last_clean_begin': 13, 'last_clean_end': 17, 'in': 1, 'public_addr': '10.70.41.176:6800/1664', 'up_thru': 32, 'cluster_addr': '10.70.41.176:6801/1664', 'osd': 2}, {'down_at': 20, 'uuid': '5395184e-5cbf-4574-8e50-7160bc0d9ed6', 'weight': 1.0, 'primary_affinity': 1.0, 'heartbeat_front_addr': '10.70.43.2:6807/2765', 'heartbeat_back_addr': '10.70.43.2:6806/2765', 'up': 1, 'lost_at': 0, 'up_from': 31, 'state': ['exists', 'up'], 'last_clean_begin': 15, 'last_clean_end': 17, 'in': 1, 'public_addr': '10.70.43.2:6804/2765', 'up_thru': 32, 'cluster_addr': '10.70.43.2:6805/2765', 'osd': 3}], 'blacklist': {}, 'epoch': 33, 'pg_temp': [{'pgid': '0.0', 'osds': [0, 3, 1]}, {'pgid': '0.1', 'osds': [3, 2, 1]}, {'pgid': '0.2', 'osds': [3, 0, 1]}, {'pgid': '0.3', 'osds': [1, 2, 0]}, {'pgid': '0.4', 'osds': [3, 2, 1]}, {'pgid': '0.5', 'osds': [0, 3, 1]}, {'pgid': '0.7', 'osds': [2, 1, 0]}, {'pgid': '0.8', 'osds': [3, 0, 2]}, {'pgid': '0.9', 'osds': [2, 3, 1]}, {'pgid': '0.b', 'osds': [2, 3, 1]}, {'pgid': '0.c', 'osds': [3, 2, 0]}, {'pgid': '0.e', 'osds': [2, 3, 1]}, {'pgid': '0.f', 'osds': [2, 3, 1]}, {'pgid': '0.10', 'osds': [0, 3, 1]}, {'pgid': '0.11', 'osds': [3, 0, 1]}, {'pgid': '0.13', 'osds': [3, 2, 0]}, {'pgid': '0.14', 'osds': [2, 1, 0]}, {'pgid': '0.15', 'osds': [2, 1, 0]}, {'pgid': '0.19', 'osds': [0, 3, 1]}, {'pgid': '0.1a', 'osds': [3, 0, 1]}, {'pgid': '0.1c', 'osds': [3, 0, 1]}, {'pgid': '0.1e', 'osds': [1, 2, 0]}, {'pgid': '0.20', 'osds': [3, 0, 2]}, {'pgid': '0.21', 'osds': [3, 0, 1]}, {'pgid': '0.22', 'osds': [3, 2, 1]}, {'pgid': '0.23', 'osds': [3, 2, 1]}, {'pgid': '0.25', 'osds': [3, 0, 2]}, {'pgid': '0.26', 'osds': [2, 3, 1]}, {'pgid': '0.27', 'osds': [0, 3, 1]}, {'pgid': '0.28', 'osds': [2, 1, 0]}, {'pgid': '0.2a', 'osds': [0, 3, 1]}, {'pgid': '0.2e', 'osds': [2, 3, 1]}, {'pgid': '0.2f', 'osds': [2, 3, 1]}, {'pgid': '0.30', 'osds': [3, 0, 2]}, {'pgid': '0.31', 'osds': [0, 3, 1]}, {'pgid': '0.32', 'osds': [2, 3, 1]}, {'pgid': '0.33', 'osds': [3, 0, 2]}, {'pgid': '0.34', 'osds': [1, 2, 0]}, {'pgid': '0.36', 'osds': [1, 2, 0]}, {'pgid': '0.37', 'osds': [1, 2, 0]}, {'pgid': '0.38', 'osds': [3, 0, 2]}, {'pgid': '0.39', 'osds': [3, 2, 1]}, {'pgid': '0.3a', 'osds': [2, 1, 0]}, {'pgid': '0.3b', 'osds': [2, 1, 0]}, {'pgid': '0.3c', 'osds': [1, 2, 0]}, {'pgid': '0.3d', 'osds': [2, 1, 0]}, {'pgid': '0.3e', 'osds': [2, 3, 1]}, {'pgid': '0.3f', 'osds': [2, 1, 0]}], 'flags': 'sortbitwise', 'cluster_snapshot': '', 'pools': [{'cache_target_full_ratio_micro': 0, 'fast_read': False, 'stripe_width': 0, 'flags_names': 'hashpspool', 'tier_of': -1, 'cache_min_evict_age': 0, 'pg_placement_num': 64, 'use_gmt_hitset': True, 'quota_max_bytes': 0, 'erasure_code_profile': '', 'min_write_recency_for_promote': 0, 'expected_num_objects': 0, 'size': 3, 'snap_seq': 0, 'auid': 0, 'cache_min_flush_age': 0, 'hit_set_period': 0, 'min_read_recency_for_promote': 0, 'target_max_objects': 0, 'pg_num': 64, 'type': 1, 'crush_ruleset': 0, 'pool_name': 'rbd', 'hit_set_grade_decay_rate': 0, 'snap_mode': 'selfmanaged', 'tiers': [], 'min_size': 2, 'target_max_bytes': 0, 'crash_replay_interval': 0, 'object_hash': 2, 'write_tier': -1, 'cache_target_dirty_ratio_micro': 0, 'pool': 0, 'removed_snaps': '[]', 'cache_mode': 'none', 'hit_set_params': {'type': 'none'}, 'last_change': '1', 'pool_snaps': [], 'quota_max_objects': 0, 'hit_set_count': 0, 'flags': 1, 'cache_target_dirty_high_ratio_micro': 0, 'snap_epoch': 0, 'hit_set_search_last_n': 0, 'grade_table': [], 'last_force_op_resend': '0', 'options': {}, 'read_tier': -1}], 'primary_temp': [], 'osd_metadata': [{'backend_filestore_partition_path': 'unknown', 'kernel_description': '#1 SMP Mon Jun 30 12:09:22 UTC 2014', 'distro_version': '7.0.1406', 'back_addr': '10.70.41.176:6805/2761', 'id': 0, 'distro_codename': 'Core', 'hostname': 'dhcp41-176.lab.eng.blr.redhat.com', 'osd': 0, 'mem_swap_kb': '2129916', 'backend_filestore_dev_node': 'unknown', 'ceph_version': 'ceph version 10.2.3 (ecc23778eb545d8dd55e2e4735b53cc93f92e65b)', 'distro': 'CentOS', 'hb_back_addr': '10.70.41.176:6806/2761', 'osd_objectstore': 'filestore', 'osd_data': '/var/lib/ceph/osd/ceph-0', 'arch': 'x86_64', 'hb_front_addr': '10.70.41.176:6807/2761', 'distro_description': 'CentOS Linux release 7.0.1406 (Core) ', 'filestore_backend': 'xfs', 'front_addr': '10.70.41.176:6804/2761', 'kernel_version': '3.10.0-123.el7.x86_64', 'osd_journal': '/var/lib/ceph/osd/ceph-0/journal', 'filestore_f_type': '0x58465342', 'mem_total_kb': '1016188', 'os': 'Linux', 'cpu': 'Intel Xeon E312xx (Sandy Bridge)'}, {'backend_filestore_partition_path': 'unknown', 'kernel_description': '#1 SMP Mon Jun 30 12:09:22 UTC 2014', 'distro_version': '7.0.1406', 'back_addr': '10.70.43.2:6801/1691', 'id': 1, 'distro_codename': 'Core', 'hostname': 'dhcp43-2.lab.eng.blr.redhat.com', 'osd': 1, 'mem_swap_kb': '2129916', 'backend_filestore_dev_node': 'unknown', 'ceph_version': 'ceph version 10.2.3 (ecc23778eb545d8dd55e2e4735b53cc93f92e65b)', 'distro': 'CentOS', 'hb_back_addr': '10.70.43.2:6802/1691', 'osd_objectstore': 'filestore', 'osd_data': '/var/lib/ceph/osd/ceph-1', 'arch': 'x86_64', 'hb_front_addr': '10.70.43.2:6803/1691', 'distro_description': 'CentOS Linux release 7.0.1406 (Core) ', 'filestore_backend': 'xfs', 'front_addr': '10.70.43.2:6800/1691', 'kernel_version': '3.10.0-123.el7.x86_64', 'osd_journal': '/var/lib/ceph/osd/ceph-1/journal', 'filestore_f_type': '0x58465342', 'mem_total_kb': '1016188', 'os': 'Linux', 'cpu': 'Intel Xeon E312xx (Sandy Bridge)'}, {'backend_filestore_partition_path': 'unknown', 'kernel_description': '#1 SMP Mon Jun 30 12:09:22 UTC 2014', 'distro_version': '7.0.1406', 'back_addr': '10.70.41.176:6801/1664', 'id': 2, 'distro_codename': 'Core', 'hostname': 'dhcp41-176.lab.eng.blr.redhat.com', 'osd': 2, 'mem_swap_kb': '2129916', 'backend_filestore_dev_node': 'unknown', 'ceph_version': 'ceph version 10.2.3 (ecc23778eb545d8dd55e2e4735b53cc93f92e65b)', 'distro': 'CentOS', 'hb_back_addr': '10.70.41.176:6802/1664', 'osd_objectstore': 'filestore', 'osd_data': '/var/lib/ceph/osd/ceph-2', 'arch': 'x86_64', 'hb_front_addr': '10.70.41.176:6803/1664', 'distro_description': 'CentOS Linux release 7.0.1406 (Core) ', 'filestore_backend': 'xfs', 'front_addr': '10.70.41.176:6800/1664', 'kernel_version': '3.10.0-123.el7.x86_64', 'osd_journal': '/var/lib/ceph/osd/ceph-2/journal', 'filestore_f_type': '0x58465342', 'mem_total_kb': '1016188', 'os': 'Linux', 'cpu': 'Intel Xeon E312xx (Sandy Bridge)'}, {'backend_filestore_partition_path': 'unknown', 'kernel_description': '#1 SMP Mon Jun 30 12:09:22 UTC 2014', 'distro_version': '7.0.1406', 'back_addr': '10.70.43.2:6805/2765', 'id': 3, 'distro_codename': 'Core', 'hostname': 'dhcp43-2.lab.eng.blr.redhat.com', 'osd': 3, 'mem_swap_kb': '2129916', 'backend_filestore_dev_node': 'unknown', 'ceph_version': 'ceph version 10.2.3 (ecc23778eb545d8dd55e2e4735b53cc93f92e65b)', 'distro': 'CentOS', 'hb_back_addr': '10.70.43.2:6806/2765', 'osd_objectstore': 'filestore', 'osd_data': '/var/lib/ceph/osd/ceph-3', 'arch': 'x86_64', 'hb_front_addr': '10.70.43.2:6807/2765', 'distro_description': 'CentOS Linux release 7.0.1406 (Core) ', 'filestore_backend': 'xfs', 'front_addr': '10.70.43.2:6804/2765', 'kernel_version': '3.10.0-123.el7.x86_64', 'osd_journal': '/var/lib/ceph/osd/ceph-3/journal', 'filestore_f_type': '0x58465342', 'mem_total_kb': '1016188', 'os': 'Linux', 'cpu': 'Intel Xeon E312xx (Sandy Bridge)'}], 'fsid': 'd1e34dd4-bcdb-47c7-9832-915e80fe3779'}",
                        "fsid": "d1e34dd4-bcdb-47c7-9832-915e80fe3779",
                        "sync_type": "osd_map",
                        "updated": "1479895109.34"
                    },
                    "mon_map": {
                        "sync_type": "mon_map",
                        "updated": "1479895109.4",
                        "version": "1",
                        "when": "2016-11-23 09:58:29.398592+00:00",
                        "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
                        "cluster_name": "ceph",
                        "data": "{'quorum': [0], 'created': '2016-11-18 15:59:49.592801', 'modified': '2016-11-18 15:59:49.592801', 'epoch': 1, 'mons': [{'name': 'dhcp41-178', 'rank': 0, 'addr': '10.70.41.178:6789/0'}], 'fsid': 'd1e34dd4-bcdb-47c7-9832-915e80fe3779'}",
                        "fsid": "d1e34dd4-bcdb-47c7-9832-915e80fe3779"
                    }
                },
                "pools": {
                    "0": {
                        "cluster_id": "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
                        "min_size": "2",
                        "pg_num": "64",
                        "pool_id": "0",
                        "poolname": "rbd",
                        "updated": "1479895109.37"
                    }
                }
            },
            "stats": {
                "alert_cnt": 10,
                "storage": {
                    "total": 42949672960,
                    "used": 8589934592,
                    "updated_at": "2016-12-19T23:12:51.278616",
                    "percent-used": 20
                },
                "cpu": {
                    "updated_at": "2016-12-19T23:12:51.278516",
                    "percent-used": 4.5
                },
                "memory": {
                    "total": 4294967296,
                    "used": 2147483648,
                    "updated_at": "2016-12-19T23:12:51.278593",
                    "percent-used": 50
                }
            }
        }],

        formattedOutput: [{
            alertCount: 10,
            hostCount: "NA",
            id: "8b0c637d-f5f7-40f6-acd9-50d5feb5f4b3",
            iops: "IOPS-NA",
            name: "zats",
            poolCount: "NA",
            status: "NA",
            storage: {
                'percent-used': 20,
                total: 42949672960,
                updated_at: "2016-12-19T23:12:51.278616",
                used: 8589934592
            }
        }]
    });

})();
