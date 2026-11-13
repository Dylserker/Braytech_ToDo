-- Braytech ToDo - schema MariaDB initial
-- MariaDB 10.6+

CREATE DATABASE IF NOT EXISTS braytech_todo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE braytech_todo;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NULL,
  display_name VARCHAR(120) NOT NULL,
  profile_picture_url VARCHAR(512) NULL,
  app_level INT UNSIGNED NOT NULL DEFAULT 1,
  app_xp INT UNSIGNED NOT NULL DEFAULT 0,
  app_xp_to_next_level INT UNSIGNED NOT NULL DEFAULT 1000,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  last_login_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_level CHECK (app_level >= 1),
  CONSTRAINT chk_users_xp CHECK (app_xp <= app_xp_to_next_level)
) ENGINE=InnoDB;

CREATE TABLE bungie_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  bungie_membership_id VARCHAR(64) NOT NULL,
  bungie_membership_type TINYINT UNSIGNED NOT NULL,
  bungie_display_name VARCHAR(120) NULL,
  access_token_encrypted VARBINARY(2048) NULL,
  refresh_token_encrypted VARBINARY(2048) NULL,
  access_token_expires_at DATETIME(3) NULL,
  connected_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_bungie_membership (bungie_membership_id, bungie_membership_type),
  KEY idx_bungie_accounts_user (user_id),
  CONSTRAINT fk_bungie_accounts_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE activity_definitions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  bungie_activity_hash BIGINT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(80) NOT NULL,
  difficulty VARCHAR(80) NULL,
  variant VARCHAR(120) NULL,
  manifest_version VARCHAR(80) NULL,
  is_verifiable TINYINT(1) NOT NULL DEFAULT 0,
  definition_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_activity_definition_hash (bungie_activity_hash),
  KEY idx_activity_definitions_filters (category, difficulty, is_verifiable)
) ENGINE=InnoDB;

CREATE TABLE tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  activity_definition_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  category VARCHAR(80) NOT NULL,
  mission VARCHAR(255) NOT NULL,
  difficulty VARCHAR(80) NULL,
  variant VARCHAR(120) NULL,
  status ENUM('pending', 'completed_automatically', 'sync_to_check') NOT NULL DEFAULT 'pending',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  ends_at DATETIME(3) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  completed_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  KEY idx_tasks_user_status_date (user_id, status, created_at),
  KEY idx_tasks_user_category (user_id, category),
  CONSTRAINT fk_tasks_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_activity_definition
    FOREIGN KEY (activity_definition_id) REFERENCES activity_definitions (id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE activity_proofs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  task_id BIGINT UNSIGNED NOT NULL,
  bungie_account_id BIGINT UNSIGNED NOT NULL,
  bungie_instance_id VARCHAR(128) NOT NULL,
  bungie_activity_hash BIGINT UNSIGNED NULL,
  character_id VARCHAR(64) NULL,
  activity_name VARCHAR(255) NOT NULL,
  completed_at DATETIME(3) NOT NULL,
  success TINYINT(1) NOT NULL,
  matched_after_task_creation TINYINT(1) NOT NULL,
  proof_json JSON NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_activity_proof_instance (bungie_account_id, bungie_instance_id),
  KEY idx_activity_proofs_task (task_id, completed_at),
  CONSTRAINT fk_activity_proofs_task
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_proofs_bungie_account
    FOREIGN KEY (bungie_account_id) REFERENCES bungie_accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE achievements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(80) NOT NULL,
  title VARCHAR(160) NOT NULL,
  description VARCHAR(500) NOT NULL,
  target_value INT UNSIGNED NOT NULL,
  xp_reward INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_achievements_code (code)
) ENGINE=InnoDB;

CREATE TABLE user_achievements (
  user_id BIGINT UNSIGNED NOT NULL,
  achievement_id BIGINT UNSIGNED NOT NULL,
  progress_value INT UNSIGNED NOT NULL DEFAULT 0,
  unlocked_at DATETIME(3) NULL,
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, achievement_id),
  CONSTRAINT fk_user_achievements_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_user_achievements_achievement
    FOREIGN KEY (achievement_id) REFERENCES achievements (id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE sync_runs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  bungie_account_id BIGINT UNSIGNED NOT NULL,
  status ENUM('started', 'completed', 'failed', 'ambiguous') NOT NULL,
  activities_read INT UNSIGNED NOT NULL DEFAULT 0,
  tasks_completed INT UNSIGNED NOT NULL DEFAULT 0,
  error_message VARCHAR(1000) NULL,
  started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  finished_at DATETIME(3) NULL,
  PRIMARY KEY (id),
  KEY idx_sync_runs_user_date (user_id, started_at),
  CONSTRAINT fk_sync_runs_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_sync_runs_bungie_account
    FOREIGN KEY (bungie_account_id) REFERENCES bungie_accounts (id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO achievements (code, title, description, target_value, xp_reward)
VALUES
  ('first_task', 'Votre première tâche', 'Ajouter une mission au planning', 1, 100),
  ('three_tasks', 'Accomplir 3 missions', 'Valider automatiquement trois activités', 3, 300),
  ('category_master', 'Maître de la diversité', 'Valider des activités de trois catégories différentes', 3, 500),
  ('first_raid', 'Premier raid', 'Valider une activité de raid', 1, 250)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  target_value = VALUES(target_value),
  xp_reward = VALUES(xp_reward);
