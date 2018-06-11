const PubSubService = {
    topics: {},
    subscribe: function(topic, listener) {
        var that = this;

        // Create the topic's object if not yet created
        if (!that.topics.hasOwnProperty.call(that.topics, topic)) {
            that.topics[topic] = [];
        }

        // Add the listener to queue
        var index = that.topics[topic].push(listener) - 1;

        // Provide handle back for removal of topic
        return {
            remove: function() {
                delete that.topics[topic][index];
            }
        };
    },
    publish: function(topic, info) {
        var that = this;

        // If the topic doesn't exist, or there's no listeners in queue, just leave
        if (!that.topics.hasOwnProperty.call(that.topics, topic)) return;

        // Cycle through topics queue, fire!
        that.topics[topic].forEach(function(item) {
            item(info != undefined ? info : {});
        });
    }
};


angular
    .module("TendrlModule")
    .service("pubSubService", pubSubService);

/*@ngInject*/
function pubSubService() {
    return PubSubService;
}
