/// <reference path="../../../typings/tsd.d.ts" />

export function UnAuthorized($modal, options) {
    options = options || {};
    return $modal(_.extend({
        title: 'UNAUTHORIZED ACCESS',
        content: 'Unauthorized access to API. It looks like your authentication tokens are invalid. Please try logging out and back in again.',
        container: 'body',
        template: 'views/modal/custom-modal.html'
    }, options));
}

export function UnexpectedError($modal, options) {
    options = options || {
        status: '?'
    };
    return $modal(_.extend({
        title: 'UNEXPECTED ERROR (' + options.status + ')',
        container: 'body',
        template: 'views/modal/custom-modal.html'
    }, options));
}

export function SuccessfulRequest($modal, options) {
    options = options || {};
    return $modal(_.extend({
        content: 'This may take a while. We\'ll let you know when it\'s done.',
        container: 'body',
        template: 'views/modal/custom-modal.html',
        backdrop: 'static', // disable mouse clicks for now since I can't wrap them or supply a callback
        keyboard: false
    }, options));
}

export function RemoveConfirmation($modal, options) {
    options = options || {};
    return $modal(_.extend({
        title: 'CONFIRMATION',
        content: 'Are you sure you want to remove?',
        container: 'body',
        template: 'views/modal/confirmation-modal.html',
        backdrop: 'static', // disable mouse clicks for now since I can't wrap them or supply a callback
        keyboard: false
    }, options));
}

export function OsdActionConfirmation($modal, options, actionContent) {
    options = options || {};
    return $modal(_.extend({
        title: 'CONFIRMATION',
        content: actionContent,
        container: 'body',
        template: 'views/modal/confirmation-modal.html',
        backdrop: 'static', // disable mouse clicks for now since I can't wrap them or supply a callback
        keyboard: false
    }, options));
}

export function UnAcceptedHostsFound($modal, options, unacceptedHostsCount) {
    options = options || {};
    return $modal(_.extend({
        title: unacceptedHostsCount + ' Unaccepted Hosts Detected',
        content: 'For security reasons, hosts must be accepted before they can be added to a cluster',
        container: 'body',
        template: 'views/modal/unaaccepted-hosts-found-modal.html',
        backdrop: 'static', // disable mouse clicks for now since I can't wrap them or supply a callback
        keyboard: false
    }, options));
}

export function makeOnError(modal, callback) {
    return function onError(resp) {
        modal.$scope.title = 'Unexpected Error ' + resp.status;
        modal.$scope.content = '<pre>' + resp.data + '</pre>';
        modal.$scope.$hide = _.wrap(modal.$scope.$hide, function($hide) {
            $hide();
            if (_.isFunction(callback)) {
                callback.call(undefined);
            }
        });
        modal.$scope.disableClose = false;
        modal.$scope.$show();
    };
}
