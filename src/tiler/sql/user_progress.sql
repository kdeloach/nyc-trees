-- The 'DISTINCT ON' and 'ORDER BY' clause are needed so that we only use
-- the latest survey for a blockface
(SELECT
  DISTINCT ON (block.id)
  <% if (zoom < 12) { %>
    block.geom_centroid
  <% } else { %>block.geom<% } %> as geom,
  block.id,
  CASE
    WHEN survey.user_id IS NOT DISTINCT FROM <%= user_id %> THEN 'T'
    ELSE 'F'
  END AS is_mapped
  FROM survey_blockface AS block
  LEFT OUTER JOIN survey_survey AS survey
    ON block.id = survey.blockface_id
  ORDER BY block.id, survey.created_at DESC NULLS LAST
) AS query
