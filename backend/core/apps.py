from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        # Pre-load model artifacts when Django starts up.
        # This avoids reloading the pkl files on every request.
        from core.inference import load_artifacts
        load_artifacts()
