UPDATE `system_sidebar_menus`
SET `title` = 'ผลการเรียน',
    `section_title` = 'นักศึกษา'
WHERE `url` = 'transcript';

UPDATE `system_sidebar_menus`
SET `title` = 'Portfolio',
    `section_title` = 'นักศึกษา'
WHERE `url` = 'portfolio';

UPDATE `system_sidebar_menus`
SET `title` = 'การแจ้งเตือน',
    `section_title` = 'ระบบทั่วไป'
WHERE `url` = 'notifications';

UPDATE `system_sidebar_menus`
SET `title` = 'ข้อมูลส่วนตัว',
    `section_title` = 'ระบบทั่วไป'
WHERE `url` = 'profile';

UPDATE `system_sidebar_menus`
SET `title` = 'การตั้งค่า',
    `section_title` = 'ระบบทั่วไป'
WHERE `url` = 'settings';
