# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations

from apps.survey.helpers import rebuild_geoms


def migrate_data(apps, schema_editor):
    Blockface = apps.get_model('survey', 'Blockface')
    rebuild_geoms(Blockface.objects.all())


def no_op(*args, **kwargs):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('survey', '0019_auto_20150429_1456'),
    ]

    operations = [
        migrations.RunPython(migrate_data, reverse_code=no_op)
    ]
