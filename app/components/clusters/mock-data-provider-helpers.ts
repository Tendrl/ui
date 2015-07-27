// <reference path="../typings/tsd.d.ts" />
export class MockDataProvider {
    // When cluster name will not match with any exist object , than this will be by default cluster.
    private byDefaultCluster: any = {
        clusterName: "default",
        alerts: 0,
        areaSplineValues: [{ '1': 2 }, { '1': 12 }, { '1': 50 }, { '1': 60 }, { '1': 90 }],
        gaugeValues: [{ '1': 10 }],
        cpu: {
            average: 45,
            highest: 90,
            lowest: 3
        },
        memory: {
            average: 81,
            highest: 85,
            lowest: 8
        },
        managementNetwork: {
            inbound: _.random(3, 10),
            outbound: _.random(13, 25),
        },
        clusterNetwork: {
            inbound: _.random(10, 20),
            outbound: _.random(25, 40),
        }
    };  
        
    //When volume name will not match with any exist object , than this will be by default volume.
    private byDefaultVolume: any = {
        volumeName: "default",
        areaSplineValues: [{ '1': 2 }, { '1': 12 }, { '1': 50 }, { '1': 60 }, { '1': 90 }],
        alerts: 0
    };
        
    // When host name will not match with any exist object , than this will be by default host.
    private byDefaultHost: any = {
        nodeName: "default",
        alerts: 0,
    };
        
    // Mock clusters with hard coded data.
    private mockClusters: any = [
        {
            clusterName: "Cluster10",
            alerts: 0,
            areaSplineValues: [{ '1': 5 }, { '1': 9 }, { '1': 50 }, { '1': 80 }, { '1': 82 }],
            cpu: {
                average: 28,
                highest: 79,
                lowest: 5
            },
            memory: {
                average: 84,
                highest: 91,
                lowest: 45
            },
            managementNetwork: {
                inbound: 305,
                outbound: 250
            },
            clusterNetwork: {
                inbound: 311,
                outbound: 288
            }
        },
        {
            clusterName: "Cluster11",
            alerts: 1,
            areaSplineValues: [{ '1': 2 }, { '1': 5 }, { '1': 20 }, { '1': 30 }, { '1': 60 }],
            cpu: {
                average: 85,
                highest: 95,
                lowest: 26
            },
            memory: {
                average: 38,
                highest: 84,
                lowest: 5
            },
            managementNetwork: {
                inbound: 320,
                outbound: 300
            },
            clusterNetwork: {
                inbound: 421,
                outbound: 312
            }
        }
    ];
        
    // Mock volumes with hard coded data.
    private mockVolumes: any = [
        {
            volumeNname: "v1",
            areaSplineValues: [{ '1': 2 }, { '1': 12 }, { '1': 50 }, { '1': 60 }, { '1': 90 }],
            alerts: 0
        },
        {
            volumeName: "v2",
            areaSplineValues: [{ '1': 4 }, { '1': 8 }, { '1': 40 }, { '1': 60 }, { '1': 60 }],
            alerts: 4
        }
    ];
        
    // Mock hosts with hard coded data.
    private mockHosts: any = [
        {
            nodeName: "dhcp42-159.lab.eng.blr.redhat.com",
            alerts: 0,
        },
        {
            nodeName: "dhcp42-135.lab.eng.blr.redhat.com",
            alerts: 2,
        },
        {
            nodeName: "dhcp42-41.lab.eng.blr.redhat.com",
            alerts: 3,
        },
        {
            nodeName: "dhcp42-208.lab.eng.blr.redhat.com",
            alerts: 0,
        }
    ];
        
    /**
     *  **@returns** a cluster object with the cluster name for the specific
     */
    public getMockCluster(clusterName) {
        var tempCluster: any = _.find(this.mockClusters, (cluster: any) => {
            return cluster.clusterName === clusterName;
        });
        return tempCluster === undefined ? this.byDefaultCluster : tempCluster;
    };
        
    /** 
     * **@returns** a volume object with the volume name for the specific
    */
    public getMockVolume(volumeName) {
        var tempVolume: any = _.find(this.mockVolumes, (volume: any) => {
            return volume.volumeName === volumeName;
        });
        return tempVolume === undefined ? this.byDefaultVolume : tempVolume;
    };
        
    // **@returns** a host object with the host name for the specific
    public getMockHost(node_name) {
        var tempHost: any = _.find(this.mockHosts, (host: any) => {
            return host.node_name === node_name;
        });
        return tempHost === undefined ? this.byDefaultHost : tempHost;
    };


    public getRandomList(key, count, min, max, sort) {
        var list: Array<any>;
        _.each(_.range(count), function(index) {
            var value = {};
            value[key] = _.random(min, max);
            list.push(value);
        });
        return sort ? _.sortBy(list, key) : list;
    };
}


