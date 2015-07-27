/// <reference path="../../../typings/tsd.d.ts" />

export class ClusterService {
	config: Array<any>;
	rest: restangular.ICollection;
	static $inject: Array<string> = ['Restangular'];
	constructor(rest:restangular.ICollection) {
		this.rest = rest;
	}

    // **getList**
    // **@returns** a promise with a list of all the clusters.
    getList() {
        return this.rest.all('clusters').getList().then(function(clusters) {
            clusters = _.sortBy(clusters, function(cluster){
                return cluster.cluster_name;
            });
            return clusters;
        });
    }
    
    // **getCapacity**
    // **@returns** a promise with the cluster capacity for the specific
    // cluster based on it's id.
    getCapacity(id) {
    }
    
    // **remove**
    // **@param** id - id of cluster you wish to remove.
    // This is a **destructive** operation and will remove
    // any data on this cluster.
    // **@returns** a promise with the request id for the operation.
    remove(id) {
        return this.rest.one('clusters', id).remove();
    }
}
