# -*- coding: utf-8 -*-

from pymorphy2.analyzer import MorphAnalyzer


analyzer = MorphAnalyzer()


def normal_form(word):
    """"
    возвращает нормальную форму части речи:
    (им. падеж, ед.ч., инфинитив и т.п.)
    """
    try:
        return analyzer.parse(word)[0].normal_form
    except (IndexError, AttributeError):
        pass


def get_models():
    # можно закешировать, конечно
    from . import models
    return [getattr(models, m) for m in models.__all__]
