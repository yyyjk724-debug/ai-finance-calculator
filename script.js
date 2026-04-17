let myChart = null; // 차트 객체 초기화

// 1. 대출 계산기
function calculateLoan() {
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
    const term = parseFloat(document.getElementById('loanTerm').value) * 12;

    if (!isNaN(amount) && !isNaN(rate) && !isNaN(term) && term > 0) {
        const x = Math.pow(1 + rate, term);
        const monthly = (amount * x * rate) / (x - 1);
        const formatted = Math.round(monthly).toLocaleString('ko-KR');
        document.getElementById('loanResult').innerHTML = `예상 월 상환액: <span class="highlight">${formatted} 원</span>`;
    } else {
        alert("대출 정보를 정확히 입력해주세요.");
    }
}

// 2. 복리 계산기 + 차트 업데이트
function calculateCompound() {
    const p = parseFloat(document.getElementById('principal').value);
    const pmt = parseFloat(document.getElementById('monthlyDeposit').value) || 0;
    const r = parseFloat(document.getElementById('growthRate').value) / 100 / 12;
    const n = parseFloat(document.getElementById('years').value) * 12;

    if (!isNaN(p) && !isNaN(r) && !isNaN(n) && n > 0) {
        let labels = [];
        let data = [];
        let currentBalance = p;

        for (let i = 0; i <= n; i++) {
            if (i > 0) currentBalance = currentBalance * (1 + r) + pmt;
            if (i % 12 === 0 || i === n) {
                labels.push(`${Math.floor(i / 12)}년`);
                data.push(Math.round(currentBalance));
            }
        }

        const formattedValue = Math.round(currentBalance).toLocaleString('ko-KR');
        document.getElementById('compoundResult').innerHTML = `최종 예상 자산: <span class="highlight">${formattedValue} 원</span>`;

        // 차트 그리기
        const ctx = document.getElementById('growthChart').getContext('2d');
        if (myChart) myChart.destroy();
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '자산 성장 추이',
                    data: data,
                    borderColor: '#5d5dff',
                    backgroundColor: 'rgba(93, 93, 255, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { ticks: { callback: v => v.toLocaleString() + '원' } } }
            }
        });
    } else {
        alert("복리 계산 정보를 정확히 입력해주세요.");
    }
}

// 3. 목표 자산 역산기 로직
function calculateGoal() {
    const target = parseFloat(document.getElementById('targetAmount').value);
    const years = parseFloat(document.getElementById('goalYears').value);
    // 복리 수익률은 복리 계산기 입력값(growthRate)을 공유하거나 기본 5%로 설정
    const annualRate = parseFloat(document.getElementById('growthRate').value) || 5;
    const r = annualRate / 100 / 12;
    const n = years * 12;

    if (!isNaN(target) && !isNaN(years) && n > 0) {
        // 월 필요한 저축액 계산 공식
        let monthlyNeed;
        if (r === 0) {
            monthlyNeed = target / n;
        } else {
            monthlyNeed = target / (((Math.pow(1 + r, n)) - 1) / r);
        }
        
        const formatted = Math.round(monthlyNeed).toLocaleString('ko-KR');
        document.getElementById('goalResult').innerHTML = `목표 달성을 위해 매달 <span class="highlight">${formatted} 원</span>을 저축해야 합니다. (수익률 ${annualRate}% 기준)`;
    } else {
        alert("목표 금액과 기간을 입력해주세요.");
    }
}
