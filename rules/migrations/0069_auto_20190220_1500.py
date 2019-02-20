# -*- coding: utf-8 -*-
# Generated by Django 1.11.16 on 2019-02-20 15:00
from __future__ import unicode_literals

from django.db import migrations, models
import rules.validators


class Migration(migrations.Migration):

    dependencies = [
        ('rules', '0068_auto_20180818_2204'),
    ]

    operations = [
        migrations.AlterField(
            model_name='threshold',
            name='net',
            field=models.CharField(blank=True, max_length=100, validators=[rules.validators.validate_address_or_network]),
        ),
    ]
