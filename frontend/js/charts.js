/**
 * ChemicalMix — Chart Utilities (Premium Crimson Theme)
 * ======================================================
 * Chart.js wrapper functions with sophisticated crimson, coral,
 * wine-red, and neutral styling for scientific analytics.
 *
 * All charts render strictly from real mathematical calculation results.
 */

// Store chart instances for proper lifecycle management and cleanup
const chartInstances = new Map();

// ─── Color Palette (Crimson SaaS Theme) ──────────────────────────────────────

const CHART_COLORS = {
    primary: '#B5121B',         // Deep Crimson
    primaryLight: '#FCEBEC',    // Pale Blush
    secondary: '#7A0C14',       // Wine Red
    secondaryLight: '#F5D0D3',  // Soft Wine
    accent: '#E57373',          // Coral Red
    accentLight: '#FFEBEE',     // Pale Coral
    charcoal: '#252525',        // Main Text
    mutedGrey: '#777777',       // Secondary Text
    border: '#EFE5E5',          // Soft Grey Border
    background: '#FAF8F8',      // Warm White
    white: '#FFFFFF',           // Pure White
    success: '#21865B',         // Green
    warning: '#D99B42',         // Amber
    error: '#D93025',           // Red
};

const PIE_PALETTE = [
    '#B5121B', // Deep Crimson (Solution A)
    '#E57373', // Coral Red (Solution B)
    '#7A0C14', // Wine Red (Solution C)
    '#D99B42', // Warm Amber (Solution D)
    '#4A5568', // Slate Grey (Solution E)
];

const PIE_PALETTE_LIGHT = [
    'rgba(181, 18, 27, 0.15)',
    'rgba(229, 115, 115, 0.20)',
    'rgba(122, 12, 20, 0.15)',
    'rgba(217, 155, 66, 0.20)',
    'rgba(74, 85, 104, 0.15)',
];

// ─── Default Chart.js Configuration ─────────────────────────────────────────

if (typeof Chart !== 'undefined') {
    Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.color = CHART_COLORS.mutedGrey;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.legend.labels.font = { size: 12, weight: '500' };
    Chart.defaults.plugins.tooltip.backgroundColor = CHART_COLORS.charcoal;
    Chart.defaults.plugins.tooltip.titleFont = { weight: '600', size: 12 };
    Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 6;
    Chart.defaults.plugins.tooltip.displayColors = true;
    Chart.defaults.plugins.tooltip.boxPadding = 4;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
}

// ─── Chart Cleanup ───────────────────────────────────────────────────────────

function destroyChart(canvasId) {
    if (chartInstances.has(canvasId)) {
        chartInstances.get(canvasId).destroy();
        chartInstances.delete(canvasId);
    }
}

function destroyAllCharts() {
    chartInstances.forEach((chart) => {
        if (chart && typeof chart.destroy === 'function') {
            chart.destroy();
        }
    });
    chartInstances.clear();
}

// ─── 1. Solution Proportions Doughnut Chart ──────────────────────────────────

function createPieChart(canvasId, labels, values, colors = null) {
    destroyChart(canvasId);

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element #${canvasId} not found`);
        return null;
    }

    const ctx = canvas.getContext('2d');
    const bgColors = colors || PIE_PALETTE.slice(0, labels.length);

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: bgColors,
                borderColor: CHART_COLORS.white,
                borderWidth: 2,
                hoverBackgroundColor: bgColors.map(c => c),
                hoverBorderWidth: 3,
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 16,
                        usePointStyle: true,
                        pointStyleWidth: 10,
                        font: { size: 12, weight: '500' },
                        color: CHART_COLORS.charcoal,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                            return ` ${label}: ${value.toFixed(4)} L (${pct}%)`;
                        }
                    }
                }
            },
            animation: {
                duration: 700,
                easing: 'easeOutQuart'
            }
        }
    });

    chartInstances.set(canvasId, chart);
    return chart;
}

// ─── 2. Convergence Line Chart (Single Method) ───────────────────────────────

function createConvergenceChart(canvasId, errors, label, color = null) {
    destroyChart(canvasId);

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element #${canvasId} not found`);
        return null;
    }

    const ctx = canvas.getContext('2d');
    const lineColor = color || CHART_COLORS.primary;
    const iterations = errors.map((_, i) => i + 1);

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: iterations,
            datasets: [{
                label: label || 'Residual Error',
                data: errors,
                borderColor: lineColor,
                backgroundColor: 'rgba(181, 18, 27, 0.05)',
                borderWidth: 2,
                pointRadius: errors.length > 50 ? 0 : 2.5,
                pointHoverRadius: 4.5,
                pointBackgroundColor: CHART_COLORS.white,
                pointBorderColor: lineColor,
                pointBorderWidth: 2,
                fill: true,
                tension: 0.25,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Iteration Number',
                        font: { size: 11, weight: '600' },
                        color: CHART_COLORS.charcoal,
                    },
                    grid: {
                        color: CHART_COLORS.border,
                        drawBorder: false,
                    },
                    ticks: {
                        maxTicksLimit: 12,
                        color: CHART_COLORS.mutedGrey,
                    }
                },
                y: {
                    type: 'linear',
                    title: {
                        display: true,
                        text: 'Infinity Norm Error ||x - x_old||',
                        font: { size: 11, weight: '600' },
                        color: CHART_COLORS.charcoal,
                    },
                    grid: {
                        color: CHART_COLORS.border,
                        drawBorder: false,
                    },
                    ticks: {
                        color: CHART_COLORS.mutedGrey,
                        callback: function(value) {
                            if (value === 0) return '0';
                            if (Math.abs(value) < 0.001 || Math.abs(value) > 1000) {
                                return value.toExponential(1);
                            }
                            return value.toFixed(3);
                        }
                    },
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 10,
                        font: { size: 12, weight: '500' },
                        color: CHART_COLORS.charcoal,
                    }
                },
                tooltip: {
                    callbacks: {
                        title: (items) => `Iteration ${items[0].label}`,
                        label: (context) => ` Error: ${formatScientific(context.parsed.y)}`
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeOutQuart'
            }
        }
    });

    chartInstances.set(canvasId, chart);
    return chart;
}

// ─── 3. Comparison Convergence Chart (Overlay) ───────────────────────────────

function createComparisonConvergenceChart(canvasId, jacobiErrors, gsErrors) {
    destroyChart(canvasId);

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element #${canvasId} not found`);
        return null;
    }

    const ctx = canvas.getContext('2d');
    const maxLen = Math.max(jacobiErrors.length, gsErrors.length);
    const labels = Array.from({ length: maxLen }, (_, i) => i + 1);

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Jacobi (${jacobiErrors.length} iters)`,
                    data: jacobiErrors,
                    borderColor: CHART_COLORS.primary, // Deep Crimson
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: maxLen > 50 ? 0 : 2.5,
                    pointHoverRadius: 4.5,
                    pointBackgroundColor: CHART_COLORS.white,
                    pointBorderColor: CHART_COLORS.primary,
                    pointBorderWidth: 1.5,
                    tension: 0.25,
                },
                {
                    label: `Gauss-Seidel (${gsErrors.length} iters)`,
                    data: gsErrors,
                    borderColor: CHART_COLORS.accent, // Coral Red
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [4, 4],
                    pointRadius: maxLen > 50 ? 0 : 2.5,
                    pointHoverRadius: 4.5,
                    pointBackgroundColor: CHART_COLORS.white,
                    pointBorderColor: CHART_COLORS.accent,
                    pointBorderWidth: 1.5,
                    tension: 0.25,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Iteration Number',
                        font: { size: 11, weight: '600' },
                        color: CHART_COLORS.charcoal,
                    },
                    grid: {
                        color: CHART_COLORS.border,
                        drawBorder: false,
                    },
                    ticks: {
                        maxTicksLimit: 12,
                        color: CHART_COLORS.mutedGrey,
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Residual Error (L_inf)',
                        font: { size: 11, weight: '600' },
                        color: CHART_COLORS.charcoal,
                    },
                    grid: {
                        color: CHART_COLORS.border,
                        drawBorder: false,
                    },
                    ticks: {
                        color: CHART_COLORS.mutedGrey,
                        callback: function(value) {
                            if (value === 0) return '0';
                            if (Math.abs(value) < 0.001 || Math.abs(value) > 1000) {
                                return value.toExponential(1);
                            }
                            return value.toFixed(3);
                        }
                    },
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 12, weight: '500' },
                        color: CHART_COLORS.charcoal,
                    }
                },
                tooltip: {
                    callbacks: {
                        title: (items) => `Iteration ${items[0].label}`,
                        label: (context) => ` ${context.dataset.label.split(' ')[0]}: ${formatScientific(context.parsed.y)}`
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeOutQuart'
            }
        }
    });

    chartInstances.set(canvasId, chart);
    return chart;
}

// ─── 4. Iteration Count Bar Chart ────────────────────────────────────────────

function createIterationBarChart(canvasId, jacobiIters, gsIters) {
    destroyChart(canvasId);

    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.warn(`Canvas element #${canvasId} not found`);
        return null;
    }

    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jacobi Method', 'Gauss-Seidel Method'],
            datasets: [{
                label: 'Iterations to Converge',
                data: [jacobiIters, gsIters],
                backgroundColor: [
                    CHART_COLORS.primary, // Deep Crimson
                    CHART_COLORS.accent,  // Coral Red
                ],
                borderColor: [
                    CHART_COLORS.primary,
                    CHART_COLORS.accent,
                ],
                borderWidth: 1,
                borderRadius: 6,
                barPercentage: 0.5,
                categoryPercentage: 0.6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: CHART_COLORS.charcoal,
                        font: { weight: '600' }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Iterations',
                        font: { size: 11, weight: '600' },
                        color: CHART_COLORS.charcoal,
                    },
                    grid: {
                        color: CHART_COLORS.border,
                        drawBorder: false,
                    },
                    ticks: {
                        color: CHART_COLORS.mutedGrey,
                        precision: 0,
                    },
                    beginAtZero: true,
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => ` ${context.parsed.y} iterations`
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeOutQuart'
            }
        }
    });

    chartInstances.set(canvasId, chart);
    return chart;
}
