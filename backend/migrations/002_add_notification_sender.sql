ALTER TABLE `notifications`
  ADD COLUMN `sender_user_id` bigint DEFAULT NULL COMMENT 'sender user (FK users)' AFTER `user_id`;

ALTER TABLE `notifications`
  ADD KEY `sender_user_id` (`sender_user_id`);

ALTER TABLE `notifications`
  ADD CONSTRAINT `notification_ibfk_2`
    FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`)
    ON DELETE SET NULL ON UPDATE RESTRICT;
