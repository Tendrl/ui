import {ClusterService} from '../rest/clusters';
import {VolumeHelpers} from '../volumes/volume-helpers';
import {PoolService}  from '../rest/pool';

export class PoolController {
	private self = this;
	private timer;
	private reloading: boolean;
	private list: Array<any>;
	public clusterList: Array<any>;
	static $inject: Array<string> = [
		'$scope',
		'$interval',
		'$location',
		'ClusterService',
		'PoolService'
	];

	constructor(private scopeSvc: ng.IScope,
		private intervalSvc: ng.IIntervalService,
		private locationSvc: ng.ILocationService,
		private clusterSvc: ClusterService,
		private poolSvc: PoolService) {
		this.timer = this.intervalSvc(() => this.reloadData(), 5000);
		this.reloading = false;
		this.clusterSvc.getList().then((clusters) => this.loadClusters(clusters));
	}

	public loadClusters(clusters) {
		this.clusterList = clusters;
		if (this.clusterList.length === 0) {
			this.locationSvc.path('/first');
		}
	}

	public reloadData() {
		this.poolSvc.getList().then((pools) => {
			this.list = pools;
		});
	}

	public create(): void {
		this.locationSvc.path('/pools/new');
	}

}
