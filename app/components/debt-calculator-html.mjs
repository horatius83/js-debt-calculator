export const html = /* html */`
<div class="container">
    <header>
        <h2>Debt Calculator</h2>
    </header>
    <div class="card mb-3" id="loans-table">
        <div class="card-header">
            Loans
        </div>
        <div class="card-body">
            <table id="loans-table" class="table table-striped">
                <thead>
                    <th class="loans-table-name-column">Name</th>
                    <th class="loans-table-principal-column">Principal</th>
                    <th class="loans-table-interest-column">Interest</th>
                    <th class="loans-table-minimum-column">Minimum</th>
                    <th class="loans-table-delete-column"></th>
                </thead>
                <tbody class="table-group-divider">
                    <tr v-for="(loan, index) in loans" :key="index">
                        <td data-label="Name">{{ loan.name }}</td>
                        <td data-label="Principal">{{ asCurrency(loan.principal) }}</td>
                        <td data-label="Interest">{{ asPercentage(loan.interest) }}</td>
                        <td data-label="Minimum">{{ asCurrency(loan.minimum) }}</td>
                        <td>
                            <div class="btn-group d-flex justify-content-end" role="group">
                                <button type="button" class="btn btn-outline-secondary" data-bs-toggle="modal" data-bs-target="#edit-loan-modal" :data-loan-index="index">Edit</button>
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
    </div>
    <div class="card mb-3">
        <div class="card-header">
            Emergency Fund
        </div>
        <div class="card-body mb-3">
            <div class="form-check">
                <input type="checkbox" id="emergency-fund-is-enabled" class="form-check-input" v-model="shouldCreateEmergencyFund">
                <label for="emergency-fund-is-enabled" class="form-check-label">Build Emergency Fund</label>
            </div>
            <div v-if="shouldCreateEmergencyFund" class="mb-3">
                <label for="emergency-fund-maximum-amount" class="form-label">Max Amount</label>
                <div class="input-group mb-3">
                    <span class="input-group-text">$</span>
                    <input 
                        class="form-control"
                        type="text"
                        id="emergency-fund-maximum-amount"
                        ref="emergencyFundMaximumAmountRef"
                        v-model="emergencyFundMaxAmount"
                        @keyup='validateEmergencyFundMaxAmount'
                    >
                    <div class="invalid-feedback">{{ emergencyFundMaxAmountErrorMessage }}</div>
                </div>
                <label for="emergency-fund-percentage" class="form-label">Percentage of Bonus Funds</label>
                <div class="input-group mb-3">
                    <input 
                        class="form-control"
                        type="text"
                        id="emergency-fund-percentage"
                        ref="emergencyFundPercentageRef"
                        v-model="emergencyFundPercentage"
                        @keyup="validateEmergencyFundPercentage"
                    >
                    <span class="input-group-text">%</span>
                    <div class="invalid-feedback">{{ emergencyFundPercentageErrorMessage }}</div>
                </div>
            </div>
        </div>
    </div>
    <div class="card mb-3">
        <div class="card-header">
            Payment Plan
        </div>
        <div class="card-body">
            <label for="avalanche-select" class="form-label">Payment Strategy</label>
            <select class="form-select" aria-label="Strategy Selection" id="avalanche-select" v-model="strategy">
                <option value="avalanche" selected>Avalanche (Highest Interest First)</option>
                <option value="snowball">Snowball (Lowest Principal First)</option>
                <option value="double">Multiplier (Pay Multiples of Amount Owed)</option>
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
        <div class="card mb-3" v-for="payment in getPaymentPlanSeries()">
            <div class="card-header">
                {{ dateAsYearAndMonth(payment[0]) }}
            </div>
            <div class="card-body">
                <ul>
                    <li v-for="loan in payment[1]" :class="{ mark: loan[1].paidMoreThanMinimum }">
                        {{ loan[0] }}: {{ asCurrency(loan[1].paid) }}
                    </li>
                </ul>
            </div>
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

    <!-- Edit Loan Modal -->
    <div class="modal" tabindex="-1" id="edit-loan-modal" ref="editLoanModal">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Edit "{{ currentEditLoan.name }}"</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="input-group mb-3">
                        <span class="input-group-text">$</span>
                        <input 
                            class="form-control"
                            name="edit-loan-principal" 
                            id="editLoanPrincipal" 
                            v-model="currentEditLoan.principal" 
                            ref="editLoanPrincipalRef"
                            @keyup="validateEditLoanPrincipal"
                            placeholder="Principal"
                        >
                        <div class="invalid-feedback">Loan principal is required</div>
                    </div>
                    <div class="input-group mb-3">
                        <input 
                            class="form-control"
                            name="edit-loan-interest" 
                            id="editLoanInterest" 
                            v-model="currentEditLoan.interest" 
                            ref="editLoanInterestRef" 
                            @keyup="validateEditLoanInterest"
                            placeholder="Interest"
                        >
                        <span class="input-group-text">%</span>
                        <div class="invalid-feedback">Loan interest is required</div>
                    </div>
                    <div class="input-group mb-3">
                        <span class="input-group-text">$</span>
                        <input 
                            class="form-control"
                            name="edit-loan-minimum" 
                            id="editLoanMinimum" 
                            v-model="currentEditLoan.minimum" 
                            ref="editLoanMinimumRef" 
                            @keyup="validateEditLoanMinimum"
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
                        v-on:click="editLoan(currentEditLoan.index)"
                        :disabled="cannotEditLoan"
                    >Save changes</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" v-on:click="clearEdit">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>
`;