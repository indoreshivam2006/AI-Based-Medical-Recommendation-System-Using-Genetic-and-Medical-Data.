"""
explainability.py — SHAP-based Model Explainability
====================================================
Provides feature importance explanations for drug predictions using SHAP
(SHapley Additive exPlanations). Uses TreeExplainer for tree-based models
(Random Forest) and falls back to KernelExplainer for other model types.
"""

import numpy as np
import shap
import warnings

# Suppress SHAP's verbose warnings during computation
warnings.filterwarnings("ignore", category=UserWarning, module="shap")


def get_shap_explanation(model, input_data, feature_names: list = None) -> dict:
    """
    Compute SHAP values for a single prediction and return the top 5 most impactful features.

    Args:
        model: The trained scikit-learn model (e.g., RandomForestClassifier)
        input_data: A 2D numpy array or DataFrame of shape (1, n_features) — the single patient input
        feature_names: Optional list of feature names corresponding to columns in input_data

    Returns:
        Dictionary of {feature_name: shap_value} for the top 5 most impactful features,
        sorted by absolute impact (descending)
    """
    try:
        # Determine the appropriate SHAP explainer based on model type
        model_type = type(model).__name__

        if hasattr(model, 'estimators_') or model_type in [
            'RandomForestClassifier', 'RandomForestRegressor',
            'GradientBoostingClassifier', 'GradientBoostingRegressor',
            'DecisionTreeClassifier', 'DecisionTreeRegressor',
            'ExtraTreesClassifier', 'ExtraTreesRegressor',
            'XGBClassifier', 'XGBRegressor',
            'LGBMClassifier', 'LGBMRegressor',
        ]:
            # Use TreeExplainer for tree-based models (fast and exact)
            explainer = shap.TreeExplainer(model)
        else:
            # Fallback to KernelExplainer for non-tree models (SVM, etc.)
            # KernelExplainer requires a background dataset; use a small summary
            background = shap.sample(input_data, min(100, len(input_data))) if len(input_data) > 1 else input_data
            explainer = shap.KernelExplainer(model.predict_proba, background)

        # Compute SHAP values for the input
        shap_values = explainer.shap_values(input_data)

        # Handle multi-class output: shap_values is a list of arrays (one per class)
        if isinstance(shap_values, list):
            # Get the predicted class index
            predicted_class = model.predict(input_data)[0]
            class_list = list(model.classes_)

            if predicted_class in class_list:
                class_idx = class_list.index(predicted_class)
                values = shap_values[class_idx][0]  # SHAP values for the predicted class
            else:
                # Fallback: use the class with highest mean absolute SHAP
                values = np.mean([np.abs(sv[0]) for sv in shap_values], axis=0)
        else:
            # Binary classification or single output
            values = shap_values[0] if shap_values.ndim > 1 else shap_values

        # Get feature names
        if feature_names is None:
            if hasattr(input_data, 'columns'):
                feature_names = list(input_data.columns)
            else:
                feature_names = [f"Feature_{i}" for i in range(len(values))]

        # Create feature-value mapping
        feature_importance = {}
        for i, name in enumerate(feature_names):
            if i < len(values):
                feature_importance[name] = float(values[i])

        # Sort by absolute SHAP value (descending) and return top 5
        sorted_features = sorted(
            feature_importance.items(),
            key=lambda x: abs(x[1]),
            reverse=True
        )

        result = []
        for feat, val in sorted_features[:5]:
            result.append({
                "feature": str(feat),
                "importance": float(val)
            })
        return result

    except Exception as e:
        print(f"⚠️ SHAP explanation error: {e}")
        print("   → Falling back to Random Forest feature_importances_")

        # Fallback: use the model's built-in feature importance scores
        try:
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_

                # Build feature names list
                if feature_names is None:
                    if hasattr(input_data, 'columns'):
                        feature_names = list(input_data.columns)
                    else:
                        feature_names = [f"Feature_{i}" for i in range(len(importances))]

                # Create feature-importance mapping
                feature_importance = {}
                for i, name in enumerate(feature_names):
                    if i < len(importances):
                        feature_importance[name] = float(importances[i])

                # Sort by importance (descending) and return top 5
                sorted_features = sorted(
                    feature_importance.items(),
                    key=lambda x: abs(x[1]),
                    reverse=True
                )

                result = []
                for feat, val in sorted_features[:5]:
                    result.append({
                        "feature": str(feat),
                        "importance": float(val)
                    })
                print(f"   ✅ Fallback feature importances: {[f['feature'] for f in result]}")
                return result
            else:
                print("   ❌ Model has no feature_importances_ attribute")
                return [{"feature": "model_feature_importance", "importance": 0.0}]

        except Exception as fallback_err:
            print(f"   ❌ Fallback also failed: {fallback_err}")
            return [{"feature": "unavailable", "importance": 0.0}]
