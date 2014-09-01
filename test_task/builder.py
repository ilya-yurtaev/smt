# -*- coding: utf-8 -*-

import re

from django.db import models

from .utils import normal_form
from .loaders import yaml_loader


FIELD_MAP = {
    'char': ('CharField', {'max_length': 255}),
    'date': ('DateField', {}),
    'int': ('IntegerField', {'default': 0}),
    'bool': ('BooleanField', {'default': True}),
}


def table2model(table_name):
    return re.sub(r'[\s_-]+', '', table_name.title())


def build_field(field):
    field_class, attrs = FIELD_MAP[field['type']]

    return getattr(models, field_class)(field['title'], **attrs)


def build_model(data, module_name):
    table_name, data = data
    class_name = table2model(table_name)

    class Meta:
        db_table = table_name
        verbose_name = normal_form(data['title']).title()
        verbose_name_plural = data['title']

    attrs = dict(
        (field['id'], build_field(field)) for field in data['fields']
    )
    attrs.update({
        'Meta': Meta,
        '__module__': module_name,
    })

    model = type(class_name, (models.Model, ), attrs)

    return model


def build_models_from_file(file_path, module_name):
    data = yaml_loader(file_path)

    models = dict(
        (table2model(model[0]), build_model(model, module_name)
         ) for model in data.iteritems()
    )

    models.update({'__all__': models.keys()})

    return models
