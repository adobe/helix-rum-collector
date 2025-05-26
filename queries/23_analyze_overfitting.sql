-- Query to analyze training vs evaluation performance for boosted trees models
-- Checking for overfitting by comparing training and evaluation metrics

-- 1. Get overall model performance metrics (training vs evaluation)
WITH model_performance AS (
  SELECT 
    'v1.1.1' as model_version,
    'training' as metric_type,
    precision,
    recall,
    accuracy,
    f1_score,
    log_loss,
    roc_auc
  FROM ML.EVALUATE(MODEL `helix-225321.helix_rum_logs.cluster_classifier_v1_1_1`)
  
  UNION ALL
  
  SELECT 
    'v1.1.1' as model_version,
    'evaluation' as metric_type,
    precision,
    recall,
    accuracy,
    f1_score,
    log_loss,
    roc_auc
  FROM ML.EVALUATE(MODEL `helix-225321.helix_rum_logs.cluster_classifier_v1_1_1`,
    (SELECT * FROM `helix-225321.helix_rum_logs.cluster_training_data_v1_1_1`
     WHERE MOD(ABS(FARM_FINGERPRINT(CAST(id AS STRING))), 10) >= 8))
  
  UNION ALL
  
  SELECT 
    'v1.1.1.1' as model_version,
    'training' as metric_type,
    precision,
    recall,
    accuracy,
    f1_score,
    log_loss,
    roc_auc
  FROM ML.EVALUATE(MODEL `helix-225321.helix_rum_logs.cluster_classifier_v1_1_1_1`)
  
  UNION ALL
  
  SELECT 
    'v1.1.1.1' as model_version,
    'evaluation' as metric_type,
    precision,
    recall,
    accuracy,
    f1_score,
    log_loss,
    roc_auc
  FROM ML.EVALUATE(MODEL `helix-225321.helix_rum_logs.cluster_classifier_v1_1_1_1`,
    (SELECT * FROM `helix-225321.helix_rum_logs.cluster_training_data_v1_1_1`
     WHERE MOD(ABS(FARM_FINGERPRINT(CAST(id AS STRING))), 10) >= 8))
),

-- 2. Get training info with loss curves
training_info AS (
  SELECT 
    'v1.1.1' as model_version,
    iteration,
    loss as training_loss,
    eval_loss as evaluation_loss,
    learn_rate,
    (loss - eval_loss) as loss_gap,
    ROUND((loss - eval_loss) / loss * 100, 2) as overfit_percentage
  FROM ML.TRAINING_INFO(MODEL `helix-225321.helix_rum_logs.cluster_classifier_v1_1_1`)
  WHERE iteration IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'v1.1.1.1' as model_version,
    iteration,
    loss as training_loss,
    eval_loss as evaluation_loss,
    learn_rate,
    (loss - eval_loss) as loss_gap,
    ROUND((loss - eval_loss) / loss * 100, 2) as overfit_percentage
  FROM ML.TRAINING_INFO(MODEL `helix-225321.helix_rum_logs.cluster_classifier_v1_1_1_1`)
  WHERE iteration IS NOT NULL
),

-- 3. Calculate overfitting indicators
overfitting_analysis AS (
  SELECT 
    model_version,
    MAX(iteration) as total_iterations,
    MIN(training_loss) as min_training_loss,
    MIN(evaluation_loss) as min_eval_loss,
    MAX(loss_gap) as max_loss_gap,
    AVG(loss_gap) as avg_loss_gap,
    MAX(overfit_percentage) as max_overfit_percentage,
    -- Check if eval loss increases while training loss decreases (classic overfitting)
    COUNTIF(training_loss < LAG(training_loss) OVER (PARTITION BY model_version ORDER BY iteration) 
            AND evaluation_loss > LAG(evaluation_loss) OVER (PARTITION BY model_version ORDER BY iteration)) as divergence_count
  FROM training_info
  GROUP BY model_version
),

-- 4. Get the final iteration metrics
final_iteration_metrics AS (
  SELECT 
    model_version,
    iteration,
    training_loss,
    evaluation_loss,
    loss_gap,
    overfit_percentage
  FROM (
    SELECT 
      *,
      ROW_NUMBER() OVER (PARTITION BY model_version ORDER BY iteration DESC) as rn
    FROM training_info
  )
  WHERE rn = 1
)

-- Final output combining all analyses
SELECT 
  'Performance Comparison' as analysis_type,
  model_version,
  metric_type,
  ROUND(accuracy, 4) as accuracy,
  ROUND(precision, 4) as precision,
  ROUND(recall, 4) as recall,
  ROUND(f1_score, 4) as f1_score,
  ROUND(log_loss, 4) as log_loss,
  ROUND(roc_auc, 4) as roc_auc
FROM model_performance
ORDER BY model_version, metric_type DESC

UNION ALL

SELECT 
  'Overfitting Summary' as analysis_type,
  model_version,
  'summary' as metric_type,
  ROUND(min_training_loss, 4) as min_training_loss,
  ROUND(min_eval_loss, 4) as min_eval_loss,
  ROUND(max_loss_gap, 4) as max_loss_gap,
  ROUND(avg_loss_gap, 4) as avg_loss_gap,
  ROUND(max_overfit_percentage, 2) as max_overfit_pct,
  divergence_count
FROM overfitting_analysis

UNION ALL

SELECT 
  'Final Iteration' as analysis_type,
  model_version,
  CAST(iteration AS STRING) as metric_type,
  ROUND(training_loss, 4) as training_loss,
  ROUND(evaluation_loss, 4) as eval_loss,
  ROUND(loss_gap, 4) as loss_gap,
  ROUND(overfit_percentage, 2) as overfit_pct,
  NULL,
  NULL
FROM final_iteration_metrics
ORDER BY analysis_type, model_version;

-- Additional query to visualize loss curves
-- Run this separately to see the training progression
/*
SELECT 
  model_version,
  iteration,
  ROUND(training_loss, 4) as training_loss,
  ROUND(evaluation_loss, 4) as eval_loss,
  ROUND(loss_gap, 4) as gap,
  ROUND(overfit_percentage, 2) as overfit_pct
FROM training_info
WHERE MOD(iteration, 10) = 0  -- Sample every 10th iteration for readability
ORDER BY model_version, iteration;
*/

-- Query to check feature importance changes (potential indicator of overfitting)
/*
WITH feature_importance AS (
  SELECT 
    'v1.1.1' as model_version,
    feature,
    importance_weight,
    importance_gain,
    importance_cover
  FROM ML.FEATURE_IMPORTANCE(MODEL `helix-225321.helix_rum_logs.cluster_classifier_v1_1_1`)
  
  UNION ALL
  
  SELECT 
    'v1.1.1.1' as model_version,
    feature,
    importance_weight,
    importance_gain,
    importance_cover
  FROM ML.FEATURE_IMPORTANCE(MODEL `helix-225321.helix_rum_logs.cluster_classifier_v1_1_1_1`)
)
SELECT 
  model_version,
  feature,
  ROUND(importance_weight, 4) as weight,
  ROUND(importance_gain, 4) as gain,
  ROUND(importance_cover, 4) as cover
FROM feature_importance
WHERE importance_weight > 0.01  -- Show only features with >1% importance
ORDER BY model_version, importance_weight DESC
LIMIT 20;
*/