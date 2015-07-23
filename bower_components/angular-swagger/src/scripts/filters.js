angular.module('ng-swagger.filters', [])


.filter('unsafe', function($sce) {
    return $sce.trustAsHtml;
})

.filter('markdown', function() {

    var md = window.markdownit('commonmark');

    return function(markdown) {

        if (!markdown)
            return ;

        return md.renderInline(markdown) ;
    }
})

