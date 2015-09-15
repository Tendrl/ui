import {ClusterService} from '../rest/clusters';
import {VolumeHelpers} from '../volumes/volume-helpers';
import {PoolService} from '../rest/pool';
import * as ModalHelpers from '../modal/modal-helpers';

export class PoolNewController {
	private self = this;
    private tier;
	private name: string;
	private pg_num: string;
	private copyCountList;
	private copyCount;
	private tierList;
    private clusters;
	private cluster;
	static $inject: Array<string> = [
		'$scope',
		'$interval',
		'$location',
		'$log',
		'$modal',
		'ClusterService',
		'PoolService',
		'RequestTrackingService'
	];

	constructor(private scopeSvc: ng.IScope,
		private intervalSvc: ng.IIntervalService,
		private locationSvc: ng.ILocationService,
		private logSvc: ng.ILogService,
		private modal,
		private clusterSvc: ClusterService,
		private poolSvc: PoolService,
		private RequestTrackingSvc) {
		this.clusters ={};
		this.tierList=[];
		this.copyCountList = VolumeHelpers.getCopiesList();
		this.copyCount = VolumeHelpers.getRecomendedCopyCount();
		this.tierList = VolumeHelpers.getTierList();
		this.tier = this.tierList[0];
		this.clusterSvc.getList().then((clusters) => {
			this.clusters = _.filter(clusters, function(cluster : any) {
				return cluster.cluster_type == 2;
			});

			if (this.clusters.length > 0) {
				this.cluster = this.clusters[0];
			}
		});
    
	}
   
	public isSubmitAvailable(): boolean {
		return true;
	}

	public cancel(): void {
		this.locationSvc.path('/pools');
	}

	public submit(): void {
		var pools = {
		   cluster: this.cluster.cluster_id,
		   pools: [
			 {
				pool_name: this.name,
				pg_num: parseInt(this.pg_num)
			 }
		]
		};
		console.log(pools);
		this.poolSvc.create(pools).then((result) => {
			console.log(result);
			if (result.status === 202) {
				this.RequestTrackingSvc.add(result.data, 'Creating pool \'' + self.name + '\'');
				var modal = ModalHelpers.SuccessfulRequest(this.modal, {
					title: 'Create Pool Request is Submitted',
					container: '.usmClientApp'
				});
				modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide) => {
					$hide();
					this.locationSvc.path('/pools');
				});
			}
			else {
				this.logSvc.error('Unexpected response from Pools.create', result);
			}
		});

	}
}
