from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = "test_task/index.html"
