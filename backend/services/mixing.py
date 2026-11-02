"""
Chemical Solution Mixing Service
==================================
Constructs systems of linear equations for chemical mixing problems
and validates the mathematical constraints.

For a two-solution mixing problem:
    Equation 1 (Volume):        x + y = V
    Equation 2 (Concentration): C1*x + C2*y = Ct * V

Where:
    x, y  = volumes of Solution A and Solution B (unknowns)
    C1, C2 = concentrations of Solution A and B (as fractions, e.g., 0.20 for 20%)
    Ct     = target concentration (as fraction)
    V      = total required volume

For three solutions, an additional constraint is needed. We use an equal-split
heuristic as a third equation (x = y), which provides a unique solution. This
is clearly documented as a simplification for the educational model.

Important: This is an educational model assuming ideal volume additivity and
compatible solutions. It is NOT a chemical safety or compatibility assessment.
"""

import numpy as np
from algorithms.jacobi import jacobi_method
from algorithms.gauss_seidel import gauss_seidel_method


def validate_inputs(concentrations, total_volume, target_concentration):
    """
    Validate all input parameters for the mixing calculation.

    Parameters:
        concentrations (list): Concentration values as percentages (0-100)
        total_volume (float): Total required volume in litres (must be > 0)
        target_concentration (float): Target concentration as percentage (0-100)

    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    # Check total volume
    if total_volume <= 0:
        return False, "Total volume must be greater than zero."

    # Check concentrations are within valid range
    for i, c in enumerate(concentrations):
        if c < 0 or c > 100:
            return False, f"Concentration of Solution {chr(65+i)} must be between 0% and 100%."

    # Check target concentration is within range
    if target_concentration < 0 or target_concentration > 100:
        return False, "Target concentration must be between 0% and 100%."

    # Check that target is between min and max concentrations
    min_conc = min(concentrations)
    max_conc = max(concentrations)
    if target_concentration < min_conc or target_concentration > max_conc:
        return False, (
            f"Target concentration ({target_concentration}%) must be between "
            f"the minimum ({min_conc}%) and maximum ({max_conc}%) solution concentrations."
        )

    # Check that concentrations are not all equal
    if len(set(concentrations)) == 1:
        return False, "All solution concentrations are identical. Mixing is trivial."

    # For two solutions: check they are not equal
    if len(concentrations) == 2 and concentrations[0] == concentrations[1]:
        return False, "Solution A and B have the same concentration. Cannot determine unique mixing ratio."

    return True, None


def build_system(concentrations, total_volume, target_concentration):
    """
    Build the system of linear equations Ax = b for the mixing problem.

    For 2 solutions:
        [  1    1  ] [x]   [ V     ]
        [ C1   C2  ] [y] = [ Ct*V  ]

    For 3 solutions:
        [  1    1    1  ] [x]   [ V       ]
        [ C1   C2   C3  ] [y] = [ Ct*V    ]
        [  1   -1    0  ] [z]   [ 0       ]

    The third equation (x = y) is a simplification for educational purposes.

    Parameters:
        concentrations (list): Concentration values as fractions (0 to 1)
        total_volume (float): Total volume
        target_concentration (float): Target concentration as fraction

    Returns:
        tuple: (A, b) - coefficient matrix and right-hand side vector
    """
    n = len(concentrations)

    if n == 2:
        A = np.array([
            [1.0, 1.0],
            [concentrations[0], concentrations[1]]
        ])
        b = np.array([total_volume, target_concentration * total_volume])
    elif n == 3:
        A = np.array([
            [1.0, 1.0, 1.0],
            [concentrations[0], concentrations[1], concentrations[2]],
            [1.0, -1.0, 0.0]
        ])
        b = np.array([
            total_volume,
            target_concentration * total_volume,
            0.0
        ])
    else:
        raise ValueError(f"Unsupported number of solutions: {n}. Only 2 or 3 solutions are supported.")

    return A, b


def make_diagonally_dominant(A, b):
    """
    Attempt to rearrange rows of the system to achieve diagonal dominance,
    which is required for convergence of Jacobi and Gauss-Seidel methods.

    Parameters:
        A (numpy.ndarray): Coefficient matrix
        b (numpy.ndarray): Right-hand side vector

    Returns:
        tuple: (A_rearranged, b_rearranged, success)
    """
    n = len(A)
    A = A.copy()
    b = b.copy()

    # Try to permute rows so that |a_ii| > sum of |a_ij| for j != i
    for i in range(n):
        # Find the row with the largest absolute value in column i
        max_row = i
        max_val = abs(A[i][i])
        for k in range(i + 1, n):
            if abs(A[k][i]) > max_val:
                max_val = abs(A[k][i])
                max_row = k

        if max_row != i:
            A[[i, max_row]] = A[[max_row, i]]
            b[[i, max_row]] = b[[max_row, i]]

    # Verify diagonal dominance
    is_dominant = True
    for i in range(n):
        row_sum = sum(abs(A[i][j]) for j in range(n) if j != i)
        if abs(A[i][i]) <= row_sum:
            is_dominant = False
            break

    return A, b, is_dominant


def calculate_mixing(concentrations, total_volume, target_concentration):
    """
    Main function to calculate chemical solution mixing proportions.

    This function:
    1. Validates inputs
    2. Builds the system of linear equations
    3. Attempts to make the system diagonally dominant
    4. Solves using both Jacobi and Gauss-Seidel methods
    5. Also computes the direct (exact) solution for verification
    6. Returns comprehensive results

    Parameters:
        concentrations (list): Concentration values as percentages (0-100)
        total_volume (float): Total volume in litres
        target_concentration (float): Target concentration as percentage (0-100)

    Returns:
        dict: Comprehensive calculation results
    """
    # Validate inputs
    is_valid, error_msg = validate_inputs(concentrations, total_volume, target_concentration)
    if not is_valid:
        return {'success': False, 'error': error_msg}

    # Convert percentages to fractions for calculation
    conc_fractions = [c / 100.0 for c in concentrations]
    target_fraction = target_concentration / 100.0

    # Build the system of equations
    A, b_vec = build_system(conc_fractions, total_volume, target_fraction)

    # Compute direct (exact) solution using NumPy for verification
    try:
        exact_solution = np.linalg.solve(A, b_vec)
    except np.linalg.LinAlgError:
        return {
            'success': False,
            'error': 'The system of equations is singular (no unique solution exists).'
        }

    # Check for negative volumes (physically impossible)
    if np.any(exact_solution < -1e-10):
        return {
            'success': False,
            'error': 'The target concentration cannot be achieved with the given solutions (negative volumes required).'
        }

    # Attempt to make diagonally dominant for iterative methods
    A_dd, b_dd, is_dominant = make_diagonally_dominant(A.copy(), b_vec.copy())

    # Solve using Jacobi method
    jacobi_result = jacobi_method(A_dd, b_dd, tol=1e-10, max_iterations=1000)

    # Solve using Gauss-Seidel method
    gauss_seidel_result = gauss_seidel_method(A_dd, b_dd, tol=1e-10, max_iterations=1000)

    # Calculate verification metrics
    n = len(concentrations)
    solution_labels = [f"Solution {chr(65+i)}" for i in range(n)]

    # Compute final concentration from exact solution for verification
    final_conc_exact = sum(conc_fractions[i] * exact_solution[i] for i in range(n)) / total_volume * 100

    # Compute numerical accuracy of iterative methods vs exact
    jacobi_accuracy = None
    gauss_seidel_accuracy = None

    if jacobi_result['solution'] is not None:
        jacobi_error_vs_exact = np.max(np.abs(np.array(jacobi_result['solution']) - exact_solution))
        jacobi_accuracy = float(jacobi_error_vs_exact)

    if gauss_seidel_result['solution'] is not None:
        gs_error_vs_exact = np.max(np.abs(np.array(gauss_seidel_result['solution']) - exact_solution))
        gauss_seidel_accuracy = float(gs_error_vs_exact)

    # Build the results
    results = {
        'success': True,
        'num_solutions': n,
        'solution_labels': solution_labels,
        'input': {
            'concentrations': concentrations,
            'total_volume': total_volume,
            'target_concentration': target_concentration
        },
        'exact_solution': {
            'volumes': exact_solution.tolist(),
            'final_concentration': round(float(final_conc_exact), 6),
            'total_volume': round(float(sum(exact_solution)), 6)
        },
        'system': {
            'A': A_dd.tolist(),
            'b': b_dd.tolist(),
            'diagonally_dominant': is_dominant
        },
        'jacobi': {
            'solution': jacobi_result['solution'],
            'iterations': jacobi_result['iterations'],
            'converged': jacobi_result['converged'],
            'history': jacobi_result['history'],
            'errors': jacobi_result['errors'],
            'execution_time': jacobi_result['execution_time'],
            'accuracy_vs_exact': jacobi_accuracy,
            'error_message': jacobi_result.get('error_message')
        },
        'gauss_seidel': {
            'solution': gauss_seidel_result['solution'],
            'iterations': gauss_seidel_result['iterations'],
            'converged': gauss_seidel_result['converged'],
            'history': gauss_seidel_result['history'],
            'errors': gauss_seidel_result['errors'],
            'execution_time': gauss_seidel_result['execution_time'],
            'accuracy_vs_exact': gauss_seidel_accuracy,
            'error_message': gauss_seidel_result.get('error_message')
        },
        'disclaimer': (
            'This is an educational model assuming ideal volume additivity and '
            'compatible solutions. It is NOT a chemical safety or compatibility assessment.'
        )
    }

    return results
