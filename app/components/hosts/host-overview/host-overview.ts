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

    //Services that are used in this class.
    static $inject: Array<string> = [
        'ServerService'
    ];

    constructor(private serverService: ServerService) {
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
        });
    }

    public getCpuUtilization(timeSlot: any) {
        this.serverService.getHostCpuUtilization(this.host.nodeid,timeSlot.value).then((cpu_utilization) => {
            this.drawGraphs(cpu_utilization,"cpu","Cpu utilization","%",this.host.utilizations.cpuusage.percentused);
        });
    }

    public getMemoryUtilization(timeSlot: any) {
        this.serverService.getHostMemoryUtilization(this.host.nodeid,timeSlot.value).then((memory_utilization) => {
            this.drawGraphs(memory_utilization,"memory","Memory utilization","%",this.host.utilizations.memoryusage.percentused);
        });
    }

    public getSwapUtilization(timeSlot: any) {
        this.serverService.getHostSwapUtilization(this.host.nodeid,timeSlot.value).then((swap_utilization) => {
            this.drawGraphs(swap_utilization,"swap","Swap utilization","%",this.host.utilizations.swapusage.percentused);
        });
    }

    public getStorageUtilization(timeSlot: any) {
        this.serverService.getHostStorageUtilization(this.host.nodeid,timeSlot.value).then((storage_utilization) => {
            this.drawGraphs(storage_utilization,"storage","Storage utilization","%",this.host.utilizations.storageusage.percentused);
        });
    }

    public getNetworkUtilization(timeSlot: any) {
        this.serverService.getHostNetworkUtilization(this.host.nodeid,timeSlot.value).then((network_utilization) => {
            this.drawGraphs(network_utilization,"network","Network utilization","%",this.host.utilizations.networkusage.percentused);
        });
    }

    public getDiskIOPS(timeSlot: any) {
        this.serverService.getHostIOPS(this.host.nodeid,timeSlot.value).then((iops) => {
            this.setGraphData(iops,"iops","IOPS","K");
        });
    }

    public getThroughput(timeSlot: any) {
        this.serverService.getHostThroughput(this.host.nodeid,timeSlot.value).then((throughput) => {
            this.setGraphData(throughput,"throughput","Network Throughput","KB/s");
        });
    }

    public getNetworkLatency(timeSlot: any) {
        this.serverService.getHostNetworkLatency(this.host.nodeid,timeSlot.value).then((network_latency) => {
            this.setGraphData(network_latency,"latency","Network Latency","ms");
        });
    }

    public drawGraphs(graphArray, graphName, graphTitle, graphUnits, graphUsage) {
        this.setGraphData(graphArray,graphName,graphTitle,graphUnits);
        this.setGraphUtilization({"total":100,"used":graphUsage}, graphName);
    }

    public setGraphUtilization(usage, graphName) {
        this.donutCharts[graphName].data = usage
        this.donutCharts[graphName].config.chartId = graphName;
        this.donutCharts[graphName].config.thresholds = {'warning':'60','error':'90'};
        this.donutCharts[graphName].config.tooltipFn = (d) => {
              return '<span class="donut-tooltip-pf"style="white-space: nowrap;">' +
                       Math.round((d[0].value * 100)/usage.total) + '% ' + d[0].name +
                     '</span>';
        };
        this.donutCharts[graphName].config.centerLabelFn = () => {
              return Math.round(usage.used) + "%";
        };
    }

    public setGraphData(graphArray, graphName, graphTitle, graphUnits) {
        var times = [];
        var used = [];
        times.push("dates");
        used.push("used");
        var usageDataArray = graphArray[0].datapoints;
        for (var index in usageDataArray) {
          var subArray = usageDataArray[index];
          times.push(new Date(subArray[1]));
          used.push(Math.round(subArray[0]));
        }
        this.trendCharts[graphName] = {
            title: graphTitle,
            data: {
                  dataAvailable: true,
                  total: 100,
                  xData: times,
                  yData: used
            },
            config: {
                chartId      :  graphName,
                title        :  graphTitle,
                layout       : 'compact',
                valueType    : 'actual',
                units        :  graphUnits,
                tooltipFn    :  function(d) {
                                    return  '<span class="donut-tooltip-pf">' +
                                              d[0].value + ' ' + graphUnits +
                                            '</span>';
                                }
            }
        }
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
