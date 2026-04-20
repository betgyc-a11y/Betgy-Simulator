document.addEventListener('DOMContentLoaded', () => {
    // ---- Sales Simulator (10:3:1) ----
    const caseSlider = document.getElementById('case-slider');
    const caseValue = document.getElementById('case-value');
    const leadsNum = document.getElementById('leads-num');
    const meetingsNum = document.getElementById('meetings-num');
    const closedNum = document.getElementById('closed-num');
    const y1Income = document.getElementById('y1-income');
    const curAnnualIncomeDisplay = document.getElementById('cur-annual-income');
    const curMonthlyIncomeDisplay = document.getElementById('cur-monthly-income');
    const curAnnualLabel = document.getElementById('cur-annual-label');
    const curMonthlyLabel = document.getElementById('cur-monthly-label');
    const curBreakdownDisplay = document.getElementById('cur-annual-breakdown');
    const annualPremiumDisplay = document.getElementById('annual-premium-total');
    const salesYearsSlider = document.getElementById('sales-years-slider');
    const salesYearsVal = document.getElementById('sales-years-val');
    const cumulativeLabel = document.getElementById('cumulative-income-label');
    const premiumSlider = document.getElementById('premium-slider');
    const premiumVal = document.getElementById('premium-val');
    const bonusSlider = document.getElementById('bonus-slider');
    const bonusValDisplay = document.getElementById('bonus-val');
    const bonusTotalDisplay = document.getElementById('bonus-total');
    const retirementFundDisplay = document.getElementById('retirement-fund');
    const grandTotalDisplay = document.getElementById('grand-total');
    const cumulativeBonusLabel = document.getElementById('cumulative-bonus-label');

    // Precise Commission Structure: 25%, 25%, 18.5%, 18.5%, 15%, 15%
    const COMM_RATES = [0.25, 0.25, 0.185, 0.185, 0.15, 0.15];

    function updateSalesSimulator() {
        const n = parseInt(caseSlider.value);
        const y = parseInt(salesYearsSlider.value);
        const premium = parseInt(premiumSlider.value);
        
        // Mapping index (0-6) to [0%, 3%, 4%, 5%, 6%, 7%, 8%]
        const allowedBonusRates = [0, 3, 4, 5, 6, 7, 8];
        const selectedBonus = allowedBonusRates[parseInt(bonusSlider.value)];
        const bonusRate = selectedBonus / 100;
        
        caseValue.textContent = n;
        salesYearsVal.textContent = y;
        premiumVal.textContent = formatCurrency(premium);
        bonusValDisplay.textContent = `${selectedBonus}%`;
        
        cumulativeLabel.textContent = `第 ${y} 年预计累计收益佣金`;
        cumulativeBonusLabel.textContent = `第 ${y} 年预计累计额外花红`;
        curAnnualLabel.textContent = `第 ${y} 年预计佣金收入 (年)`;
        curMonthlyLabel.textContent = `第 ${y} 年预计月均收入 (月)`;
        
        // 10:3:1 Logic
        leadsNum.textContent = n * 10;
        meetingsNum.textContent = n * 3;
        closedNum.textContent = n;

        // Base Calculations
        const annualNewPremium = n * 12 * premium;
        animateValue(annualPremiumDisplay, annualNewPremium);
        
        // 1. Commission Calculation (Cumulative & Current Year)
        let totalCumulativeComm = 0;
        let incomeInTargetYear = 0;
        let breakdownParts = [];

        for (let targetYear = 1; targetYear <= y; targetYear++) {
            let yearlyTotal = 0;
            for (let cohortYear = 1; cohortYear <= targetYear; cohortYear++) {
                const commissionYear = targetYear - cohortYear;
                if (commissionYear < COMM_RATES.length) {
                    const contribution = annualNewPremium * COMM_RATES[commissionYear];
                    yearlyTotal += contribution;
                    if (targetYear === y) {
                        breakdownParts.push(`${formatNumber(contribution)}(第${cohortYear}年)`);
                    }
                }
            }
            totalCumulativeComm += yearlyTotal;
            if (targetYear === y) {
                incomeInTargetYear = yearlyTotal;
            }
        }
        animateValue(y1Income, totalCumulativeComm);
        animateValue(curAnnualIncomeDisplay, incomeInTargetYear);
        animateValue(curMonthlyIncomeDisplay, incomeInTargetYear / 12);
        curBreakdownDisplay.textContent = breakdownParts.join(' + ');

        // 2. Bonus Calculation (Cumulative Trailing Bonus)
        // Bonus for performance in year K is paid in years K+1, K+2, K+3
        let totalCumulativeBonus = 0;
        for (let targetYear = 1; targetYear <= y; targetYear++) {
            let bonusInThisYear = 0;
            // Check all previous cohorts (1 to targetYear-1)
            for (let cohortYear = 1; cohortYear < targetYear; cohortYear++) {
                const yearsLater = targetYear - cohortYear;
                if (yearsLater >= 1 && yearsLater <= 3) {
                    bonusInThisYear += annualNewPremium * bonusRate;
                }
            }
            totalCumulativeBonus += bonusInThisYear;
        }
        animateValue(bonusTotalDisplay, totalCumulativeBonus);

        // 3. Retirement Fund (1% of ANP, starts from Y2, accumulated up to Y15, compounded by bonus rate)
        let fund = 0;
        const retirementRate = 0.01;
        if (y >= 2) {
            for (let t = 2; t <= y; t++) {
                // Compounding interest first
                fund = (fund * (1 + bonusRate));
                // Add new contribution only if within the first 15 years
                if (t <= 15) {
                    fund += (annualNewPremium * retirementRate);
                }
            }
        }
        animateValue(retirementFundDisplay, fund);

        // 4. Grand Total Calculation
        const grandTotal = totalCumulativeComm + totalCumulativeBonus + fund;
        animateValue(grandTotalDisplay, grandTotal);
    }

    // ---- Inflation Simulator ----
    const incomeSlider = document.getElementById('income-slider');
    const fixedExpSlider = document.getElementById('fixed-exp-slider');
    const flexExpSlider = document.getElementById('flex-exp-slider');
    const yearsSlider = document.getElementById('years-slider');

    const incomeVal = document.getElementById('income-val');
    const fixedExpVal = document.getElementById('fixed-exp-val');
    const flexExpVal = document.getElementById('flex-exp-val');
    const yearsVal = document.getElementById('years-val');

    const futureExp = document.getElementById('future-exp');
    const futureSurplus = document.getElementById('future-surplus');
    const surplusLabel = document.getElementById('surplus-label');
    const feedbackText = document.getElementById('feedback-text');

    function updateInflationSimulator() {
        const income = parseInt(incomeSlider.value);
        const fixed = parseInt(fixedExpSlider.value);
        const flex = parseInt(flexExpSlider.value);
        const years = parseInt(yearsSlider.value);

        incomeVal.textContent = formatCurrency(income);
        fixedExpVal.textContent = formatCurrency(fixed);
        flexExpVal.textContent = formatCurrency(flex);
        yearsVal.textContent = years;

        // Future Exp = Fixed + Flex * (1.03^Years)
        const futureFlex = flex * Math.pow(1.03, years);
        const totalFutureExp = fixed + futureFlex;
        const surplus = income - totalFutureExp;

        animateValue(futureExp, totalFutureExp);
        animateValue(futureSurplus, Math.abs(surplus));
        
        // UI Updates for surplus/deficit
        if (surplus >= 0) {
            surplusLabel.textContent = `第 ${years} 年时的每月财务结余`;
            futureSurplus.parentElement.className = 'output-item success';
            futureSurplus.parentElement.querySelector('.large-value').innerHTML = `<span class="currency">+ RM</span> <span id="future-surplus">${formatNumber(surplus)}</span>`;
            feedbackText.textContent = years > 0 ? "还能勉强支撑，但建议增加被动收入以对冲通胀风险。" : "目前财务状况良好。";
        } else {
            surplusLabel.textContent = `第 ${years} 年时的每月财务赤字`;
            futureSurplus.parentElement.className = 'output-item danger';
            futureSurplus.parentElement.querySelector('.large-value').innerHTML = `<span class="currency">- RM</span> <span id="future-surplus">${formatNumber(Math.abs(surplus))}</span>`;
            feedbackText.textContent = "警告：未来支出已超过收入，您的生活质量将面临严重威胁！";
        }
    }

    // ---- Utils ----
    function formatCurrency(val) {
        return "RM " + val.toLocaleString();
    }

    function formatNumber(val) {
        return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }

    function animateValue(obj, endValue) {
        let startValue = parseInt(obj.textContent.replace(/,/g, '')) || 0;
        if (isNaN(startValue)) startValue = 0;
        
        const duration = 500;
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (endValue - startValue) + startValue);
            obj.textContent = formatNumber(current);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Event Listeners
    if(caseSlider) {
        caseSlider.addEventListener('input', updateSalesSimulator);
        salesYearsSlider.addEventListener('input', updateSalesSimulator);
        premiumSlider.addEventListener('input', updateSalesSimulator);
        bonusSlider.addEventListener('input', updateSalesSimulator);
    }
    
    if(incomeSlider) {
        [incomeSlider, fixedExpSlider, flexExpSlider, yearsSlider].forEach(s => {
            s.addEventListener('input', updateInflationSimulator);
        });
    }

    // Init
    updateSalesSimulator();
    updateInflationSimulator();
});
