export const html = /* html */`
<div class="container">
    <header>
        <h2>Debt Calculator</h2>
    </header>
    <div class="container" id="loans-table">
        <table id="loans-table" class="table table-striped">
            <thead>
                <th class="loans-table-name-column">Name</th>
                <th class="loans-table-principal-column">Principal</th>
                <th class="loans-table-interest-column">Interest</th>
                <th class="loans-table-minimum-column">Minimum</th>
                <th class="loans-table-delete-column"></th>
            </thead>
            <tbody class="table-group-divider">
                <tr v-for="loan in loans">
                    <td data-label="Name">{{ loan.name }}</td>
                    <td data-label="Principal">{{ asCurrency(loan.principal) }}</td>
                    <td data-label="Interest">{{ asPercentage(loan.interest) }}</td>
                    <td data-label="Minimum">{{ asCurrency(loan.minimum) }}</td>
                    <td>
                        <div class="btn-group d-flex justify-content-end" role="group">
                            <button type="button" class="btn btn-outline-secondary">Edit</button>
                            <button type="button" class="btn btn-outline-danger" v-on:click="removeLoan(loan.name)">Delete</button>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tfoot class="table-group-divider">
                <td>Total</td>
                <td>{{ asCurrency(totalPrincipal) }}</td>
                <td /> 
                <td>{{ asCurrency(totalMinimum) }}</td>
                <td>
                    <div class="btn-group d-flex justify-content-end">
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#new-loan-modal">
                            Add New Loan 
                        </button>
                    </div>
                </td>
            </tfoot>
        </table>
    </div>
    <div class="container">
        <div class="mb-3">
            <label for="avalanche-select" class="form-label">Payment Strategy</label>
            <select class="form-select" aria-label="Strategy Selection" id="avalanche-select">
                <option value="avalanche" selected>Avalanche (Highest Interest First)</option>
                <option value="snowball">Snowball (Lowest Principal First)</option>
            </select>
            <label for="total-monthly-payment" class="form-label">Total Monthly Payment</label>
            <div class="input-group mb-3">
                <span class="input-group-text">$</span>
                <input 
                    class="form-control" 
                    type="text" 
                    id="total-monthly-payment" 
                    ref="totalMonthlyPaymentInputRef"
                    v-model="totalMonthlyPaymentInput"
                    :placeholder="totalMinimumToNearestDollar"
                    @keyup="validateTotalMonthlyPayment"
                >
                <div class="invalid-feedback">Value cannot be lower than {{ totalMinimumToNearestDollar }}</div>
            </div>
            <label for="years-range" class="form-label">Repayment Period ({{ asYearsAndMonths(paymentPeriodInMonths) }})</label>
            <input type="range" class="form-range" min="3" :max=maxMonths step="3" id="years-range" v-model=paymentPeriodInMonths>
            <div class="col mb-3 btn-group">
                <button type="button" class="btn btn-success" v-on:click="generatePaymentPlan()">
                    Generate Payment Plan 
                </button>
            </div>
        </div>
    </div>
    <div v-if="paymentPlan" class="container">
        <div v-for="repayment in paymentPlan.loanRepayments">
        </div> 
    </div>

    <!-- New Loan Popup -->
    <div class="modal" tabindex="-1" id="new-loan-modal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">New Loan</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <input 
                            class="form-control"
                            name="new-loan-name" 
                            id="newLoanName" 
                            v-model="newLoan.name" 
                            ref="newLoanNameRef"
                            @keyup="validateNewLoanName"
                            required
                            placeholder="Name"
                        >
                        <div class="invalid-feedback">Loan name is required</div>
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text">$</span>
                        <input 
                            class="form-control"
                            name="newLoanPrincipal" 
                            v-model="newLoan.principal" 
                            ref="newLoanPrincipalRef"
                            @keyup="validateNewLoanPrincipal"
                            placeholder="Principal"
                        >
                        <div class="invalid-feedback">Loan principal is required</div>
                    </div>
                    <div class="input-group mb-3">
                        <input 
                            class="form-control"
                            name="new-loan-interest" 
                            id="newLoanInterest" 
                            v-model="newLoan.interest" 
                            ref="newLoanInterestRef" 
                            @keyup="validateNewLoanInterest"
                            placeholder="Interest"
                        >
                        <span class="input-group-text">%</span>
                        <div class="invalid-feedback">Loan interest is required</div>
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text">$</span>
                        <input 
                            class="form-control"
                            name="new-loan-minimum" 
                            id="newLoanMinimum" 
                            v-model="newLoan.minimum" 
                            ref="newLoanMinimumRef" 
                            @keyup="validateNewLoanMinimum"
                            placeholder="Minimum"
                        >
                        <div class="invalid-feedback">Loan minimum is required</div>
                    </div>            
                </div>
                <div class="modal-footer">
                    <button 
                        type="button" 
                        class="btn btn-primary" 
                        data-bs-dismiss="modal" 
                        v-on:click="addLoan"
                        :disabled="cannotAddNewLoan"
                    >Save changes</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" v-on:click="clear">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>
`;