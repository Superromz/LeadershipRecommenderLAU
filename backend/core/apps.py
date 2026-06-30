from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Pre-load all model artifacts when Django starts up.
        # Skips gracefully if model files are not yet present (e.g. during migrations).
        import warnings
        from core.inference import load_artifacts
        from core.shap_engine import load_shap_explainer
        try:
            load_artifacts()
            load_shap_explainer()
        except FileNotFoundError as e:
            warnings.warn(f'[Core] Model artifacts not found — skipping preload. {e}')
