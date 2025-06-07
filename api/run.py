#!/usr/bin/env python
"""
Wrapper script to run the API application.
This script handles the imports properly by setting up the Python path.
"""
import os
import sys

# Add the current directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Now import and run the main module
from src.main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
