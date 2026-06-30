"""
Inference Engine
Loads the trained sklearn Pipeline and runs predictions.
The pipeline (preprocessor + XGBoost classifier) was exported by 02_modeling.ipynb.
"""
import pickle
import json
import numpy as np
import pandas as pd
from pathlib import Path
from django.conf import settings

# ── Singleton state ──────────────────────────────────────────────────────────
_pipeline       = None
_feature_names  = None
_class_labels   = None
_model_metadata = None

# Hofstede cultural dimension averages per country (standard published scores)
# These are used to fill the cultural feature columns when a student selects their country.
HOFSTEDE_BY_COUNTRY = {
    'USA': {'Power_Distance': 40, 'Individualism': 91, 'Masculinity': 62,
            'Uncertainty_Avoidance': 46, 'Long_Term_Orientation': 26, 'Indulgence': 68},
    'JPN': {'Power_Distance': 54, 'Individualism': 46, 'Masculinity': 95,
            'Uncertainty_Avoidance': 92, 'Long_Term_Orientation': 88, 'Indulgence': 42},
    'BRA': {'Power_Distance': 69, 'Individualism': 38, 'Masculinity': 49,
            'Uncertainty_Avoidance': 76, 'Long_Term_Orientation': 44, 'Indulgence': 59},
    'NGA': {'Power_Distance': 80, 'Individualism': 30, 'Masculinity': 60,
            'Uncertainty_Avoidance': 55, 'Long_Term_Orientation': 13, 'Indulgence': 84},
    'IND': {'Power_Distance': 77, 'Individualism': 48, 'Masculinity': 56,
            'Uncertainty_Avoidance': 40, 'Long_Term_Orientation': 51, 'Indulgence': 26},
}

BEHAVIOURAL_FEATURES = [
    'Role_Assumption', 'Production_Emphasis', 'Initiation_of_Structure',
    'Tolerance_of_Uncertainty', 'Integration', 'Consideration'
]
CULTURAL_FEATURES = [
    'Power_Distance', 'Individualism', 'Masculinity',
    'Uncertainty_Avoidance', 'Long_Term_Orientation', 'Indulgence'
]
NUMERIC_DEMO_FEATURES  = ['Age', 'Work_Experience_Years']
CATEGORICAL_FEATURES   = ['Country', 'Gender', 'Education_Level', 'Position_Level']
ALL_INPUT_FEATURES     = BEHAVIOURAL_FEATURES + CULTURAL_FEATURES + NUMERIC_DEMO_FEATURES + CATEGORICAL_FEATURES

CLASS_NAMES = ['Laissez-Faire', 'Supportive', 'Transactional', 'Transformational']


def load_artifacts():
    global _pipeline, _feature_names, _class_labels, _model_metadata
    models_dir = settings.MODELS_DIR

    with open(models_dir / 'trained_model.pkl', 'rb') as f:
        _pipeline = pickle.load(f)
    with open(models_dir / 'feature_names.json') as f:
        _feature_names = json.load(f)
    with open(models_dir / 'class_labels.json') as f:
        _class_labels = json.load(f)
    with open(models_dir / 'model_metadata.json') as f:
        _model_metadata = json.load(f)

    print(f'[Core] Model loaded: {_model_metadata["model_name"]} '
          f'(macro F1={_model_metadata["test_macro_f1"]})')


def build_feature_row(payload: dict) -> pd.DataFrame:
    """
    Builds a single-row DataFrame from student assessment payload.

    Expected payload keys:
        role_assumption, production_emphasis, initiation_of_structure,
        tolerance_of_uncertainty, integration, consideration  (int, 1-5)
        country  (str: USA/JPN/BRA/NGA/IND)
        age  (int)
        gender  (str: Male/Female/Other)
        education_level  (str: Bachelor/Master/PhD/Other)
        work_experience_years  (float)
        position_level  (str: Junior/Mid/Senior)
    """
    country = payload.get('country', 'USA')
    hofstede = HOFSTEDE_BY_COUNTRY.get(country, HOFSTEDE_BY_COUNTRY['USA'])

    row = {
        'Role_Assumption':           int(payload['role_assumption']),
        'Production_Emphasis':       int(payload['production_emphasis']),
        'Initiation_of_Structure':   int(payload['initiation_of_structure']),
        'Tolerance_of_Uncertainty':  int(payload['tolerance_of_uncertainty']),
        'Integration':               int(payload['integration']),
        'Consideration':             int(payload['consideration']),
        'Power_Distance':            hofstede['Power_Distance'],
        'Individualism':             hofstede['Individualism'],
        'Masculinity':               hofstede['Masculinity'],
        'Uncertainty_Avoidance':     hofstede['Uncertainty_Avoidance'],
        'Long_Term_Orientation':     hofstede['Long_Term_Orientation'],
        'Indulgence':                hofstede['Indulgence'],
        'Age':                       int(payload.get('age', 22)),
        'Work_Experience_Years':     float(payload.get('work_experience_years', 0.0)),
        'Country':                   country,
        'Gender':                    payload.get('gender', 'Male'),
        'Education_Level':           payload.get('education_level', 'Bachelor'),
        'Position_Level':            payload.get('position_level', 'Junior'),
    }
    return pd.DataFrame([row])


def predict(payload: dict) -> dict:
    """
    Runs inference on a student's assessment payload.
    Returns predicted class, class name, and class probabilities.
    """
    if _pipeline is None:
        raise RuntimeError('Model not loaded. Call load_artifacts() first.')

    df_row = build_feature_row(payload)
    preprocessor = _pipeline.named_steps['preprocessor']
    classifier   = _pipeline.named_steps['classifier']

    X_transformed = preprocessor.transform(df_row)
    pred_class    = int(classifier.predict(X_transformed)[0])
    pred_proba    = classifier.predict_proba(X_transformed)[0].tolist()

    return {
        'predicted_class':      pred_class,
        'predicted_class_name': CLASS_NAMES[pred_class],
        'probabilities': {
            CLASS_NAMES[i]: round(p, 4) for i, p in enumerate(pred_proba)
        },
        'X_transformed': X_transformed,  # passed to SHAP engine
    }


def get_pipeline():
    return _pipeline


def get_feature_names():
    return _feature_names
