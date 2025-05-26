#!/bin/bash
# Run script for model2esm tool

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Running setup..."
    ./setup.sh
fi

# Activate virtual environment and run
source venv/bin/activate
python model2esm.py "$@"