let myChart = null;

// [추가] 실시간 콤마 포맷팅 함수
function formatNumber(node) {
    let value = node.value.replace(/[^0-9]/g, "");
    node.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// [추가] 계산을 위해 콤마를 제거하고 숫자로 변환하는 함수
function getRawNumber(id) {
    const val = document.getElementById(id).value;
    return parseFloat(val.replace(/,/g, "")) || 0;
}

function calculateLoan() {
    const amount = getRawNumber('loanAmount'); // 콤마 제거 후 숫자 가져오기
    const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const monthlyRate = annualRate / 12;
    const years = parseFloat(document.getElementById('loanTerm').value);
    const months = years * 12;
    const method = document.getElementById('repaymentMethod').value; // 상환 방식 가져오기

    if (amount > 0 && annualRate > 0 && months > 0) {
        let resultHtml = "";

        if (method === "level") {
            // 원리금 균등 상환 공식
            const x = Math.pow(1 + monthlyRate, months);
            const monthlyPayment = (amount * x * monthlyRate) / (x - 1);
            const formatted = Math.round(monthlyPayment).toLocaleString('ko-KR');
            resultHtml = `<strong>원리금 균등 상환</strong> - 예상 월 납입액: <span class="highlight">${formatted} 원</span>`;
        } else {
            // 원금 균등 상환 로직
            const monthlyPrincipal = amount / months; // 매달 갚는 원금
            const firstMonthInterest = amount * monthlyRate; // 첫 달 이자
            const lastMonthInterest = (monthlyPrincipal) * monthlyRate; // 마지막 달 이자
            
            const firstPayment = Math.round(monthlyPrincipal + firstMonthInterest).toLocaleString('ko-KR');
            const lastPayment = Math.round(monthlyPrincipal + lastMonthInterest).toLocaleString('ko-KR');
            
            resultHtml = `<strong>원금 균등 상환</strong><br>1회차 납입액: <span class="highlight">${firstPayment} 원</span><br>` +
                         `마지막 회차 납입액: <span class="highlight">${lastPayment} 원</span><br>` +
                         `<small style="color:#888;">*원금이 균등하게 상환되어 납입액이 매달 조금씩 줄어듭니다.</small>`;
        }
        
        document.getElementById('loanResult').innerHTML = resultHtml;
    } else {
        alert("대출 정보를 정확히 입력해주세요.");
    }
}

// 2. 복리 계산기 + 차트
function calculateCompound() {
    const p = getRawNumber('principal');
    const pmt = getRawNumber('monthlyDeposit');
    const r = parseFloat(document.getElementById('growthRate').value) / 100 / 12;
    const n = parseFloat(document.getElementById('years').value) * 12;

    if (!isNaN(p) && !isNaN(r) && n > 0) {
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
        alert("값을 정확히 입력해주세요.");
    }
}

// 3. 목표 자산 역산기
function calculateGoal() {
    const target = getRawNumber('targetAmount');
    const years = parseFloat(document.getElementById('goalYears').value);
    const annualRate = parseFloat(document.getElementById('growthRate').value) || 5;
    const r = annualRate / 100 / 12;
    const n = years * 12;

    if (target > 0 && n > 0) {
        let monthlyNeed = (r === 0) ? target / n : target / (((Math.pow(1 + r, n)) - 1) / r);
        const formatted = Math.round(monthlyNeed).toLocaleString('ko-KR');
        document.getElementById('goalResult').innerHTML = `매달 <span class="highlight">${formatted} 원</span>을 저축해야 합니다. (수익률 ${annualRate}% 기준)`;
    } else {
        alert("목표 금액과 기간을 입력해주세요.");
    }
}
