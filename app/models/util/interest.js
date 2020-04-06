function calculateNewPrincipal(principal, rateInPercent, timeInYears) {
    let rate = rateInPercent / 100.0;
    return principal * (1.0 + rate * timeInYears);
}

function calculateNewPrincipalForMonth(principal, interest) {
    return calculateNewPrincipal(principal, interest, 1.0/12.0);
}

function getMinimumMonthlyPayment(principal, interest, minimumPayment){
    const newPrincipal = calculateNewPrincipalForMonth(principal, interest);
    const minimumInterestPayment = newPrincipal - principal;
    const minimum = Math.max(minimumInterestPayment, minimumPayment);
    if(minimum < principal) {
        return minimum;
    } else {
        return principal;
    }
}