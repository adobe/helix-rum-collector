# model2esm - XGBoost Model to ESM Converter

Convert BigQuery ML exported XGBoost models to JavaScript ESM modules for use in the helix-rum-collector PII detection system.

## Overview

This tool converts XGBoost models (in `.bst` format) exported from BigQuery ML into JavaScript ESM modules that can be directly imported and used in Node.js applications. It's specifically designed for the PII detection models used in helix-rum-collector.

## Prerequisites

- Python 3.7+
- pip (Python package manager)

## Quick Start

```bash
# Navigate to the tool directory
cd tools/model2esm

# Run the setup script (creates venv and installs dependencies)
./setup.sh

# Run the converter
./run.sh
```

## Manual Setup

If you prefer to set up the environment manually:

### 1. Create and Activate Virtual Environment

```bash
# Navigate to the tool directory
cd tools/model2esm

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Download Model Files

The model files need to be downloaded from Google Cloud Storage using the `gcloud` CLI (authentication required):

```bash
# Ensure you're authenticated with gcloud
gcloud auth login

# Download the model file
gcloud storage cp \
  gs://optel-pii-detection-models/url-segment-classifier-1-1-1-2/model.bst \
  ../../models/pii-detection/model.bst

# Download the metadata file
mkdir -p ../../models/pii-detection/assets
gcloud storage cp \
  gs://optel-pii-detection-models/url-segment-classifier-1-1-1-2/assets/model_metadata.json \
  ../../models/pii-detection/assets/model_metadata.json
```

**Note**: You need to have the `gcloud` CLI installed and be authenticated with appropriate permissions to access the `optel-pii-detection-models` bucket.

## Usage

### Basic Usage

Convert the model to JavaScript ESM format:

```bash
# Using the run script (handles virtual environment automatically)
./run.sh

# Or manually with activated venv
source venv/bin/activate
python model2esm.py
```

This will:
1. Load the model from `models/pii-detection/model.bst`
2. Load metadata from `models/pii-detection/assets/model_metadata.json`
3. Convert the model to JavaScript format
4. Save the output to `src/xgboost-model.mjs`

### Specify Model Version

To specify a custom model version:

```bash
./run.sh --version 1.2.0
```

## Output Files

- **`src/xgboost-model.mjs`**: JavaScript ESM module containing the full model

## Model File Structure

The generated ESM module exports a model object with the following structure:

```javascript
export const model = {
  version: '1.1.1.2',
  num_trees: 2000,
  trees: [
    {
      feature: 'feature_name',
      threshold: 0.5,
      yes: { /* left subtree */ },
      no: { /* right subtree */ }
    },
    // ... more trees
  ]
};
```

## Troubleshooting

### Model files not found

If the script reports that model files are not found, it will provide the exact commands needed to download them from Google Cloud Storage.

### XGBoost not installed

If you see an error about xgboost not being installed, make sure you've activated the virtual environment and installed the requirements:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Permission denied

If you get a permission denied error when running the script, make sure it's executable:

```bash
chmod +x model2esm.py
```

## Development

To modify or extend this tool:

1. The main script is `model2esm.py`
2. Model files are expected in `models/pii-detection/`
3. Output files are placed in `src/`
4. The script uses relative paths from its location to find project directories

## License

Copyright 2025 Adobe. All rights reserved.
Licensed under the Apache License, Version 2.0.