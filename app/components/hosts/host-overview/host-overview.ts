// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';
import {Node} from '../../rest/server';

export class HostOverviewController {
    private id: string;
    private host: Node;
    private summary: any;
    private initialTime: any;
    private donutCharts: any;
    private trendCharts: any;
    private isOsd: Boolean;
    private isLoading: any;

    //Services that are used in this class.
    static $inject: Array<string> = [
        'ServerService'
    ];

    constructor(private serverService: ServerService) {
            this.isLoading = { summaryData: true, donutChartsData: true, trendsChartsData: true };
            this.isOsd = false;
            this.summary = {};
            this.initialTime = { name: "Last 1 hour", value: "-1h" };
            this.donutCharts = {
                cpu:{data:{},config:{}},
                memory:{data:{},config:{}},
                swap:{data:{},config:{}},
                storage:{data:{},config:{}},
                network:{data:{},config:{}}
            };
            this.trendCharts = {
                cpu: {title:"",data:{xData:[],yData:[]},config:{}},
                memory: {title:"",data:{xData:[],yData:[]},config:{}},
                swap: {title:"",data:{xData:[],yData:[]},config:{}},
                storage: {title:"",data:{xData:[],yData:[]},config:{}},
                network: {title:"",data:{xData:[],yData:[]},config:{}},
                iop: {title:"",data:{xData:[],yData:[]},config:{}},
                throughput: {title:"",data:{xData:[],yData:[]},config:{}},
                latency: {title:"",data:{xData:[],yData:[]},config:{}}
            };
            this.serverService.get(this.id).then((host:any) => {
                this.host = host;
                if(this.host.roles.indexOf('OSD') > -1) {
                    this.isOsd = true;
                }
                this.getHostSummary(host.nodeid);
                this.changeTimeSlotForUtilization(this.initialTime);
                this.changeTimeSlotForPerformance(this.initialTime);
                this.changeTimeSlotForNetwork(this.initialTime);
            });
    }

    public getHostSummary(nodeid: string) {
        this.serverService.getHostSummary(nodeid).then((summary) => {
            this.summary = summary;
            this.isLoading.summaryData = false;
        });
    }

    public getCpuUtilization(timeSlot: any) {
        this.setGraphUtilization({"total":100,"used": this.host.utilizations.cpuusage.percentused}, "cpu");
        this.serverService.getHostCpuUtilization(this.host.nodeid,timeSlot.value).then((cpu_utilization) => {
            this.setGraphData(cpu_utilization,"cpu","","%","large");
        });
    }

    public getMemoryUtilization(timeSlot: any) {
        this.setGraphUtilization({"total":100,"used": this.host.utilizations.memoryusage.percentused}, "memory");
        this.serverService.getHostMemoryUtilization(this.host.nodeid,timeSlot.value).then((memory_utilization) => {
            this.setGraphData(memory_utilization,"memory","","%","large");
        });
    }

    public getSwapUtilization(timeSlot: any) {
        this.setGraphUtilization({"total":100,"used": this.host.utilizations.swapusage.percentused}, "swap");
        this.serverService.getHostSwapUtilization(this.host.nodeid,timeSlot.value).then((swap_utilization) => {
            this.setGraphData(swap_utilization,"swap","","%","large");
        });
    }

    public getStorageUtilization(timeSlot: any) {
        this.setGraphUtilization({"total":100,"used": this.host.utilizations.storageusage.percentused}, "storage");
        this.serverService.getHostStorageUtilization(this.host.nodeid,timeSlot.value).then((storage_utilization) => {
            this.setGraphData(storage_utilization,"storage","","%","large");
        });
    }

    public getNetworkUtilization(timeSlot: any) {
        this.setGraphUtilization({"total":100,"used": this.host.utilizations.networkusage.percentused}, "network");
        this.serverService.getHostNetworkUtilization(this.host.nodeid,timeSlot.value).then((network_utilization) => {
            this.setGraphData(network_utilization,"network","","%","large");
        });
    }

    public getDiskIOPS(timeSlot: any) {
        this.serverService.getHostIOPS(this.host.nodeid,timeSlot.value).then((iops) => {
            this.setGraphData(iops,"iops","IOPS","K","compact");
        });
    }

    public getThroughput(timeSlot: any) {
        this.serverService.getHostThroughput(this.host.nodeid,timeSlot.value).then((throughput) => {
            this.setGraphData(throughput,"throughput","Network Throughput","KB/s","compact");
        });
    }

    public getNetworkLatency(timeSlot: any) {
        this.serverService.getHostNetworkLatency(this.host.nodeid,timeSlot.value).then((network_latency) => {
            this.setGraphData(network_latency,"latency","Network Latency","ms","compact");
        });
    }

    public setGraphUtilization(usage, graphName) {
        this.donutCharts[graphName].data = usage
        this.donutCharts[graphName].config.chartId = graphName;
        this.donutCharts[graphName].config.thresholds = {'warning':'60','error':'90'};
        this.donutCharts[graphName].config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       ((d[0].value * 100)/usage.total).toFixed(1) + '% ' + d[0].name +
                     '</span>';
        };
        this.donutCharts[graphName].config.centerLabelFn = () => {
              return usage.used.toFixed(1) + "%";
        };
        this.isLoading.donutChartsData = false;
    }

    public setGraphData(graphArray, graphName, graphTitle, graphUnits, graphLayout) {
        var times = [];
        var used = [];
        times.push("dates");
        used.push("used");
        var usageDataArray = graphArray[0].datapoints;
        var isDataAvailable = (usageDataArray.length > 0 ? true : false);
        for (var index in usageDataArray) {
          var subArray = usageDataArray[index];
          times.push(new Date(subArray[1]));
          used.push(subArray[0].toFixed(1));
        }
        this.trendCharts[graphName] = {
            title: graphTitle,
            data: {
                  dataAvailable: isDataAvailable,
                  total: 100,
                  xData: times,
                  yData: used
            },
            config: {
                chartId      :  graphName,
                title        :  graphTitle,
                layout       :  graphLayout,
                valueType    : 'actual',
                units        :  graphUnits,
                tooltipFn    :  function(d) {
                                    return  '<span class="donut-tooltip-pf">' +
                                              d[0].value + ' ' + graphUnits +
                                            '</span>';
                                }
            }
        }
        this.isLoading.trendsChartsData = false;
    }

    public changeTimeSlotForUtilization(time: any) {
        this.getCpuUtilization(time);
        this.getMemoryUtilization(time);
        this.getSwapUtilization(time);
        this.getStorageUtilization(time);
    }

    public changeTimeSlotForNetwork(time: any) {
        this.getNetworkUtilization(time);
    }

    public changeTimeSlotForPerformance(time: any) {
        this.getDiskIOPS(time);
        this.getThroughput(time);
        this.getNetworkLatency(time);
    }

}
