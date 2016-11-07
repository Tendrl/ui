// <reference path="../typings/tsd.d.ts" />

import {ServerService} from '../../rest/server';
import {Node} from '../../rest/server';

export class HostConfigController {
    private id: string;
    private host: Node;

    //Services that are used in this class.
    static $inject: Array<string> = [
        'ServerService',
    ];

    constructor(private serverService: ServerService) {
            this.serverService.get(this.id).then((host:Node) => {
                this.host = host;
            });
    }

}
