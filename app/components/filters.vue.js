var Currency = Vue.filter('currency', function(value) {
    if(!value) {
        return ''
    }
    return accounting.formatMoney(value);
});

export { Currency };