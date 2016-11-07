/// <reference path="../../../../typings/tsd.d.ts" />

/*
 * @ngdoc directive
 * @name time:timeSlot
 * @scope
 * @restrict E
 *
 * @description
 * An AngularJS directive for showing the time slot.
 *
 * @example
 * <time-slot time-slot-changed="changeTimeSlotForUtilization(time)"></time-slot>
 *
*/

export class TimeSlot implements ng.IDirective {
    restrict: string = "E";
    scope = {
        timeSlotChanged: '&'
    };
    bindToController = true;
    controller = function() {
        this.duration = {
                timeSlots : [{ name: "Last 1 hour", value: "-1h" },
                         { name: "Last 2 hours", value: "-2h" },
                         { name: "Last 24 hours", value: "" }]
        };
        this.duration.selectedTimeSlot = this.duration.timeSlots[0];
    };
    controllerAs = 'timeslot';
    template = '<span class="add-cursor-pointer" data-animation="am-flip-x" data-template="views/hosts/time-slot/time-slot.html" bs-dropdown="ellipsis">{{timeslot.duration.selectedTimeSlot.name}}<b class="caret"></b></span>';
}
