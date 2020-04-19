Vue.filter('currency', function(value) {
    if(!value) {
        return ''
    }
    return accounting.formatMoney(value);
});