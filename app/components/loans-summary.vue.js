import { NewLoan } from './new-loan.vue.js';
import { Loans } from './loans.vue.js';
import { loanService } from '../services/loan-service.js';

export const loansSummary = Vue.component('loans-summary', {
    data: function() {
        return {
            loans: [],
        };
    },
    created: function() {
        this.loans = loanService.getLoans();
    },
    methods: {
        addNewLoan: function(newLoan) {
            loanService.addLoan(newLoan);
            this.$nextTick(() => {
                var element = document.getElementById('loans-table');
                if(element) {
                    var lastChildElement = element.lastChild;
                    lastChildElement.scrollIntoView();
                }
            });
        },
        deleteLoan: function(loan) {
           loanService.deleteLoan(loan);
        },
    },
    template: `
        <div id="loans-summary">
            <div id="loans-summary-body">
                <loans v-bind:loans="loans" v-on:delete="deleteLoan"></loans>
                <new-loan v-on:add-new-loan="addNewLoan"></new-loan>
            </div>
        </div>
    `
});