# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('survey', '0018_auto_20150422_1214'),
    ]

    operations = [
        migrations.AddField(
            model_name='blockface',
            name='geom_centroid',
            field=django.contrib.gis.db.models.fields.PointField(srid=4326, null=True),
            preserve_default=True,
        ),
    ]
