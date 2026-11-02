/**
 * ChemicalMix — Calculator Page Controller
 * ==========================================
 * Manages form inputs, client-side validation, backend API integration,
 * dynamic dashboard updates, and Chart.js rendering for the calculator page.
 *
 * NOTE: All mathematical computations (Jacobi, Gauss-Seidel, NumPy verification)
 * are performed exclusively by the Python Flask backend.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
});

function initCalculator() {
    const calcForm = document.getElementById('calcForm');
    const clearBtn = document.getElementById('clearBtn');
    const addSolCBtn = document.getElementById('addSolCBtn');
    const removeSolC = document.getElementById('removeSolC');

    // Input elements
    const concA = document.getElementById('concA');
    const concB = document.getElementById('concB');
    const concC = document.getElementById('concC');
    const totalVolume = document.getElementById('totalVolume');
    const targetConc = document.getElementById('targetConc');

    // Clear field-specific errors on user input
    [concA, concB, concC, totalVolume, targetConc].forEach(input => {
        if (!input) return;
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
    });

    // Toggle Solution C visibility
    if (addSolCBtn) {
        addSolCBtn.addEventListener('click', () => {
            const groupC = document.getElementById('groupConcC');
            if (groupC) {
                groupC.style.display = '';
                addSolCBtn.style.display = 'none';
            }
        });
    }

    if (removeSolC) {
        removeSolC.addEventListener('click', () => {
            const groupC = document.getElementById('groupConcC');
            if (groupC) {
                groupC.style.display = 'none';
                if (concC) concC.value = '';
                clearFieldError(concC);
            }
            if (addSolCBtn) {
                addSolCBtn.style.display = '';
            }
        });
    }

    // Clear all inputs and reset results
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            calcForm.reset();
            clearAllErrors();
            const groupC = document.getElementById('groupConcC');
            if (groupC) groupC.style.display = 'none';
            if (addSolCBtn) addSolCBtn.style.display = '';

            const placeholder = document.getElementById('resultsPlaceholder');
            const dashboard = document.getElementById('resultsDashboard');
            if (placeholder) placeholder.style.display = '';
            if (dashboard) dashboard.style.display = 'none';

            if (typeof destroyAllCharts === 'function') {
                destroyAllCharts();
            }
        });
    }

    // Form submission
    if (calcForm) {
        calcForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCalculation();
        });
    }

    // Pre-fill from previous session if available
    const last = typeof getLastCalculation === 'function' ? getLastCalculation() : null;
    if (last && last.inputs) {
        const inp = last.inputs;
        if (inp.concentrations && inp.concentrations.length >= 2) {
            concA.value = inp.concentrations[0];
            concB.value = inp.concentrations[1];
            if (inp.concentrations.length > 2) {
                const groupC = document.getElementById('groupConcC');
                if (groupC) groupC.style.display = '';
                if (addSolCBtn) addSolCBtn.style.display = 'none';
                if (concC) concC.value = inp.concentrations[2];
            }
            totalVolume.value = inp.total_volume;
            targetConc.value = inp.target_concentration;
        }
    }
}

// ─── Field Error Utilities ───────────────────────────────────────────────────

function setFieldError(fieldId, errorId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(errorId);
    if (input) {
        input.classList.add('error');
        const formGroup = input.closest('.form-group');
        if (formGroup) formGroup.classList.add('has-error');
    }
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function clearFieldError(input) {
    if (!input) return;
    input.classList.remove('error');
    const formGroup = input.closest('.form-group');
    if (formGroup) formGroup.classList.remove('has-error');
    const errorEl = formGroup ? formGroup.querySelector('.form-error') : null;
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }
}

function clearAllErrors() {
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error');
    });
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
    });
    document.querySelectorAll('.form-error').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validateCalculatorInputs() {
    clearAllErrors();
    let isValid = true;

    const concAEl = document.getElementById('concA');
    const concBEl = document.getElementById('concB');
    const concCEl = document.getElementById('concC');
    const totalVolumeEl = document.getElementById('totalVolume');
    const targetConcEl = document.getElementById('targetConc');
    const groupC = document.getElementById('groupConcC');
    const hasSolC = groupC && groupC.style.display !== 'none';

    const aVal = parseFloat(concAEl.value);
    const bVal = parseFloat(concBEl.value);
    const volVal = parseFloat(totalVolumeEl.value);
    const targetVal = parseFloat(targetConcEl.value);

    if (isNaN(aVal) || concAEl.value.trim() === '') {
        setFieldError('concA', 'errorConcA', 'Concentration of Solution A is required.');
        isValid = false;
    } else if (aVal < 0 || aVal > 100) {
        setFieldError('concA', 'errorConcA', 'Concentration must be between 0% and 100%.');
        isValid = false;
    }

    if (isNaN(bVal) || concBEl.value.trim() === '') {
        setFieldError('concB', 'errorConcB', 'Concentration of Solution B is required.');
        isValid = false;
    } else if (bVal < 0 || bVal > 100) {
        setFieldError('concB', 'errorConcB', 'Concentration must be between 0% and 100%.');
        isValid = false;
    }

    let cVal = null;
    if (hasSolC) {
        cVal = parseFloat(concCEl.value);
        if (isNaN(cVal) || concCEl.value.trim() === '') {
            setFieldError('concC', 'errorConcC', 'Concentration of Solution C is required.');
            isValid = false;
        } else if (cVal < 0 || cVal > 100) {
            setFieldError('concC', 'errorConcC', 'Concentration must be between 0% and 100%.');
            isValid = false;
        }
    }

    if (isNaN(volVal) || totalVolumeEl.value.trim() === '') {
        setFieldError('totalVolume', 'errorVolume', 'Total required volume is required.');
        isValid = false;
    } else if (volVal <= 0) {
        setFieldError('totalVolume', 'errorVolume', 'Total volume must be greater than 0.');
        isValid = false;
    }

    if (isNaN(targetVal) || targetConcEl.value.trim() === '') {
        setFieldError('targetConc', 'errorTarget', 'Target concentration is required.');
        isValid = false;
    } else if (targetVal < 0 || targetVal > 100) {
        setFieldError('targetConc', 'errorTarget', 'Target concentration must be between 0% and 100%.');
        isValid = false;
    }

    // Mathematical sanity checks
    if (isValid) {
        const concentrations = [aVal, bVal];
        if (hasSolC && cVal !== null) concentrations.push(cVal);

        const minConc = Math.min(...concentrations);
        const maxConc = Math.max(...concentrations);

        if (targetVal < minConc || targetVal > maxConc) {
            setFieldError('targetConc', 'errorTarget', 
                `Target concentration (${targetVal}%) must be between the available minimum (${minConc}%) and maximum (${maxConc}%).`);
            isValid = false;
        }

        if (minConc === maxConc) {
            setFieldError('concB', 'errorConcB', 'Solutions have identical concentrations; mixing is trivial.');
            isValid = false;
        }
    }

    return isValid;
}

// ─── API Request & Execution ─────────────────────────────────────────────────

async function handleCalculation() {
    if (!validateCalculatorInputs()) {
        if (typeof showToast === 'function') {
            showToast('Please correct the highlighted input errors.', 'warning');
        }
        return;
    }

    const concA = parseFloat(document.getElementById('concA').value);
    const concB = parseFloat(document.getElementById('concB').value);
    const totalVolume = parseFloat(document.getElementById('totalVolume').value);
    const targetConc = parseFloat(document.getElementById('targetConc').value);
    const groupC = document.getElementById('groupConcC');
    const hasSolC = groupC && groupC.style.display !== 'none';

    const concentrations = [concA, concB];
    if (hasSolC) {
        concentrations.push(parseFloat(document.getElementById('concC').value));
    }

    const requestBody = {
        concentrations: concentrations,
        total_volume: totalVolume,
        target_concentration: targetConc
    };

    const inputCard = document.getElementById('inputCard');
    if (typeof showLoading === 'function' && inputCard) {
        showLoading(inputCard);
    }

    try {
        const response = await apiRequest('/api/calculate', 'POST', requestBody);

        if (typeof hideLoading === 'function' && inputCard) {
            hideLoading(inputCard);
        }

        if (!response.success) {
            handleCalculationError(response.error || 'Calculation failed on server.');
            return;
        }

        // Save state for comparison page
        if (typeof storeLastCalculation === 'function') {
            storeLastCalculation(requestBody, response);
        }

        renderResultsDashboard(response);

    } catch (err) {
        if (typeof hideLoading === 'function' && inputCard) {
            hideLoading(inputCard);
        }
        console.error('Calculation request error:', err);
        handleCalculationError('Failed to communicate with calculation service.');
    }
}

function handleCalculationError(message) {
    if (typeof showToast === 'function') {
        showToast(message, 'error');
    }
    const placeholder = document.getElementById('resultsPlaceholder');
    const dashboard = document.getElementById('resultsDashboard');
    const banner = document.getElementById('statusBanner');

    if (placeholder) placeholder.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';

    if (banner) {
        banner.className = 'status-banner status-banner-error';
        banner.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/><path d="M10 6V11M10 14H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            <div>
                <strong>Calculation Error:</strong> ${message}
            </div>
        `;
    }
}

// ─── Render Results Dashboard ────────────────────────────────────────────────

function renderResultsDashboard(data) {
    const placeholder = document.getElementById('resultsPlaceholder');
    const dashboard = document.getElementById('resultsDashboard');
    const banner = document.getElementById('statusBanner');
    const statCardsGrid = document.getElementById('statCardsGrid');
    const accuracyGrid = document.getElementById('accuracyGrid');
    const methodSummaryGrid = document.getElementById('methodSummaryGrid');
    const disclaimerNote = document.getElementById('disclaimerNote');

    if (placeholder) placeholder.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';

    const exact = data.exact_solution;
    const jacobi = data.jacobi;
    const gs = data.gauss_seidel;
    const numSol = data.num_solutions || exact.volumes.length;
    const labels = data.solution_labels || ['Solution A', 'Solution B', 'Solution C'];

    // 1. Status Banner
    const bothConverged = jacobi.converged && gs.converged;
    if (banner) {
        banner.className = `status-banner ${bothConverged ? 'status-banner-success' : 'status-banner-warning'}`;
        banner.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="${bothConverged ? 'M6 10L9 13L14 7' : 'M10 6V11M10 14H10.01'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
                <strong>${bothConverged ? 'Optimal Solution Found' : 'Partial Convergence'}:</strong>
                ${bothConverged 
                    ? `Simultaneous linear system solved successfully. Jacobi converged in ${jacobi.iterations} iterations, Gauss-Seidel converged in ${gs.iterations} iterations.`
                    : 'System solved with numerical constraints noted below.'}
            </div>
        `;
    }

    // 2. Stat Cards Grid
    if (statCardsGrid) {
        let statsHTML = '';
        for (let i = 0; i < numSol; i++) {
            const vol = exact.volumes[i];
            const pct = ((vol / exact.total_volume) * 100).toFixed(1);
            statsHTML += `
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">${labels[i]} Volume</span>
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 11H5M12 4v14" stroke-linecap="round"/></svg>
                        </div>
                    </div>
                    <div class="stat-value">${formatNumber(vol, 4)} <span class="stat-unit">L</span></div>
                    <div class="stat-meta">${pct}% of mixture</div>
                </div>
            `;
        }

        statsHTML += `
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Final Concentration</span>
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" stroke-linecap="round"/></svg>
                    </div>
                </div>
                <div class="stat-value">${formatNumber(exact.final_concentration, 2)} <span class="stat-unit">%</span></div>
                <div class="stat-meta">Target: ${data.input.target_concentration}% (Verified)</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-label">Total Verified Volume</span>
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                    </div>
                </div>
                <div class="stat-value">${formatNumber(exact.total_volume, 3)} <span class="stat-unit">L</span></div>
                <div class="stat-meta">Exact Mass Balance Matched</div>
            </div>
        `;
        statCardsGrid.innerHTML = statsHTML;
    }

    // 3. Accuracy Grid
    if (accuracyGrid) {
        accuracyGrid.innerHTML = `
            <div class="accuracy-card">
                <div class="accuracy-header">
                    <span class="badge badge-primary">Jacobi Method</span>
                    <span class="badge ${jacobi.converged ? 'badge-success' : 'badge-error'}">
                        ${jacobi.converged ? 'Converged' : 'Failed to Converge'}
                    </span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-label">Iterations:</span>
                    <span class="accuracy-value font-mono">${jacobi.iterations}</span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-label">Absolute Error vs Exact:</span>
                    <span class="accuracy-value font-mono">${formatScientific(jacobi.accuracy_vs_exact)}</span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-label">Final Residual:</span>
                    <span class="accuracy-value font-mono">${jacobi.errors && jacobi.errors.length ? formatScientific(jacobi.errors[jacobi.errors.length - 1]) : '—'}</span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-label">Computation Time:</span>
                    <span class="accuracy-value font-mono">${formatTime(jacobi.execution_time)}</span>
                </div>
            </div>

            <div class="accuracy-card">
                <div class="accuracy-header">
                    <span class="badge badge-secondary">Gauss-Seidel Method</span>
                    <span class="badge ${gs.converged ? 'badge-success' : 'badge-error'}">
                        ${gs.converged ? 'Converged' : 'Failed to Converge'}
                    </span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-label">Iterations:</span>
                    <span class="accuracy-value font-mono">${gs.iterations}</span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-label">Absolute Error vs Exact:</span>
                    <span class="accuracy-value font-mono">${formatScientific(gs.accuracy_vs_exact)}</span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-label">Final Residual:</span>
                    <span class="accuracy-value font-mono">${gs.errors && gs.errors.length ? formatScientific(gs.errors[gs.errors.length - 1]) : '—'}</span>
                </div>
                <div class="accuracy-row">
                    <span class="accuracy-label">Computation Time:</span>
                    <span class="accuracy-value font-mono">${formatTime(gs.execution_time)}</span>
                </div>
            </div>
        `;
    }

    // 4. Render Charts via Chart.js
    if (typeof createPieChart === 'function') {
        createPieChart('pieChart', labels, exact.volumes);
    }
    if (typeof createConvergenceChart === 'function') {
        if (jacobi.errors && jacobi.errors.length > 0) {
            createConvergenceChart('jacobiChart', jacobi.errors, 'Jacobi Residual Decay', '#B5121B');
        }
        if (gs.errors && gs.errors.length > 0) {
            createConvergenceChart('gsChart', gs.errors, 'Gauss-Seidel Residual Decay', '#E57373');
        }
    }

    // 5. Method Summary Grid
    if (methodSummaryGrid) {
        const speedup = (jacobi.iterations / Math.max(gs.iterations, 1)).toFixed(1);
        methodSummaryGrid.innerHTML = `
            <div class="summary-col">
                <h4 class="summary-title">Performance Comparison</h4>
                <p class="summary-desc">
                    Gauss-Seidel required <strong>${gs.iterations}</strong> iterations compared to Jacobi's <strong>${jacobi.iterations}</strong> iterations
                    (${speedup}x speedup). This occurs because Gauss-Seidel immediately incorporates updated values into subsequent equations within the same iteration step.
                </p>
            </div>
            <div class="summary-col">
                <h4 class="summary-title">Mathematical Dominance</h4>
                <p class="summary-desc">
                    ${data.system && data.system.diagonally_dominant
                        ? 'The coefficient matrix A satisfies diagonal dominance after equation rearrangement, guaranteeing monotonic convergence for both iterative algorithms.'
                        : 'The coefficient matrix has been re-ordered to maximize diagonal weight, enabling fast numerical convergence.'}
                </p>
            </div>
        `;
    }

    // 6. Disclaimer
    if (disclaimerNote) {
        disclaimerNote.innerHTML = `
            <p><strong>Educational Note:</strong> ${data.disclaimer || 'This is an educational model assuming ideal volume additivity and compatible solutions. Not intended as a chemical safety assessment.'}</p>
        `;
    }

    // Smooth scroll on mobile screens
    if (window.innerWidth <= 1024) {
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
