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
d_iso2 VARCHAR(8),
dest_lat VARCHAR(64),
dest_lng VARCHAR(64),
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


truncate table trips;

select * from trips where master_user_id='WvibmPm1KMT9071ynwo1oA7G7GJ3' ORDER BY last_updated DESC;
delete from trips where trip_id='tripc2b9be0b29ba44679fb08d07';



create table itinerary(
itinerary_id VARCHAR(64),
trip_id VARCHAR(64),
itn_date date,
constraint pk_itinerary_id primary key (itinerary_id),
constraint fk_trip_id FOREIGN KEY (trip_id) REFERENCES trips(trip_id) ON DELETE CASCADE
);

select * from itinerary;
drop table itinerary;
truncate table itinerary;


create table locations(
location_id VARCHAR(64),
location_lat VARCHAR(64),
location_lng VARCHAR(64),
location_address VARCHAR(225),
location_name VARCHAR(225),
google_place_id VARCHAR(100),
g_biz_number VARCHAR(64),
g_biz_website VARCHAR(255),
g_opening_hrs TEXT,
trip_id VARCHAR(64),
itinerary_id VARCHAR(64),
last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
constraint pk_location_id primary key(location_id)
);

drop table locations;

truncate table locations;

select * from locations;

create table activities(
activity_id VARCHAR(64),
trip_id VARCHAR(64),
itinerary_id VARCHAR(64),
event_name VARCHAR(255),
activity_type VARCHAR(56),
start_date date,
end_date date,
start_time time,
end_time time,
timezone_time VARCHAR(64),
event_notes TEXT,
location_id VARCHAR(64),
last_updated_by VARCHAR(100),
last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
constraint pk_activity_id primary key(activity_id),
constraint fk_last_updated_by foreign key(last_updated_by) references users(firebase_uid)
);

drop table activities;

truncate table activities;

select * from activities;


create table accommodations(
accommodation_id VARCHAR(64),
accommodation_name VARCHAR(255),
trip_id VARCHAR(64),
check_in_date date,
check_in_time time,
check_out_date date,
check_out_time time,
timezone_time VARCHAR(100),
event_notes TEXT,
location_id VARCHAR(64),
last_updated_by VARCHAR(100),
last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
constraint pk_accommodation_id primary key(accommodation_id),
constraint fk_last_updated_by_acc foreign key(last_updated_by) references users(firebase_uid)
);

drop table accommodations;

truncate table accommodations;
select * from accommodations;


create table user_roles(
trip_id VARCHAR(64),
user_id VARCHAR(64),
user_display_name VARCHAR(64),
role VARCHAR(36),
share_id VARCHAR(64) null,
share_id_view_only VARCHAR(64) null,
constraint fk_trip_id_roles foreign key(trip_id) references trips(trip_id),
constraint pk_trip_user PRIMARY KEY(trip_id, user_id)
);


drop table user_roles;















