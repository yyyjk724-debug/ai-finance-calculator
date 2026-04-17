// 1. 대출 계산기 (Loan Calculator) 로직
function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    const term = parseFloat(document.getElementById('loanTerm').value) * 12;

    if (amount && rate && term) {
        const x = Math.pow(1 + rate, term);
        const monthly = (amount * x * rate) / (x - 1);
        document.getElementById('loanResult').innerHTML = 
            `월 상환액: <strong>${monthly.toLocaleString(undefined, {maximumFractionDigits: 2})}</strong>`;
    } else {
        alert("모든 값을 입력해주세요.");
    }
}

// 2. 복리 계산기 (Compound Interest) 로직
function calculateCompound() {
    const p = parseFloat(document.getElementById('principal').value);
    const pmt = parseFloat(document.getElementById('monthlyDeposit').value);
    const r = parseFloat(document.getElementById('growthRate').value) / 100 / 12;
    const n = parseFloat(document.getElementById('years').value) * 12;

    if (p >= 0 && r >= 0 && n > 0) {
        // 복리 공식 적용
        const futureValue = p * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
        document.getElementById('compoundResult').innerHTML = 
            `최종 자산: <strong>${Math.round(futureValue).toLocaleString()}</strong>`;
    } else {
        alert("올바른 값을 입력해주세요.");
    }
}
