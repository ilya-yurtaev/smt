from django.conf.urls import patterns, include, url
from django.views.generic.base import RedirectView

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns(
    '',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^test_task/', include('test_task.urls')),
    url(r'^$', RedirectView.as_view(url='/test_task/', permanent=True)),
)
