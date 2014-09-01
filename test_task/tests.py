from django.test import TestCase, Client
from django.core.urlresolvers import reverse_lazy

from mixer.backend.django import mixer

from .utils import get_models


class DynamicModelsTest(TestCase):
    models = []
    number_of_instances = 5
    c = Client()

    def setUp(self):
        models = get_models()

        print "{} models found: {}".format(
            len(models), ', '.join(m.__name__ for m in models)
        )

        for model in models:
            self.models.append({
                'model': model,
                'instances': mixer.cycle(self.number_of_instances).blend(model)
            })

    def test_instances_creation(self):
        for data in self.models:
            self.assertEqual(
                type(data['instances'][0]), data['model']
            )
            self.assertTrue(
                data['model'].objects.first() in data['instances']
            )
            self.assertEqual(
                data['model'].objects.count(), self.number_of_instances
            )
            self.assertEqual(
                len(data['instances']), data['model'].objects.count()
            )

    def test_extended_api(self):
        response = self.c.get(reverse_lazy(''))
