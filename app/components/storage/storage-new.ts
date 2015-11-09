// <reference path="../../../typings/tsd.d.ts" />

export class StorageNewController {
    static $inject: Array<string> = [
        '$location'
    ];

    constructor(private $location: ng.ILocationService) {
    }

    public addGenericStorage(): void {
        this.$location.path('/storages/new/generic');
    }

    public addOpenStackStorage(): void {
        this.$location.path('/storages/new/openstack');
    }
}
