from django.conf.urls import patterns, include, url

from tastypie.api import Api

from .views import IndexView
from . import api


dynamic_api = Api(api_name='dynamic')

for resource in api.__all__:
    dynamic_api.register(getattr(api, resource)())


urlpatterns = patterns(
    '',
    url(r'^api/', include(dynamic_api.urls)),
    url(r'^$', IndexView.as_view(), name="test_task_index"),
)
