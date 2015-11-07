// <reference path="../../../typings/tsd.d.ts" />

import {ClusterService} from '../rest/clusters';
import {PoolService} from '../rest/pool';
import * as ModalHelpers from '../modal/modal-helpers';

export class OpenStackStorageController {
	private name: string;
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
		this.clusters =[];
		this.clusterSvc.getList().then((clusters) => {
			this.clusters = clusters;
			if (this.clusters.length > 0) {
				this.cluster = this.clusters[0];
			}
		});    
	}
   
	public isSubmitAvailable(): boolean {
		return true;
	}

	public cancel(): void {
		this.locationSvc.path('/storages');
	}

	public submit(): void {
		var storage = {
		   cluster: this.cluster.cluster_id,
		};
		console.log(storage);
		this.poolSvc.create(storage).then((result) => {
			console.log(result);
			if (result.status === 202) {
				this.RequestTrackingSvc.add(result.data, 'Creating pool \'' + this.name + '\'');
				var modal = ModalHelpers.SuccessfulRequest(this.modal, {
					title: 'Create Storage Request is Submitted',
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
