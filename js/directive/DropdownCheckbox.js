module.exports = function () {
    return {
        template: '<a ng-click="model = !model">' +
        '<span class="glyphicon" ng-class="{\'glyphicon-ok\': model, \'glyphicon-remove\': !model}"></span>' +
        ' {{ ::label }}' +
        '</a>',
        scope: {
            label: '@',
            model: '=dropdownCheckbox'
        }
    }
};
