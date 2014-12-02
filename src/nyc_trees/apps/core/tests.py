# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

from django.test import TestCase
from django.core.exceptions import ValidationError

from apps.core.models import User, Group


class UserModelTest(TestCase):
    def test_email_uniqueness(self):
        guy = User(username='guy', email='person@person.com')
        guy.set_password('password')
        guy.save()

        gal = User(username='gal', email='person@person.com')
        gal.set_password('password')

        with self.assertRaises(ValidationError) as ec:
            gal.clean_and_save()

        self.assertIn('email', ec.exception.error_dict)


class GroupModelTest(TestCase):
    def test_slugification(self):
        user = User.objects.create(username='hfarnesworth',
                                   email='prof@planetexpress.nyc',
                                   password='password')
        group = Group(
            name='Planet Express',
            admin=user,
            contact_email='info@planetexpress.com',
            contact_url='https://planetexpress.nyc',
            image='./photo.png'
        )
        group.clean_and_save()

        self.assertEqual('planet-express', group.slug)
