'use strict';

/* Directives */


angular.module('<%= config.app_name %>.directives', []).
    directive('appVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
    }]);