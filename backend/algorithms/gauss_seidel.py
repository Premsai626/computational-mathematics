"""
Gauss-Seidel Iterative Method for Solving Linear Systems
=========================================================
The Gauss-Seidel method improves upon Jacobi by using updated values
as soon as they are computed within the same iteration. This typically
leads to faster convergence.

For each variable x_i: x_i^(k+1) = (1/a_ii) * (b_i - Σ(j<i) a_ij*x_j^(k+1) - Σ(j>i) a_ij*x_j^(k))
"""

import numpy as np
import time


def gauss_seidel_method(A, b, tol=1e-10, max_iterations=1000):
    """
    Solve the system Ax = b using the Gauss-Seidel iterative method.

    Parameters:
        A (numpy.ndarray): Coefficient matrix (n x n)
        b (numpy.ndarray): Right-hand side vector (n,)
        tol (float): Convergence tolerance (default: 1e-10)
        max_iterations (int): Maximum number of iterations (default: 1000)

    Returns:
        dict: {
            'solution': numpy array of solution values,
            'iterations': number of iterations performed,
            'converged': boolean indicating convergence,
            'history': list of dicts [{iteration, values, error}],
            'errors': list of error values per iteration,
            'execution_time': time in seconds
        }
    """
    start_time = time.time()

    n = len(b)
    A = np.array(A, dtype=float)
    b = np.array(b, dtype=float)

    # Check for zero diagonal elements
    diag = np.diag(A)
    if np.any(diag == 0):
        return {
            'solution': None,
            'iterations': 0,
            'converged': False,
            'history': [],
            'errors': [],
            'execution_time': time.time() - start_time,
            'error_message': 'Zero diagonal element detected. Gauss-Seidel method cannot proceed.'
        }

    # Check diagonal dominance
    is_diag_dominant = True
    for i in range(n):
        row_sum = sum(abs(A[i][j]) for j in range(n) if j != i)
        if abs(A[i][i]) <= row_sum:
            is_diag_dominant = False
            break

    # Initialize solution vector
    x = np.zeros(n)
    history = []
    errors = []

    for iteration in range(1, max_iterations + 1):
        x_old = x.copy()

        # Gauss-Seidel update: use UPDATED values as soon as available
        for i in range(n):
            sigma = 0.0
            for j in range(n):
                if j != i:
                    sigma += A[i][j] * x[j]  # x[j] may already be updated in THIS iteration
            x[i] = (b[i] - sigma) / A[i][i]

        # Calculate error
        error = np.max(np.abs(x - x_old))

        history.append({
            'iteration': iteration,
            'values': x.tolist(),
            'error': float(error)
        })
        errors.append(float(error))

        if error < tol:
            return {
                'solution': x.tolist(),
                'iterations': iteration,
                'converged': True,
                'history': history,
                'errors': errors,
                'execution_time': time.time() - start_time,
                'diagonally_dominant': is_diag_dominant
            }

    return {
        'solution': x.tolist(),
        'iterations': max_iterations,
        'converged': False,
        'history': history,
        'errors': errors,
        'execution_time': time.time() - start_time,
        'diagonally_dominant': is_diag_dominant,
        'error_message': f'Did not converge within {max_iterations} iterations.'
    }
