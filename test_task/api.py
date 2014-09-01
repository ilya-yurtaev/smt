from tastypie.resources import ModelResource
from tastypie.authorization import Authorization

from .utils import get_models


class ResourceMixin(object):
    def build_schema(self):
        # get verbose names
        schema = super(ResourceMixin, self).build_schema()
        fields = self._meta.object_class._meta.fields

        for f in fields:
            schema["fields"][f.name]['verbose_name'] = f.verbose_name

        schema.update({
            'verbose_name': self._meta.object_class._meta.verbose_name,
            'verbose_name_plural':
                self._meta.object_class._meta.verbose_name_plural,
        })

        return schema


def build_resource(model):
    class_name = "{}Resource".format(model.__name__)

    class Meta:
        queryset = model.objects.all()
        resource_name = model._meta.db_table
        authorization = Authorization()

    attrs = {
        'Meta': Meta
    }

    return class_name, type(
        class_name, (ResourceMixin, ModelResource, ), attrs
    )


def build_resources(models):
    resources = dict(
        build_resource(model) for model in models
    )
    resources.update({'__all__': resources.keys()})

    return resources


locals().update(
    build_resources(get_models())
)
