-- Remove duplicates from petition_templates keeping only the first one
DELETE FROM petition_templates 
WHERE id NOT IN (
  SELECT DISTINCT ON (ordem) id 
  FROM petition_templates 
  ORDER BY ordem, created_at
);