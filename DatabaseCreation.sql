create database tripping;


use tripping;


create table users(
user_id int not null auto_increment,
firebase_uid VARCHAR(100) unique,
user_name VARCHAR(64),
user_email VARCHAR(255) unique,
country_origin VARCHAR(64),
timezone_origin VARCHAR(64),
notif boolean,
constraint pk_user_id primary key(user_id)
);

select * from users;

SELECT COUNT(*) FROM Users WHERE user_email='geraldinefoe@gmail.com';

DELETE FROM users WHERE user_email='geraldinefoe@gmail.com';


SELECT COUNT(*) from users WHERE country_origin IS NULL and user_email='geraldinefoe@gmail.com';

SELECT COUNT(*) from users WHERE country_origin IS NULL and user_email='gernusss@gmail.com';

DELETE FROM users WHERE user_email='gernusss@gmail.com';


create table resources(
resourceId VARCHAR(64),
trip_id VARCHAR(64),
activity_id VARCHAR(64),
accommodation_id VARCHAR(64),
flight_id VARCHAR(64),
user_id_pp VARCHAR(100),
original_file_name VARCHAR(100),
media_type VARCHAR(88),
do_src_link VARCHAR(255),
uploaded_on TIMESTAMP DEFAULT current_timestamp,
constraint pk_resourceId primary key(resourceId)
);

select * from resources;





