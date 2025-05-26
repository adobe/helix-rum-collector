#!/usr/bin/env python3
"""
model2esm - Convert XGBoost model to JavaScript ESM module
Converts BigQuery ML exported XGBoost models to JavaScript for use in helix-rum-collector
"""

import json
import sys
import os
from pathlib import Path
from datetime import datetime
import argparse

# Define paths relative to the project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
MODELS_DIR = PROJECT_ROOT / "models" / "pii-detection"
SRC_DIR = PROJECT_ROOT / "src"

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import xgboost as xgb
        return xgb
    except ImportError:
        print("Error: xgboost is not installed.")
        print("Please run: pip install -r requirements.txt")
        print("Or: pip install xgboost")
        sys.exit(1)

def find_model_files():
    """Find model.bst and model_metadata.json files"""
    model_path = MODELS_DIR / "model.bst"
    metadata_path = MODELS_DIR / "assets" / "model_metadata.json"
    
    if not model_path.exists():
        print(f"Error: Model file not found at {model_path}")
        print("\nTo download the model files, run:")
        print("  gcloud auth login  # if not already authenticated")
        print("  gcloud storage cp \\")
        print("    gs://optel-pii-detection-models/url-segment-classifier-1-1-1-2/model.bst \\")
        print(f"    {model_path}")
        return None, None
    
    if not metadata_path.exists():
        print(f"Error: Metadata file not found at {metadata_path}")
        print("\nTo download the metadata file, run:")
        print("  mkdir -p " + str(metadata_path.parent))
        print("  gcloud storage cp \\")
        print("    gs://optel-pii-detection-models/url-segment-classifier-1-1-1-2/assets/model_metadata.json \\")
        print(f"    {metadata_path}")
        return None, None
    
    return model_path, metadata_path

def convert_tree(node, feature_names):
    """Convert a tree node to use feature names instead of indices"""
    if 'leaf' in node:
        return {'leaf': round(node['leaf'], 6)}
    
    # Extract feature index from 'f25' format
    feature_idx = int(node['split'][1:])
    feature_name = feature_names[feature_idx]
    
    return {
        'feature': feature_name,
        'threshold': round(node['split_condition'], 6),
        'yes': convert_tree(node['children'][0], feature_names),
        'no': convert_tree(node['children'][1], feature_names)
    }

def main():
    parser = argparse.ArgumentParser(description='Convert XGBoost model to JavaScript ESM module')
    parser.add_argument('--version', default='1.1.1.2', help='Model version (default: 1.1.1.2)')
    args = parser.parse_args()
    
    # Check dependencies
    xgb = check_dependencies()
    
    # Find model files
    model_path, metadata_path = find_model_files()
    if not model_path or not metadata_path:
        sys.exit(1)
    
    print(f"Loading model from {model_path}")
    
    # Load the model
    model = xgb.Booster(model_file=str(model_path))
    
    # Get model dump
    model_dump = model.get_dump(dump_format='json')
    
    # Parse the trees
    trees = []
    for tree_str in model_dump:
        tree_json = json.loads(tree_str)
        trees.append(tree_json)
    
    print(f"Found {len(trees)} trees in the model")
    
    # Load feature names from metadata
    print(f"Loading metadata from {metadata_path}")
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
        feature_names = metadata['feature_names']
    
    print(f"Found {len(feature_names)} features")
    
    # Convert all trees
    converted_trees = []
    for i, tree in enumerate(trees):
        if i % 100 == 0:
            print(f"Processing tree {i}...")
        converted_trees.append(convert_tree(tree, feature_names))
    
    # Create JavaScript ESM module
    js_content = f"""/*
 * Copyright {datetime.now().year} Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * XGBoost model for PII detection
 * Version: {args.version}
 * Trees: {len(converted_trees)}
 * Generated: {datetime.now().isoformat()}
 */

export const model = {{
  version: '{args.version}',
  num_trees: {len(converted_trees)},
  trees: {json.dumps(converted_trees, separators=(',', ':'))}
}};
"""
    
    # Save to JavaScript file in src directory
    output_path = SRC_DIR / "xgboost-model.mjs"
    with open(output_path, 'w') as f:
        f.write(js_content)
    
    print(f"Successfully exported {len(trees)} trees to {output_path}")
    
    # Check file size
    size_mb = os.path.getsize(output_path) / 1024 / 1024
    print(f"File size: {size_mb:.1f} MB")

if __name__ == "__main__":
    main()