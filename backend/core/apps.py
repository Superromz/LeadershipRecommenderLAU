from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Pre-load model artifacts when Django starts up.
        # Skips gracefully if model files are not yet present (e.g. during migrations).
        from core.inference import load_artifacts
        try:
            load_artifacts()
        except FileNotFoundError as e:
            import warnings
            warnings.warn(f'[Core] Model artifacts not found — skipping preload. {e}')
