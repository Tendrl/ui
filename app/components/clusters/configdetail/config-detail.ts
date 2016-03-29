// <reference path="../typings/tsd.d.ts" />

import {ClusterService} from '../../rest/clusters';

export class ConfigDetailController {
    private id: string;
    private configData: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        'ClusterService'
    ];

    constructor(private clusterService: ClusterService) {
        this.configData = {};
        this.clusterService.getClusterConfig(this.id).then((cluster_config: any) => {
            this.configData = cluster_config;
        });
    }
}
