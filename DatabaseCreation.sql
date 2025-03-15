create database tripping;


use tripping;


create table users(
user_id int not null auto_increment,
firebase_uid VARCHAR(100) unique,
user_name VARCHAR(64),
user_email VARCHAR(255) unique,
country_origin VARCHAR(64),
timezone_origin VARCHAR(64),
currency_origin VARCHAR(8),
notif boolean,
constraint pk_user_id primary key(user_id)
);

select * from users;
drop table users;
SELECT COUNT(*) FROM Users WHERE user_email='geraldinefoe@gmail.com';

DELETE FROM users WHERE user_email='geraldinefoe@gmail.com';


SELECT COUNT(*) from users WHERE country_origin IS NULL and user_email='geraldinefoe@gmail.com';

SELECT COUNT(*) from users WHERE country_origin IS NULL and user_email='gernusss@gmail.com';

DELETE FROM users WHERE user_email='gernusss@gmail.com';


create table resources(
resource_id VARCHAR(100),
trip_id VARCHAR(100),
activity_id VARCHAR(100),
accommodation_id VARCHAR(100),
flight_id VARCHAR(100),
user_id_pp VARCHAR(100),
original_file_name VARCHAR(100),
media_type VARCHAR(88),
do_src_link VARCHAR(255),
uploaded_on TIMESTAMP DEFAULT current_timestamp,
constraint pk_resourceId primary key(resource_id)
);

drop table resources;
select * from resources;
truncate table resources;

create table trips(
trip_id VARCHAR(100),
trip_name VARCHAR(100),
start_date Date,
end_date Date,
destination_city TEXT,
destination_curr VARCHAR(10),
destination_timezone VARCHAR(64),
d_timezone_name VARCHAR(64),
description_t VARCHAR(255),
cover_image_id VARCHAR(100),
attendees TEXT,
master_user_id VARCHAR(100),
last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
constraint pk_trip_id primary key(trip_id),
constraint fk_master_user_id foreign key(master_user_id) references users(firebase_uid)
);


drop table trips;
select * from trips;



