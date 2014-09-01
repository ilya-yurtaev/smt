from django.conf.urls import patterns, include, url

from tastypie.api import Api

from .views import IndexView
from . import api


v1_api = Api(api_name='v1')

for resource in api.__all__:
    v1_api.register(getattr(api, resource)())


urlpatterns = patterns(
    '',
    url(r'^api/', include(v1_api.urls)),
    url(r'^$', IndexView.as_view(), name="test_task_index"),
)
