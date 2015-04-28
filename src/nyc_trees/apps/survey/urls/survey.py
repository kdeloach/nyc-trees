# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

from django.conf.urls import patterns, url

from apps.survey.routes import (survey, survey_from_event,
                                flag_survey, survey_detail,
                                confirm_survey, confirm_survey_from_event,
                                release_blockface, redirect_to_treecorder,
                                fetch_user_blockface, fetch_event_blockface)


# These URLs have the prefix 'survey/'
urlpatterns = patterns(
    '',
    # confirm endpoint (independent / from event)
    url(r'^confirm/(?P<survey_id>\d+)/$',
        confirm_survey, name='confirm_survey'),
    url(r'^(?P<group_slug>[\w-]+)/event/(?P<event_slug>[\w-]+)'
        r'/confirm/(?P<survey_id>\d+)/$',
        confirm_survey_from_event, name='confirm_survey_from_event'),

    url(r'^treecorder/$', redirect_to_treecorder, name='treecorder'),

    # Keep in sync with js/src/lib/mapUtil.js
    url(r'^blockedge/(?P<blockface_id>\d+)/$', fetch_user_blockface,
        name='fetch_user_blockface'),

    # Keep in sync with js/src/lib/mapUtil.js
    url(r'^(?P<group_slug>[\w-]+)/event/(?P<event_slug>[\w-]+)'
        r'/blockedge/(?P<blockface_id>\d+)/$',
        fetch_event_blockface, name='fetch_event_blockface'),

    # main endpoint (independent / from event)
    url(r'^$', survey, name='survey'),
    url(r'^(?P<group_slug>[\w-]+)/event/(?P<event_slug>[\w-]+)/$',
        survey_from_event, name='survey_from_event'),

    # these endpoints are terminal, so they don't need to carry
    # along origin source information
    url(r'^detail/(?P<survey_id>\d+)/$', survey_detail, name='survey_detail'),

    url(r'^flag/(?P<survey_id>\d+)/$', flag_survey, name='flag_survey'),

    url(r'^release_blockedge/(?P<survey_id>\d+)/$',
        release_blockface, name='release_blockface'),
)
