import {ClusterService} from '../rest/clusters';
import {VolumeHelpers} from '';
import {PoolService}  from '';

export class PoolController {
	private self = this;
	private timer;
	private reloading: boolean;
	private list: Array<any>;
	public clusterList: Array<any>;
	static $inject: Array<string> = [
		'$scope',
		'$interval',
		'$locatoion',
		'ClusterService',
		'PoolService'
	];

	constructor(private scopeSvc: ng.IScope,
		private intervalSvc: ng.IIntervalService,
		private locationSvc: ng.ILocationService,
		private clusterSvc: ClusterService,
		private poolSvc: PoolService,
		private VolumeHelpers: VolumeHelpers) {
		this.timer = this.intervalSvc(this.reloadData, 5000);
		this.reloading = false;
		clusterSvc.getList().then(this.updateData);
	}

	updateData = (clusters) => {
		this.clusterList = clusters;
		if (this.clusterList.length === 0) {
			this.locationSvc.path('/first');
		}
	}

	reloadData() {
		if (this.reloading) {
			return;
		}
		this.reloading = true;
		this.poolSvc.getList().then(function(pools) {
			this.list = pools;
		});
	}

	public create(): void {
		this.locationSvc.path('/clusters/new');
	}
}
