-- Identificar e remover duplicatas do tema 15 (TELEFONIA-TV-INTERNET)
-- Manter apenas os 6 primeiros elementos (15.1 a 15.6) e remover duplicatas

-- Primeiro, vamos ver o que temos:
-- DELETE templates com ordem duplicada, mantendo apenas o mais antigo de cada ordem
WITH duplicates AS (
  SELECT id, ordem, created_at,
         ROW_NUMBER() OVER (PARTITION BY tema, ordem ORDER BY created_at ASC) as rn
  FROM petition_templates 
  WHERE tema = 'TELEFONIA-TV-INTERNET'
)
DELETE FROM petition_templates 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Remover templates com ordem maior que 15.6 (15.7, 15.8, etc.)
DELETE FROM petition_templates 
WHERE tema = 'TELEFONIA-TV-INTERNET' 
AND (
  ordem LIKE '15.7%' 
  OR ordem LIKE '15.8%' 
  OR ordem LIKE '15.9%'
  OR ordem::numeric > 15.6
);