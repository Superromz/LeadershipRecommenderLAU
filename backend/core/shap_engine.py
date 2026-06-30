"""
SHAP Engine
Loads the SHAP TreeExplainer and computes per-student feature contributions.
"""
import pickle
import numpy as np
from django.conf import settings
from core.inference import get_feature_names, BEHAVIOURAL_FEATURES

_explainer = None


def load_shap_explainer():
    global _explainer
    with open(settings.MODELS_DIR / 'shap_explainer.pkl', 'rb') as f:
        _explainer = pickle.load(f)
    print('[Core] SHAP explainer loaded.')


def get_explainer():
    return _explainer


def compute_shap(X_transformed: np.ndarray, predicted_class: int) -> dict:
    """
    Computes SHAP values for a single transformed feature vector.

    Returns:
        top3: list of top-3 features by |SHAP| for the predicted class
        all_shap: dict of feature -> SHAP value for the predicted class
    """
    if _explainer is None:
        raise RuntimeError('SHAP explainer not loaded.')

    feature_names = get_feature_names()

    # shap_values shape: (1, n_features, n_classes) for multi-class XGBoost
    shap_vals = np.array(_explainer.shap_values(X_transformed))

    if shap_vals.ndim == 3:
        # shape: (n_samples, n_features, n_classes)
        class_shap = shap_vals[0, :, predicted_class]
    else:
        class_shap = shap_vals[0]

    # Top-3 features by absolute SHAP value
    top3_idx = np.argsort(np.abs(class_shap))[::-1][:3]
    top3 = [
        {
            'feature':     feature_names[i],
            'shap_value':  round(float(class_shap[i]), 4),
            'direction':   'increases' if class_shap[i] > 0 else 'decreases',
            'is_behavioural': feature_names[i] in BEHAVIOURAL_FEATURES,
        }
        for i in top3_idx
    ]

    all_shap = {
        feature_names[i]: round(float(class_shap[i]), 4)
        for i in range(len(feature_names))
    }

    return {'top3': top3, 'all_shap': all_shap}
