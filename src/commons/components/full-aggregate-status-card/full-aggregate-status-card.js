/**
 * @ngdoc component
 * @name fullAggregateStatusCard
 * @element ANY
 * @param {object} status Status configuration information<br/>
 * <ul style='list-style-type: none'>
 * <li>.title         - the main title of the aggregate status card
 * <li>.count         - the number count of the main statuses
 * <li>.href          - the href to navigate to if one clicks on the title or count
 * <li>.iconClass     - an icon to display to the left of the count
 * <li>.iconImage     - an image to display to the left of the count
 * <li>.notifications - an array of status icons & counts
 *   <ul style='list-style-type: none'>
 *   <li>.iconClass   - an icon to display to the right of the notification count
 *   <li>.iconImage   - an image to display to the left of the notification count
 *   <li>.count         - the number count of the notification status
 *   <li>.href          - href to navigate to if one clicks on the notification status icon or count
 *   </ul>
 * </ul>
 * <ul style='list-style-type: none'>
 * <li>...
 * <li><strong>.notification</strong>  - an <em>object</em> of containing a single notification icon & count
 *   <ul style='list-style-type: none'>
 *   <li>.iconClass   - an icon to display to the right of the notification count
 *   <li>.iconImage   - an image to display to the left of the notification count
 *   <li>.count         - the number count of the notification status
 *   <li>.href          - href to navigate to if one clicks on the notification status icon or count
 *   </ul>
 * </ul>
 * @param {boolean=} show-top-border Show/hide the top border, true shows top border, false (default) hides top border
 * @param {string=} layout Various alternative layouts the aggregate status card may have:<br/>
 * @description
 * Directive for easily displaying status information
 *
 * @example
 <example module="patternfly.card">
 <file name="index.html">
   <div ng-controller="CardDemoCtrl" style="display:inline-block;">
     <div class="col-md-10">
       <label>With Top Border</label>
       <full-aggregate-status-card status="status" show-top-border="true"></full-aggregate-status-card>
       <br/>
     </div>
   </div>
 </file>
 <file name="script.js">
   angular.module( 'patternfly.card' ).controller( 'CardDemoCtrl', function( $scope ) {
    $scope.status = {
       "title":"Cluster",
       "count":5,
       "href":"#",
       "notifications":[
        {
            "iconClass":"fa fa-arrow-circle-o-down",
            "count":1,
            "href":"#"
        },
        {
            "iconClass":"pficon  pficon-resources-almost-full",
            "count":1,
            "href":"#"
        },
        {
            "iconClass":"pficon pficon-error-circle-o",
            "count":4,
            "href":"#"
        },
        {
            "iconClass":"pficon pficon-warning-triangle-o",
            "count":1
        },
        {
            "iconClass":"pficon pficon-flag",
            "count":1,
            "text": "Cluster have host quorum"
        }

       ]
    };
 </file>
 </example>
 */

(function() {
  "use strict";

  var app = angular.module("TendrlModule");

  app.controller("fullAggregateStatusCardController", fullAggregateStatusCardController);

  app.component("fullAggregateStatusCard", {
    bindings: {
      status: '=',
      showTopBorder: '=?',
    },
    controllerAs: "vm",
    controller: "fullAggregateStatusCardController",
    templateUrl: "/commons/components/full-aggregate-status-card/full-aggregate-status-card.html"
  });

  function fullAggregateStatusCardController($element, $scope){
    var vm = this;
    vm.$postLink = function(){
      vm.shouldShowTopBorder = (vm.showTopBorder === true); 
    }
  };
}());