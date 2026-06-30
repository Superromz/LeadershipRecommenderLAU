"""
Counterfactual Engine
Generates minimum-change counterfactual explanations.
Only behavioural features (Likert 1-5) are perturbed — these are actionable.
Demographics and cultural dimensions are not changed.
"""
import numpy as np
from itertools import combinations, product
from core.inference import get_pipeline, get_feature_names, BEHAVIOURAL_FEATURES, CLASS_NAMES


def generate_counterfactual(X_transformed: np.ndarray, original_class: int,
                             max_features: int = 3) -> dict | None:
    """
    Finds the minimum set of behavioural feature changes that shifts
    the predicted class away from original_class.

    Args:
        X_transformed: preprocessed feature vector, shape (1, n_features)
        original_class: the current predicted class index
        max_features: maximum number of features to change

    Returns:
        dict with counterfactual details, or None if not found
    """
    pipeline      = get_pipeline()
    feature_names = get_feature_names()
    classifier    = pipeline.named_steps['classifier']

    beh_indices = [feature_names.index(f) for f in BEHAVIOURAL_FEATURES]
    original_vec = X_transformed[0].copy()

    for n_changes in range(1, max_features + 1):
        for feat_combo in combinations(range(len(BEHAVIOURAL_FEATURES)), n_changes):
            feat_indices = [beh_indices[i] for i in feat_combo]

            for deltas in product([-1, 1], repeat=n_changes):
                candidate = original_vec.copy()
                changes   = []

                for feat_idx, delta in zip(feat_indices, deltas):
                    new_val              = candidate[feat_idx] + delta
                    original_val         = original_vec[feat_idx]
                    candidate[feat_idx]  = new_val
                    changes.append({
                        'feature':            feature_names[feat_idx],
                        'direction':          'increase' if delta > 0 else 'decrease',
                        'original_value_std': round(float(original_val), 3),
                        'new_value_std':      round(float(new_val), 3),
                    })

                new_class = int(classifier.predict(candidate.reshape(1, -1))[0])
                if new_class != original_class:
                    return {
                        'original_class_name':        CLASS_NAMES[original_class],
                        'counterfactual_class_name':  CLASS_NAMES[new_class],
                        'n_features_changed':         n_changes,
                        'changes':                    changes,
                        'valid':                      True,
                    }

    return None
