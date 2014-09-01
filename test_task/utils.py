# -*- coding: utf-8 -*-

from pymorphy2.analyzer import MorphAnalyzer


analyzer = MorphAnalyzer()


def normal_form(word):
    """
    возвращает нормальную форму части речи:
    (им. падеж, ед.ч., инфинитив и т.п.)
    """
    try:
        return analyzer.parse(word)[0].normal_form
    except (IndexError, AttributeError):
        pass


def get_plurals(word):
    """
    Возвращает список числительныx форм (1, 2, 5):
        `попугай, попугая, попугаев`
    """
    word = analyzer.parse(word)[0]

    return [word.make_agree_with_number(x).word for x in [1, 2, 5]]


def get_inflections(word):
    """
    Возвращает все склонения
    """
    word = analyzer.parse(word)[0]

    return dict((x, word.inflect({x}).word) for x in [
        'nomn', 'gent', 'datv', 'accs', 'ablt', 'loct'
    ])


def get_models():
    # можно закешировать, конечно
    from . import models
    return [getattr(models, m) for m in models.__all__]
