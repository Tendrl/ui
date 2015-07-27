import {ClusterService} from '../rest/clusters';

export class ClustersController {
	public list: Array<any>;
	static $inject: Array<string> = ['ClusterService'];
	constructor(private clusterSvc: ClusterService) {
		clusterSvc.getList().then(this.updateData);
	}

	//This is to fix the 'this' problem with callbacks
	//Refer https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript#use-instance-functions
	updateData = (clusters) => {
		this.list = clusters;
	}
}
