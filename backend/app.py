"""
ChemicalMix - Flask API Server
================================
Provides REST API endpoints for the ChemicalMix web application.
All mathematical computations are performed in Python using NumPy.

Endpoints:
    GET  /api/health     - Health check
    POST /api/calculate  - Calculate mixing proportions
    POST /api/compare    - Compare Jacobi and Gauss-Seidel methods
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys

# Add backend directory to path for module imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.mixing import calculate_mixing

app = Flask(__name__, static_folder=None)
CORS(app)  # Enable CORS for frontend-backend communication

# Path to frontend directory
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')


# ─── Static File Serving ─────────────────────────────────────────────────────

@app.route('/')
def serve_index():
    """Serve the main landing page."""
    return send_from_directory(FRONTEND_DIR, 'index.html')


@app.route('/pages/<path:filename>')
def serve_pages(filename):
    """Serve HTML pages."""
    return send_from_directory(os.path.join(FRONTEND_DIR, 'pages'), filename)


@app.route('/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files."""
    return send_from_directory(os.path.join(FRONTEND_DIR, 'css'), filename)


@app.route('/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files."""
    return send_from_directory(os.path.join(FRONTEND_DIR, 'js'), filename)


# ─── API Endpoints ───────────────────────────────────────────────────────────

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    Returns server status and version information.
    """
    return jsonify({
        'status': 'healthy',
        'application': 'ChemicalMix',
        'version': '1.0.0',
        'description': 'Smart Chemical Solution Mixing Calculator'
    })


@app.route('/api/calculate', methods=['POST'])
def calculate():
    """
    Calculate mixing proportions for given solutions.

    Expected JSON body:
    {
        "concentrations": [20, 50],       // Concentration percentages
        "total_volume": 10,                // Total volume in litres
        "target_concentration": 35         // Target concentration percentage
    }

    Returns comprehensive calculation results including:
    - Exact solution
    - Jacobi method results with iteration history
    - Gauss-Seidel method results with iteration history
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided.'}), 400

        # Extract and validate required fields
        concentrations = data.get('concentrations')
        total_volume = data.get('total_volume')
        target_concentration = data.get('target_concentration')

        if concentrations is None:
            return jsonify({'success': False, 'error': 'Missing field: concentrations'}), 400
        if total_volume is None:
            return jsonify({'success': False, 'error': 'Missing field: total_volume'}), 400
        if target_concentration is None:
            return jsonify({'success': False, 'error': 'Missing field: target_concentration'}), 400

        # Type validation
        if not isinstance(concentrations, list) or len(concentrations) < 2:
            return jsonify({'success': False, 'error': 'concentrations must be a list with at least 2 values.'}), 400

        if len(concentrations) > 3:
            return jsonify({'success': False, 'error': 'Maximum 3 solutions are supported.'}), 400

        try:
            concentrations = [float(c) for c in concentrations]
            total_volume = float(total_volume)
            target_concentration = float(target_concentration)
        except (TypeError, ValueError):
            return jsonify({'success': False, 'error': 'All values must be valid numbers.'}), 400

        # Perform calculation
        result = calculate_mixing(concentrations, total_volume, target_concentration)

        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/compare', methods=['POST'])
def compare():
    """
    Compare Jacobi and Gauss-Seidel methods for the given problem.
    Returns focused comparison data.

    Same input format as /api/calculate.
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'success': False, 'error': 'No JSON data provided.'}), 400

        concentrations = data.get('concentrations')
        total_volume = data.get('total_volume')
        target_concentration = data.get('target_concentration')

        if concentrations is None or total_volume is None or target_concentration is None:
            return jsonify({'success': False, 'error': 'Missing required fields.'}), 400

        try:
            concentrations = [float(c) for c in concentrations]
            total_volume = float(total_volume)
            target_concentration = float(target_concentration)
        except (TypeError, ValueError):
            return jsonify({'success': False, 'error': 'All values must be valid numbers.'}), 400

        # Calculate using the mixing service
        result = calculate_mixing(concentrations, total_volume, target_concentration)

        if not result['success']:
            return jsonify(result), 400

        # Build comparison response
        comparison = {
            'success': True,
            'num_solutions': result['num_solutions'],
            'input': result['input'],
            'exact_solution': result['exact_solution'],
            'system': result['system'],
            'solution_labels': result['solution_labels'],
            'jacobi': result['jacobi'],
            'gauss_seidel': result['gauss_seidel'],
            'comparison': {
                'jacobi': {
                    'iterations': result['jacobi']['iterations'],
                    'converged': result['jacobi']['converged'],
                    'execution_time': result['jacobi']['execution_time'],
                    'final_error': result['jacobi']['errors'][-1] if result['jacobi']['errors'] else None,
                    'accuracy_vs_exact': result['jacobi']['accuracy_vs_exact'],
                    'solution': result['jacobi']['solution']
                },
                'gauss_seidel': {
                    'iterations': result['gauss_seidel']['iterations'],
                    'converged': result['gauss_seidel']['converged'],
                    'execution_time': result['gauss_seidel']['execution_time'],
                    'final_error': result['gauss_seidel']['errors'][-1] if result['gauss_seidel']['errors'] else None,
                    'accuracy_vs_exact': result['gauss_seidel']['accuracy_vs_exact'],
                    'solution': result['gauss_seidel']['solution']
                }
            },
            'jacobi_detail': result['jacobi'],
            'gauss_seidel_detail': result['gauss_seidel'],
            'disclaimer': result['disclaimer']
        }

        return jsonify(comparison), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


if __name__ == '__main__':
    print("=" * 60)
    print("  ChemicalMix - Smart Chemical Solution Mixing Calculator")
    print("  Server running at http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=False)
