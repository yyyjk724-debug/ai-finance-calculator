let myChart = null; // 복리 차트 객체

// 실시간 콤마 포맷팅 함수
function formatNumber(node) {
    let value = node.value.replace(/[^0-9]/g, "");
    node.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 콤마 제거 후 숫자로 변환
function getRawNumber(id) {
    const val = document.getElementById(id).value;
    return parseFloat(val.replace(/,/g, "")) || 0;
}

// 1. 대출 계산기 및 상환 스케줄
function calculateLoan() {
    const amount = getRawNumber('loanAmount');
    const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const monthlyRate = annualRate / 12;
    const years = parseFloat(document.getElementById('loanTerm').value);
    const months = years * 12;
    const method = document.getElementById('repaymentMethod').value;

    if (amount > 0 && annualRate > 0 && months > 0) {
        document.getElementById('scheduleContainer').style.display = 'block';
        
        let tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem; text-align:right; border:1px solid #ddd;">
            <tr style="background:#f8f9ff;">
                <th style="padding:8px; border:1px solid #ddd; text-align:center;">회차</th>
                <th style="padding:8px; border:1px solid #ddd;">납입금(원금+이자)</th>
                <th style="padding:8px; border:1px solid #ddd;">잔액</th>
            </tr>`;

        let balance = amount;
        let totalMonthlyPayment = 0;

        for (let i = 1; i <= months; i++) {
            let interest = balance * monthlyRate;
            let principal = 0;
            let payment = 0;

            if (method === "level") {
                const x = Math.pow(1 + monthlyRate, months);
                payment = (amount * x * monthlyRate) / (x - 1);
                principal = payment - interest;
            } else {
                principal = amount / months;
                payment = principal + interest;
            }

            balance -= principal;
            if (i === 1) totalMonthlyPayment = payment; // 요약용 첫달 기록

            // 6회차까지만 무료 노출 (SaaS 전략)
            if (i <= 6) {
                tableHtml += `<tr>
                    <td style="padding:8px; border:1px solid #ddd; text-align:center;">${i}회</td>
                    <td style="padding:8px; border:1px solid #ddd;">
                        <strong>${Math.round(payment).toLocaleString()}원</strong><br>
                        <small style="color:#888;">(원:${Math.round(principal).toLocaleString()}/이:${Math.round(interest).toLocaleString()})</small>
                    </td>
                    <td style="padding:8px; border:1px solid #ddd;">${Math.max(0, Math.round(balance)).toLocaleString()}원</td>
                </tr>`;
            }
        }
        tableHtml += `</table>`;
        document.getElementById('amortizationTable').innerHTML = tableHtml;
        document.getElementById('loanResult').innerHTML = `첫 회차 월 납입금: <span class="highlight">${Math.round(totalMonthlyPayment).toLocaleString()}원</span>`;
    } else {
        alert("정보를 정확히 입력해주세요.");
    }
}

// 2. 복리 계산기 및 차트 출력
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

        document.getElementById('compoundResult').innerHTML = `최종 예상 자산: <span class="highlight">${Math.round(currentBalance).toLocaleString()} 원</span>`;

        // 차트 그리기 시작
        const canvas = document.getElementById('growthChart');
        if (!canvas) return; // 캔버스가 없으면 종료
        
        const ctx = canvas.getContext('2d');
        if (myChart) myChart.destroy(); // 기존 차트 초기화

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '자산 성장 곡선',
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
                scales: {
                    y: { ticks: { callback: v => v.toLocaleString() + '원' } }
                }
            }
        });
    } else {
        alert("복리 정보를 입력해주세요.");
    }
}

// 3. 목표 자산 역산
function calculateGoal() {
    const target = getRawNumber('targetAmount');
    const years = parseFloat(document.getElementById('goalYears').value);
    const annualRate = parseFloat(document.getElementById('growthRate').value) || 5;
    const r = annualRate / 100 / 12;
    const n = years * 12;

    if (target > 0 && n > 0) {
        let monthlyNeed = (r === 0) ? target / n : target / (((Math.pow(1 + r, n)) - 1) / r);
        document.getElementById('goalResult').innerHTML = `목표 달성을 위해 매달 <span class="highlight">${Math.round(monthlyNeed).toLocaleString()} 원</span> 저축 필요`;
    } else {
        alert("목표 금액과 기간을 입력해주세요.");
    }
}
