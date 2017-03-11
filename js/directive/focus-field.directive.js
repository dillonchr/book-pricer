module.exports = function () {
    return {
        link: function (scope, elem, attrs) {
            scope.$on('focus-field', function () {
                elem
                    .click()
                    .focus();
            });

            scope.$on('blur-field', function () {
                elem.blur();
            });
        }
    }
};
