// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';
import {ClusterService} from '../../rest/clusters';
import {RequestService} from '../../rest/request';
import {RequestTrackingService} from '../../requests/request-tracking-svc';
import * as ModalHelpers from '../../modal/modal-helpers';
import {numeral} from '../../base/libs';

export class OsdDetailController {
    private id: any;
    private type: any;
    private osdList: Array<any>;
    private osdListGroupBy: any;
    private groupBy: string;
    private filterList: any;
    private selection: any;
    private activeFilter: string;
    private isLeftSidebarShow: boolean;
    private filteredOSD: any;
    private totalSelectedOSDs: Array<any>;
    private storageProfileArray: Array<any>;
    private selectByStorageProfile: any;
    private paramsObject: any;
    private timer: ng.IPromise<any>;

    //Services that are used in this class.
    static $inject: Array<string> = [
        '$q',
        '$modal',
        '$location',
        '$scope',
        '$timeout',
        '$log',
        '$interval',
        'ServerService',
        'ClusterService',
        'RequestService',
        'RequestTrackingService'
    ];

    constructor(private qService: ng.IQService,
        private $modal: any,
        private locationService: ng.ILocationService,
        private scopeService: ng.IScope,
        private timeoutService: ng.ITimeoutService,
        private logService: ng.ILogService,
        private intervalSvc: ng.IIntervalService,
        private serverService: ServerService,
        private clusterService: ClusterService,
        private requestSvc: RequestService,
        private requestTrackingSvc: RequestTrackingService) {

        this.filteredOSD = {};
        this.isLeftSidebarShow = true;
        this.selection = { activeOsd: {} ,allSelectedOsds: {} };
        this.activeFilter = 'osd_status';
        this.filterList = {};
        /* Note: This filterList is tightly coupled with status(osd,utilization,pg) order. if order
        of element will get change , it will break the filter features */
        this.filterList.OSDStatus = [
            {name: "Up-In", icon: "pficon pficon-ok", enabled: false, checked: false},
            {name: "Up-Out", icon: "pficon pficon-warning-triangle-o", enabled: false, checked: false},
            {name: "Down-In", icon: "pficon pficon-warning-triangle-o", enabled: false, checked: false},
            {name: "Down", icon: "fa fa-arrow-circle-o-down down-color", enabled: false, checked: false}
        ];
        this.filterList.PGStatus = [
            {name: "active", checked: false},
            {name: "clean", checked: false},
            {name: "creating", checked: false},
            {name: "replay", checked: false},
            {name: "splitting", checked: false},
            {name: "scrubbing", checked: false},
            {name: "degraded", checked: false},
            {name: "undersized", checked: false},
            {name: "repair", checked: false},
            {name: "recovery", checked: false},
            {name: "backfill", checked: false},
            {name: "remapped", checked: false},
            {name: "down", checked: false},
            {name: "inconsistent", checked: false},
            {name: "peering", checked: false},
            {name: "incomplete", checked: false},
            {name: "stale", checked: false},
        ];
        this.filterList.Utilization = [
            {name: "Full (95% or more)", icon: "progress-bar-full", enabled: false, checked: false},
            {name: "Near Full (85% or more)", icon: "progress-bar-near-full", enabled: false, checked: false},
            {name: "50% - 85%", icon: "progress-bar-average", enabled: false, checked: false},
            {name: "Less than 50%", icon: "progress-bar-normal", enabled: false, checked: false}
        ];
        this.storageProfileArray = [
            {'name': 'All', 'value': ''},
            {'name': 'Default', 'value': 'default'},
            {'name': 'SAS', 'value': 'sas'},
            {'name': 'SSD', 'value': 'ssd'}
        ];
        this.selectByStorageProfile = { storageprofile: '' };
        this.totalSelectedOSDs = [];
        this.timer = this.intervalSvc(() => this.getOSDs(), 120 * 1000 );
        this.scopeService.$on('$destroy', () => {
            this.intervalSvc.cancel(this.timer);
        });
        this.groupBy = 'node';
        this.getOSDs();
        this.paramsObject = locationService.search();
        if (Object.keys(this.paramsObject).length > 0) {
            if(this.paramsObject.active_filter !== undefined && this.paramsObject.filter_name !== undefined) {
                this.activeFilter = this.paramsObject.active_filter;
                if(this.paramsObject.active_filter === 'osd_status') {
                    this.paramsObject.filter_name.forEach((name: any) => {
                        _.find(this.filterList.OSDStatus, (filter: any) => {
                                return filter.name === name;
                        }).checked = true;
                    });
                }else if(this.paramsObject.active_filter === 'utilization') {
                    _.find(this.filterList.Utilization, (filter: any) => {
                            return filter.name.split(' ')[0] === this.paramsObject.filter_name;
                    }).checked = true;
                }
            }
        }
        /* Here , watching the filteredOSD(filtered osd list) variable for any changes .
        so that we can select first value as a selected OSD in UI . and if there is no
        any element inside array, than no osd will be selected in UI. */
        this.scopeService.$watch(() => { return this.filteredOSD; }, (newValue, oldValue) => {
            this.maintainTotalSelectedOsds();
            this.selection.activeOsd = null;
            _.forOwn(this.filteredOSD, (value, key) => {
                if ( value.length > 0 ) {
                    this.selection.activeOsd = value[0];
                    return false;
                }
            });
        },true);
    }

    /* Getting OSD list here */
    public getOSDs() {
        if( this.type === 'Cluster' ) {
            this.clusterService.getSlus(this.id).then((slus: Array<any>) => {
                this.settingUpOsds(slus);
                this.performGroupBy();
            });
        } else {
            this.serverService.getNodeSlus(this.id).then((slus: Array<any>) => {
                this.settingUpOsds(slus);
            });
        }
    }

    public settingUpOsds(slus: Array<any>) {
        this.osdList = slus;
        (this.osdList || []).map( (osd) => {
            var pgArray = [];
            /* Adding the usage status for each osd , so that easily can find color code as well
            as filter for percentused in UI */
            osd.usage.status = (osd.usage.percentused>=95? 0 :(osd.usage.percentused>=85? 1 :(osd.usage.percentused>=50? 2 : 3 )));
            /* By default , we have disabled all filter . and Just here we are enabling the filters
            which are present in OSD list */
            if(!this.filterList.OSDStatus[osd.status].enabled) {
                this.filterList.OSDStatus[osd.status].enabled = true;
            }
            if(!this.filterList.Utilization[osd.usage.status].enabled) {
                this.filterList.Utilization[osd.usage.status].enabled = true;
            }
            /* we have pg summary in object format with '+' sign . example - "pgsummary":{"active+undersized+degraded":128} .
            Here , we want to each key after spliting with '+' sign , should be array elements
            so that easily can apply filter  */
            Object.keys(osd.options1.pgsummary).forEach((element) => {
                pgArray = pgArray.concat(element.split("+"));
            });
            osd.options1.pgsummary.pgarray = pgArray;
            osd.node = osd.options1.node;
        });
    }

    /* Performing Group by */
    public performGroupBy() {
        if(this.groupBy === 'node') {
            this.osdListGroupBy = _.groupBy(this.osdList, function(osd){ return osd.options1.node });
        }else {
            this.osdListGroupBy = _.groupBy(this.osdList, function(osd){ return osd.storageprofile });
        }
    }

    /* Calling on osd action changed and performing actions on selected osds */
    public osdActionChange(osdAction) {
        let actionObject = (osdAction==='mark_up'?{up:true}:(osdAction==='mark_in'?{in:true}:{in:false}));
        if(osdAction === 'mark_out') {
            var modal = ModalHelpers.OsdActionConfirmation(this.$modal, {}, 'Are you sure you want to move the selected OSDs out of the cluster?');
            modal.$scope.$hide = _.wrap(modal.$scope.$hide, ($hide, confirmed: boolean) => {
                if (confirmed) {
                       this.performOsdAction(actionObject);
                }
                $hide();
            });
        }else {
            this.performOsdAction(actionObject);
        }
    }

    /* Performing the Actions on selected osds */
    public performOsdAction(actionObject) {
        if(this.totalSelectedOSDs.length === 0 ) {
            this.clusterService.slusAction(this.id,this.selection.activeOsd.sluid,actionObject).then((result) => {
                this.requestSvc.get(result.data.taskid).then((task) => {
                    this.requestTrackingSvc.add(task.id, task.name);
                });
            });
        }else {
            _.each(this.totalSelectedOSDs, (osd: any) => {
                this.clusterService.slusAction(this.id,osd.sluid,actionObject).then((result) => {
                    this.requestSvc.get(result.data.taskid).then((task) => {
                        this.requestTrackingSvc.add(task.id, task.name);
                    });
                });
            });
        }
        this.selection.allSelectedOsds= {};
        this.totalSelectedOSDs = [];
        this.timeoutService(() => this.getOSDs(), 10000);
    }

    /* Maintaining the total selected osds by checkbox for Action */
    public maintainTotalSelectedOsds() {
        this.totalSelectedOSDs = [];
        _.forOwn(this.filteredOSD, (value, key) => {
            _.each(value, (osd: any) => {
                if (this.selection.allSelectedOsds[osd.sluid] === true ) {
                    this.totalSelectedOSDs.push(osd);
                }
            });
        });
    }

    /* Applying filter on OSD list from the ng-repeat in UI. here we have 3 set of filters based on
    1)osd status 2)utilization 3) pg_status . and at a time only one set of filter can be applied .
    so that why here i have if condition to check the set of filter . */
    public applyFilter = (osd) => {
        if(this.activeFilter === 'osd_status') {
            return this.filterList.OSDStatus[osd.status].checked || this.isNoFilterSelected(this.filterList.OSDStatus);
        }else if(this.activeFilter === 'utilization') {
            return this.filterList.Utilization[osd.usage.status].checked || this.isNoFilterSelected(this.filterList.Utilization);
        }else if(this.activeFilter === 'pg_status') {
            if(this.isNoFilterSelected(this.filterList.PGStatus)) { return true; }
            var result = false;
            _.each(this.filterList.PGStatus, (element: any) => {
                if(element.checked){
                    if(osd.options1.pgsummary.pgarray.indexOf(element.name) === -1){
                        return false;
                    }else{
                        result = true;
                    }
                }
            });
            return result;
        }
    }

    /* It will return true/false based on given filter group.
    If there is no filter applied for this , than it will return true
    otherwise it will return false.*/
    public isNoFilterSelected(filterObj) {
        for (var key in filterObj) {
            if (filterObj[key].checked) {
                return false;
            }
        }
        return true;
    }

}
