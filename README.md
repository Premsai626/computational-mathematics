# ChemicalMix – Smart Chemical Solution Mixing Calculator

A professional web application that calculates chemical solution mixing proportions using computational mathematics. Built as a PPVC (Python Programming and Visual Computing) college project.

![Python](https://img.shields.io/badge/Python-3.8+-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-2.3+-green?logo=flask&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-1.24+-orange?logo=numpy&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.x-ff6384?logo=chartdotjs&logoColor=white)

---

## 📋 Overview

ChemicalMix solves the chemical solution mixing problem: given multiple solutions with known concentrations, determine the precise volumes needed to achieve a target concentration and total volume.

The application models this as a **system of simultaneous linear equations** and solves it using two iterative numerical methods:

- **Jacobi Iteration** – Updates all variables simultaneously using previous iteration values.
- **Gauss-Seidel Iteration** – Updates variables sequentially using the most recent values, typically converging faster.

> **Disclaimer:** This is an educational model assuming ideal volume additivity and compatible solutions. It is NOT a chemical safety or compatibility assessment tool.

---

## 🧮 Mathematical Model

For two solutions with concentrations C₁ and C₂, target concentration Cₜ, and total volume V:

```
Equation 1 (Volume):        x + y = V
Equation 2 (Concentration): C₁·x + C₂·y = Cₜ·V
```

Where x and y are the required volumes of Solution A and Solution B.

This system is expressed in matrix form **Ax = b** and solved using:

1. **Direct solution** (NumPy `linalg.solve`) for verification
2. **Jacobi iterative method** with convergence tracking
3. **Gauss-Seidel iterative method** with convergence tracking

---

## 🗂 Project Structure

```
ChemicalMix/
│
├── frontend/                    # Client-side web application
│   ├── index.html              # Landing page
│   ├── pages/
│   │   ├── calculator.html     # Calculator & results dashboard
│   │   ├── comparison.html     # Method comparison page
│   │   └── about.html          # About the project
│   ├── css/
│   │   └── style.css           # Complete stylesheet
│   └── js/
│       ├── app.js              # Shared utilities & navigation
│       ├── calculator.js       # Calculator logic & results rendering
│       └── charts.js           # Chart.js visualization utilities
│
├── backend/                     # Python Flask server
│   ├── app.py                  # Flask API endpoints & static serving
│   ├── algorithms/
│   │   ├── __init__.py
│   │   ├── jacobi.py           # Jacobi iterative method
│   │   └── gauss_seidel.py     # Gauss-Seidel iterative method
│   ├── services/
│   │   ├── __init__.py
│   │   └── mixing.py           # Mixing service & equation builder
│   └── requirements.txt        # Python dependencies
│
└── README.md                   # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Python 3.8+** installed on your system
- **pip** (Python package manager)
- A modern web browser (Chrome, Firefox, Edge)

### Step 1: Clone or Download

```bash
cd your-project-directory
```

### Step 2: Install Python Dependencies

```bash
cd ChemicalMix/backend
pip install -r requirements.txt
```

This installs:
- `flask` – Web framework for the API server
- `flask-cors` – Cross-Origin Resource Sharing support
- `numpy` – Numerical computing library

### Step 3: Run the Application

```bash
cd ChemicalMix/backend
python app.py
```

You should see:

```
============================================================
  ChemicalMix - Smart Chemical Solution Mixing Calculator
  Server running at http://localhost:5000
============================================================
```

### Step 4: Open in Browser

Navigate to: **http://localhost:5000**

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |
| `POST` | `/api/calculate` | Calculate mixing proportions |
| `POST` | `/api/compare` | Compare Jacobi vs Gauss-Seidel |

### Example Request

```json
POST /api/calculate
Content-Type: application/json

{
    "concentrations": [20, 50],
    "total_volume": 10,
    "target_concentration": 35
}
```

### Example Response

```json
{
    "success": true,
    "exact_solution": {
        "volumes": [5.0, 5.0],
        "final_concentration": 35.0,
        "total_volume": 10.0
    },
    "jacobi": {
        "solution": [5.0, 5.0],
        "iterations": 25,
        "converged": true,
        "execution_time": 0.0012
    },
    "gauss_seidel": {
        "solution": [5.0, 5.0],
        "iterations": 15,
        "converged": true,
        "execution_time": 0.0008
    }
}
```

---

## 🧪 Sample Test Case

| Parameter | Value |
|-----------|-------|
| Solution A Concentration | 20% |
| Solution B Concentration | 50% |
| Total Volume | 10 Litres |
| Target Concentration | 35% |

**Expected Result:**

| Solution | Volume |
|----------|--------|
| Solution A | 5.0 Litres |
| Solution B | 5.0 Litres |
| **Total Volume** | **10.0 Litres** |
| **Final Concentration** | **35.0%** |

Both iterative methods converge to the exact solution.

---

## 🖥 Pages

1. **Home** (`/`) – Landing page with features overview and method introduction
2. **Calculator** (`/pages/calculator.html`) – Input parameters, calculate, and view results
3. **Method Comparison** (`/pages/comparison.html`) – Detailed Jacobi vs Gauss-Seidel comparison
4. **About** (`/pages/about.html`) – Project information, objectives, and team

---

## 📊 Visualizations

- **Pie Chart** – Solution volume proportions
- **Line Charts** – Convergence curves for Jacobi and Gauss-Seidel
- **Bar Chart** – Iteration count comparison
- **Overlay Chart** – Both convergence curves on a single plot

All charts are rendered dynamically using actual backend calculation data.

---

## 👥 Team

| Name | Roll No | Role |
|------|---------|------|
| Student Name 1 | XXXX001 | Backend Development |
| Student Name 2 | XXXX002 | Frontend Development |
| Student Name 3 | XXXX003 | Algorithm Implementation |

*(Update with actual team member details)*

---

## 📝 Technologies

| Technology | Purpose |
|------------|---------|
| Python 3 | Backend logic & mathematical computations |
| Flask | REST API framework |
| NumPy | Numerical computing & linear algebra |
| HTML5 | Page structure & semantics |
| CSS3 | Styling & responsive design |
| JavaScript (Vanilla) | Frontend interactivity |
| Chart.js | Data visualization |

---

## 📄 License

This project is developed for educational purposes as part of a college PPVC course project.

---

*Built with ❤️ for Computational Mathematics*

