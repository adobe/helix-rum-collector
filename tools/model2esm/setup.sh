#!/bin/bash
# Setup script for model2esm tool

echo "Setting up model2esm environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "Setup complete! To use model2esm:"
echo "  1. Activate the virtual environment: source venv/bin/activate"
echo "  2. Run the tool: python model2esm.py"
echo ""
echo "Or run directly with: ./run.sh"