import os

from django.conf import settings

from .builder import build_models_from_file


MODELS_FILE = getattr(
    settings, "MODELS_FILE",
    os.path.join(settings.BASE_DIR, "models.yml")
)


locals().update(build_models_from_file(MODELS_FILE, __name__))
