-- The reference MYSQL_DATABASE.sql defines this primary key as AUTO_INCREMENT.
-- Apply to databases where SHOW COLUMNS FROM user_position LIKE 'user_position_id'
-- reports an empty Extra value. Back up the database before applying in production.
ALTER TABLE user_position
  MODIFY user_position_id BIGINT NOT NULL AUTO_INCREMENT;
