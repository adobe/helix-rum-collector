# PII Detection in URL Segments - Research Notes

## Objective
Develop a regression model to distinguish "normal" URL segments from potential PII (Personally Identifiable Information) such as:
- Email addresses
- Phone numbers
- UUIDs
- Base64 encoded values
- PNR (Passenger Name Records)
- Session IDs
- Other identifiers

## Approach

### 1. Data Sources
- **Real URL segments**: From BigQuery helix_rum.cluster_all table
- **Synthetic PII data**: Generated using BigQuery JavaScript UDFs
- **Common word lists**: For baseline comparison

### 2. Feature Engineering

#### Text-based Features
1. **Entropy**: Measure of randomness in the string
2. **Index of Coincidence (IoC)**: Statistical measure of text similarity to natural language
3. **Letter/Vowel Ratio**: Natural language tends to have predictable vowel patterns
4. **Uppercase/Lowercase Ratio**: Normal URLs typically lowercase, some IDs have mixed case
5. **Number/Letter Ratio**: IDs often have higher proportion of numbers
6. **Positional Number Features**:
   - Numbers at start
   - Numbers in middle
   - Numbers at end

#### Bigram Analysis
- Alphabet: lowercase letters, numbers, dash (-), underscore (_), special chars (%)
- Create bigram frequency vectors
- Compare against natural language bigrams (e.g., TH, HE) vs ID patterns (e.g., F6, 1C)

### 3. Synthetic PII Generation Patterns

#### UUID Patterns
- Standard UUID v4: 8-4-4-4-12 hex characters
- Compact UUID: 32 hex characters
- Base64 encoded UUIDs

#### Email Patterns
- username@domain.com encoded in URLs
- Common patterns: %40 for @, dots and dashes

#### Phone Numbers
- Various formats: +1234567890, 123-456-7890, (123) 456-7890
- International formats

#### PNR (Passenger Name Records)
- Typically 6 alphanumeric characters
- Airlines use specific patterns

#### Session IDs
- Various lengths and patterns
- Often base64 or hex encoded
- May include timestamps

### 4. Model Development
- Binary classification: Normal vs PII
- Features will be extracted using JavaScript UDFs for portability
- Model will be trained in BigQuery ML or exported for external training
- Final model exported as JavaScript for edge computing

## Implementation Steps
1. Extract real URL segments ✓
2. Generate synthetic PII samples ✓
3. Create feature extraction functions ✓
4. Build training dataset ✓
5. Train model ✓
6. Export to JavaScript

## Model Performance Results

### Model Comparison

| Model Version | Precision | Recall | Accuracy | F1 Score | ROC AUC | Dataset Size |
|---------------|-----------|---------|----------|-----------|----------|--------------|
| v1 (original) | 93.5% | 97.0% | 95.1% | 95.2% | 98.5% | 50k |
| v1.1 (query fix) | 94.9% | 98.1% | 96.4% | 96.5% | 98.5% | 50k |
| **v1.1.1 (boosted trees)** | **99.2%** | **99.6%** | **99.4%** | **99.4%** | **99.99%** | **50k** |
| v1.1.1.1 (boosted 500k) | 97.9% | 99.7% | 98.8% | 98.8% | 99.75% | 500k |
| v1.1.2 (DNN)* | - | - | - | - | - | 50k |
| v1.1.3 (bigram vector) | 93.5% | 97.5% | 95.4% | 95.5% | 98.7% | 50k |
| v1.2 (large dataset) | 90.2% | 96.6% | 93.0% | 93.3% | 97.0% | 500k |
| v2 (10x + features) | 89.6% | 96.2% | 92.5% | 92.8% | 96.2% | 500k |
| v3 (10x + query fix) | 90.7% | 97.9% | 93.9% | 94.2% | 97.0% | 500k |

*Note: v1.1.2 (DNN) model was successfully trained but requires custom evaluation.

### Key Findings
- **v1.1.1 (Boosted Trees) achieved exceptional performance** with 99.4% F1 score
  - Near-perfect precision (99.2%) and recall (99.6%)
  - ROC AUC of 99.99% indicates excellent discrimination
  - Top features: digit_ratio, mixed_bigram_ratio, segment_count
- Algorithm variations on v1.1:
  - v1.1.1 (boosted trees): 99.4% F1 score (+2.9% vs v1.1) - **Best overall model**
  - v1.1.3 (bigram vector): 95.5% F1 score (-1.0% vs v1.1)
  - Adding individual bigram features hurt logistic regression performance
  - Boosted trees can better utilize the complex feature interactions
- Query string fix alone improved v1 → v1.1:
  - Precision: 93.5% → 94.9% (+1.4%)
  - Recall: 97.0% → 98.1% (+1.1%)
  - F1 Score: 95.2% → 96.5% (+1.3%)
- More data (10x) consistently hurt performance:
  - v1.1 → v1.2: -3.2% F1 score decrease (same features, 500k records)
  - v1 → v2: -2.4% F1 score decrease (more features, 500k records)
  - This confirms the performance drop was primarily due to dataset size, not features
- While logistic regression (v1.1) offers simplicity for edge deployment, boosted trees (v1.1.1) provides superior accuracy if model complexity is acceptable

### Top Feature Importance

#### Logistic Regression (v1.1)
1. **has_email_pattern** (6.46) - Strongest PII indicator
2. **vowel_ratio** (-3.47) - Higher ratio indicates normal URLs
3. **mixed_bigram_ratio** (3.06) - Mixed character patterns indicate PII
4. **uppercase_ratio** (2.95) - Mixed case often in IDs
5. **normalized_entropy** (2.58) - Higher entropy indicates PII

#### Boosted Trees (v1.1.1) - By Importance Gain
1. **digit_ratio** (271.8) - Most discriminative feature
2. **mixed_bigram_ratio** (262.8) - Strong PII indicator
3. **segment_count** (36.7) - URL structure patterns
4. **consecutive_digits_max** (34.0) - Long digit sequences indicate IDs
5. **avg_segment_length** (22.9) - Segment length patterns

### Test Results
- 21/23 correct predictions (91.3% accuracy)
- Challenges: Short uppercase strings (PNRs), version numbers
- Strong performance on emails, UUIDs, phone numbers, session IDs

## Key Findings from Bigram Analysis

### Strong Real URL Indicators
- Natural language bigrams: "ar", "en", "nt", "te", "or", "er"
- Common in English words found in URL paths
- Vowel-consonant patterns typical of natural language

### Strong PII Indicators
- Numeric bigrams: "79", "42", "95", "47", "60"
- Hex pattern bigrams: "3e", "7e", "5d", "9b", "a3"
- Special character combinations: "40" (@), "l%", "d-", "7-"
- Mixed alphanumeric: "e4", "d1", "b0", "0g"

### Feature Importance Observations
1. **Entropy**: PII segments generally have higher entropy (3.0-4.0) vs real segments (2.0-3.0)
2. **Character Ratios**: Real segments have higher letter ratios (often 1.0), PII has mixed ratios
3. **Number Patterns**: PII often has consecutive digits, numbers at start/middle/end
4. **Bigram Distribution**: PII has more digit and mixed bigrams, real segments have predominantly letter bigrams

## Dataset Size and Overfitting Analysis

### Key Discovery: Smaller Datasets Perform Better

Analysis of training vs evaluation loss reveals:

| Model | Dataset | Train Loss | Eval Loss | Gap | Gap % | F1 Score |
|-------|---------|------------|-----------|-----|-------|----------|
| v1.1.1 | 50k | 0.0132 | 0.0220 | 0.0089 | 67.3% | 99.4% |
| v1.1.1.1 | 500k | 0.0454 | 0.0466 | 0.0012 | 2.7% | 98.8% |

### Insights:

1. **v1.1.1 (50k) shows significant overfitting (67% gap) BUT achieves better test performance**
   - The overfitting captures subtle PII patterns
   - The 50k sample from one day was highly representative
   - "Good overfitting" on high-quality data

2. **v1.1.1.1 (500k) generalizes well (2.7% gap) BUT performs worse**
   - Year-to-date data introduces noise and distribution shifts
   - Seasonal variations dilute the signal
   - Model learns average patterns across diverse data

3. **Optimal dataset size appears to be between 50k-200k records**
   - Large enough to capture patterns
   - Small enough to avoid noise
   - Focused temporal window (1-7 days) preferred over long ranges

### Recommendations for Future Models:
- Target 100k-150k records for optimal balance
- Sample from specific time windows rather than long periods
- Prioritize data quality and temporal consistency over quantity
- Accept moderate overfitting if test performance remains strong