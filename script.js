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
    const amount = getRawNumber('loanAmount');
    const annualRate = parseFloat(document.getElementById('interestRate').value) / 100;
    const monthlyRate = annualRate / 12;
    const years = parseFloat(document.getElementById('loanTerm').value);
    const months = years * 12;
    const method = document.getElementById('repaymentMethod').value;

    if (amount > 0 && annualRate > 0 && months > 0) {
        // 1. 기존 요약 결과 출력 (생략 - 이전 코드와 동일)
        // ... (이전 코드의 resultHtml 생성 및 출력 부분) ...

        // 2. 상환 스케줄표 생성 시작
        document.getElementById('scheduleContainer').style.display = 'block';
        let tableHtml = `<table style="width:100%; border-collapse:collapse; font-size:0.85rem; text-align:right; border:1px solid #ddd;">
            <tr style="background:#f8f9ff;">
                <th style="padding:8px; border:1px solid #ddd; text-align:center;">회차</th>
                <th style="padding:8px; border:1px solid #ddd;">상환금(원금+이자)</th>
                <th style="padding:8px; border:1px solid #ddd;">잔액</th>
            </tr>`;

        let balance = amount;
        const displayMonths = Math.min(months, 6); // 무료 버전은 6개월치만 노출

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

            // 6회차까지만 표에 추가
            if (i <= displayMonths) {
                tableHtml += `<tr>
                    <td style="padding:8px; border:1px solid #ddd; text-align:center; background:#fafafa;">${i}회</td>
                    <td style="padding:8px; border:1px solid #ddd;">
                        <strong>${Math.round(payment).toLocaleString()}원</strong><br>
                        <small style="color:#888;">(원:${Math.round(principal).toLocaleString()} / 이:${Math.round(interest).toLocaleString()})</small>
                    </td>
                    <td style="padding:8px; border:1px solid #ddd;">${Math.max(0, Math.round(balance)).toLocaleString()}원</td>
                </tr>`;
            }
        }

        tableHtml += `</table>`;
        document.getElementById('amortizationTable').innerHTML = tableHtml;
        
    } else {
        alert("정보를 정확히 입력해주세요.");
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
