from django.contrib import admin

from .utils import get_models


for model in get_models():
    admin.site.register(model)
