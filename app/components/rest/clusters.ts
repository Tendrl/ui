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
}
