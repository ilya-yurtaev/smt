from tastypie.resources import ModelResource
from tastypie.authorization import Authorization

from .utils import get_models


def build_resource(model):
    class_name = "{}Resource".format(model.__name__)

    class Meta:
        queryset = model.objects.all()
        resource_name = model._meta.db_table
        authorization = Authorization()

    attrs = {
        'Meta': Meta
    }
    return class_name, type(class_name, (ModelResource, ), attrs)


def build_resources(models):
    resources = dict(
        build_resource(model) for model in models
    )
    resources.update({'__all__': resources.keys()})

    return resources


locals().update(
    build_resources(get_models())
)
