"""
ChemicalMix - Production WSGI Entry Point
==========================================
Used by Gunicorn on Render or other production WSGI servers.
Exposes the Flask 'app' instance from backend.app.
"""

import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
