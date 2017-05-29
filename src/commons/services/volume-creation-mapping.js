(function() {
    "use strict";

    var app = angular.module("TendrlModule");

    app.service("volumeCreationMapping", volumeCreationMapping);

    /*@ngInject*/
    function volumeCreationMapping() {

        /* Cache the reference to this pointer */
        var vm = this;

        vm.mapping = {
            "2_1": {
                "2": [
                    [1, 1]
                ]
            },
            "2_2": {
                "2": [
                    [2, 2]
                ],
                "3": [
                    [2, 1, 1]
                ],
                "4": [
                    [1, 1, 1, 1]
                ]
            },
            "2_3": {
                "2": [
                    [3, 3]
                ],
                "3": [
                    [3, 2, 1],
                    [2, 2, 2]
                ],
                "4": [
                    [3, 1, 1, 1],
                    [2, 2, 1, 1]
                ],
                "5": [
                    [2, 1, 1, 1, 1]
                ],
                "6": [
                    [1, 1, 1, 1, 1, 1]
                ]
            },
            "2_4": {
                "2": [
                    [4, 4]
                ],
                "3": [
                    [4, 3, 1],
                    [3, 3, 2],
                    [4, 2, 2]
                ],
                "4": [
                    [4, 2, 1, 1],
                    [3, 3, 1, 1],
                    [3, 2, 2, 1],
                    [2, 2, 2, 2]
                ],
                "5": [
                    [4, 1, 1, 1, 1],
                    [3, 2, 1, 1, 1],
                    [2, 2, 2, 1, 1]
                ],
                "6": [
                    [3, 1, 1, 1, 1, 1],
                    [2, 2, 1, 1, 1, 1]
                ],
                "7": [
                    [2, 1, 1, 1, 1, 1, 1]
                ],
                "8": [
                    [1, 1, 1, 1, 1, 1, 1, 1]
                ]
            },
            "3_1": {
                "3": [
                    [1, 1, 1]
                ]
            },
            "3_2": {
                "3": [
                    [2, 2, 2]
                ],
                "4": [
                    [2, 2, 1, 1]
                ],
                "5": [
                    [2, 1, 1, 1, 1]
                ],
                "6": [
                    [1, 1, 1, 1, 1, 1]
                ]
            },
            "3_3": {
                "3": [
                    [3, 3, 3]
                ],
                "4": [
                    [3, 3, 2, 1],
                    [3, 2, 2, 2]
                ],
                "5": [
                    [3, 3, 1, 1, 1],
                    [3, 2, 2, 1, 1],
                    [2, 2, 2, 2, 1]
                ],
                "6": [
                    [3, 2, 1, 1, 1, 1],
                    [2, 2, 2, 1, 1, 1]
                ],
                "7": [
                    [3, 1, 1, 1, 1, 1, 1],
                    [2, 2, 1, 1, 1, 1, 1]
                ],
                "8": [
                    [2, 1, 1, 1, 1, 1, 1, 1]
                ],
                "9": [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1]
                ]
            },
            "3_4": {
                "3": [
                    [4, 4, 4]
                ],
                "4": [
                    [4, 4, 3, 1],
                    [4, 4, 2, 2],
                    [4, 3, 3, 2],
                    [3, 3, 3, 3]
                ],
                "5": [
                    [4, 4, 2, 1, 1],
                    [4, 3, 2, 2, 1],
                    [4, 3, 3, 1, 1],
                    [4, 2, 2, 2, 2],
                    [3, 3, 3, 2, 1],
                    [3, 3, 2, 2, 2]
                ],
                "6": [
                    [4, 4, 1, 1, 1, 1],
                    [4, 3, 2, 1, 1, 1],
                    [4, 2, 2, 2, 1, 1],
                    [3, 3, 3, 1, 1, 1],
                    [3, 3, 2, 2, 1, 1],
                    [3, 2, 2, 2, 2, 1],
                    [2, 2, 2, 2, 2, 2]
                ],
                "7": [
                    [4, 3, 1, 1, 1, 1, 1],
                    [4, 2, 2, 1, 1, 1, 1],
                    [3, 3, 2, 1, 1, 1, 1],
                    [3, 2, 2, 2, 1, 1, 1],
                    [2, 2, 2, 2, 2, 1, 1]
                ],
                "8": [
                    [4, 2, 1, 1, 1, 1, 1, 1],
                    [3, 3, 1, 1, 1, 1, 1, 1],
                    [3, 2, 2, 1, 1, 1, 1, 1],
                    [2, 2, 2, 2, 1, 1, 1, 1]
                ],
                "9": [
                    [4, 1, 1, 1, 1, 1, 1, 1, 1],
                    [3, 2, 1, 1, 1, 1, 1, 1, 1],
                    [2, 2, 2, 1, 1, 1, 1, 1, 1]
                ],
                "10": [
                    [3, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                    [2, 2, 1, 1, 1, 1, 1, 1, 1, 1]
                ],
                "11": [
                    [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ],
                "12": [
                    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
                ]
            }
        }

    };
})();