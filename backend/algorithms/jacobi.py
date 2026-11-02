"""
Jacobi Iterative Method for Solving Linear Systems
====================================================
The Jacobi method is an iterative algorithm for solving a system of linear
equations Ax = b. It decomposes matrix A into diagonal (D) and remainder (R)
components, then iteratively computes: x^(k+1) = D^(-1) * (b - R * x^(k))

Convergence is guaranteed when the matrix A is strictly diagonally dominant.
"""

import numpy as np
import time


def jacobi_method(A, b, tol=1e-10, max_iterations=1000):
    """
    Solve the system Ax = b using the Jacobi iterative method.

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
            'history': list of dicts with iteration data [{iteration, values, error}],
            'errors': list of error values per iteration,
            'execution_time': time in seconds
        }
    """
    start_time = time.time()

    n = len(b)
    A = np.array(A, dtype=float)
    b = np.array(b, dtype=float)

    # Check for zero diagonal elements (would cause division by zero)
    diag = np.diag(A)
    if np.any(diag == 0):
        return {
            'solution': None,
            'iterations': 0,
            'converged': False,
            'history': [],
            'errors': [],
            'execution_time': time.time() - start_time,
            'error_message': 'Zero diagonal element detected. Jacobi method cannot proceed.'
        }

    # Check diagonal dominance (warning, not a hard stop)
    is_diag_dominant = True
    for i in range(n):
        row_sum = sum(abs(A[i][j]) for j in range(n) if j != i)
        if abs(A[i][i]) <= row_sum:
            is_diag_dominant = False
            break

    # Initialize solution vector with zeros
    x = np.zeros(n)
    history = []
    errors = []

    for iteration in range(1, max_iterations + 1):
        x_new = np.zeros(n)

        # Jacobi update: for each equation, solve for x_i using previous iteration values
        for i in range(n):
            sigma = 0.0
            for j in range(n):
                if j != i:
                    sigma += A[i][j] * x[j]  # Use values from PREVIOUS iteration
            x_new[i] = (b[i] - sigma) / A[i][i]

        # Calculate error (infinity norm of difference)
        error = np.max(np.abs(x_new - x))

        # Record iteration history
        history.append({
            'iteration': iteration,
            'values': x_new.tolist(),
            'error': float(error)
        })
        errors.append(float(error))

        # Check convergence
        if error < tol:
            return {
                'solution': x_new.tolist(),
                'iterations': iteration,
                'converged': True,
                'history': history,
                'errors': errors,
                'execution_time': time.time() - start_time,
                'diagonally_dominant': is_diag_dominant
            }

        x = x_new.copy()

    # Did not converge within max iterations
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
