#!/usr/bin/env python
"""
Simple launcher script that sets up the Python path correctly.
"""
import os
import sys
import uvicorn

# Add the current directory to the Python path
current_dir = os.path.abspath(os.path.dirname(__file__))
sys.path.append(current_dir)

if __name__ == "__main__":
    # Import the app from src.main after the path is set up
    from src.main import app
    
    print("Starting API server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
