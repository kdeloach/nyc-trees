# -*- coding: utf-8 -*-
from __future__ import print_function
from __future__ import unicode_literals
from __future__ import division

import sys

from apps.core.models import User
from apps.users import can_show_full_name

from apps.survey.models import Survey, Territory, Blockface


def teammates_for_event(group, event, current_user):
    attendees = User.objects.exclude(id=current_user.id)\
                            .filter(eventregistration__event=event,
                                    eventregistration__did_attend=True)\
                            .order_by('username')
    return _teammates_context(attendees)


def teammates_for_individual_mapping(current_user):
    mappers = User.objects.exclude(id=current_user.id)\
                          .filter(individual_mapper=True)
    return _teammates_context(mappers)


def _teammates_context(users):
    return [_teammate_user_context(u) for u in users]


def _teammate_user_context(user):
    if can_show_full_name(user):
        full_name = ("%s %s" % (user.first_name, user.last_name)).strip()
    else:
        full_name = ""
    return {
        "user_id": user.id,
        "username": user.username,
        "full_name": full_name
    }


def group_percent_completed(group):
    group_blocks = Territory.objects \
        .filter(group=group) \
        .values_list('blockface_id', flat=True)

    group_blocks_count = group_blocks.count()

    if group_blocks_count > 0:
        completed_blocks = Survey.objects \
            .filter(blockface_id__in=group_blocks) \
            .filter(blockface__is_available=False) \
            .distinct('blockface')

        return "{:.1%}".format(
            float(completed_blocks.count()) / float(group_blocks.count()))
    else:
        return "0.0%"


def rebuild_geoms(blockfaces_qs):
    """Rebuild precomputed columns for all blockfaces"""
    blocks_count = blockfaces_qs.count()
    blocks_chunk = int(blocks_count * 0.10)

    sys.stderr.write('Rebuilding blockface geoms...\n')

    for i, block in enumerate(blockfaces_qs.iterator()):
        block.geom_centroid = block.geom.centroid
        block.save()

        # Display approximate progress complete
        if i % blocks_chunk == 0:
            percent_done = i / blocks_count
            sys.stderr.write('{0:.0f}%\n'.format(percent_done * 100))

    sys.stderr.write('Done\n')
