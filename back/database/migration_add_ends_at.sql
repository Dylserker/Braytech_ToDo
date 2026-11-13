USE braytech_todo;

-- Ajout de la colonne ends_at pour stocker la date et l'heure de fin
ALTER TABLE tasks
ADD COLUMN ends_at DATETIME(3) NULL AFTER created_at;

-- Optionnel : initialise les tâches existantes avec une durée par défaut d'1 heure
UPDATE tasks
SET ends_at = DATE_ADD(created_at, INTERVAL 1 HOUR)
WHERE ends_at IS NULL;

