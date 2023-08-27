var Currency = Vue.filter('currency', function(value) {
    if(!value) {
        return ''
    }
    return accounting.formatMoney(value);
});

var MonthAndYear = Vue.filter('month-and-year', function(value) {
    if(!value) {
        return ''
    }
    const monthName = value.toLocaleString('default', {month: 'long'});
    const year = value.getFullYear();
    return monthName + ' ' + year;
})

export { Currency, MonthAndYear };