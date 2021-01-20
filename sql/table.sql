CREATE DATABASE sms;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- We have made database asper as models
CREATE TABLE students( 
    studentid serial,
    guid UUID DEFAULT uuid_generate_v1(),
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    address VARCHAR(255),
    datecreated TIMESTAMPTZ DEFAULT now(),
    datemodified TIMESTAMPTZ,
    datedeleted TIMESTAMPTZ,
    result varchar(100),
    PRIMARY KEY (studentid)
);
CREATE TABLE subjects(
    subjectid serial,
    guid UUID DEFAULT uuid_generate_v1(),
    subjectname VARCHAR(100),
    subjectcode VARCHAR(50),
    datecreated TIMESTAMPTZ DEFAULT now(),
    datemodified TIMESTAMPTZ,
    datedeleted TIMESTAMPTZ,
    PRIMARY KEY(subjectid)
);

CREATE TABLE studentsubjects(
    studentsubjectid serial ,
    guid UUID DEFAULT uuid_generate_v1(),
    datecreated TIMESTAMPTZ DEFAULT now(),
    datemodified TIMESTAMPTZ,
    datedeleted TIMESTAMPTZ,
    "studentid" INT REFERENCES students (studentid) not null ,
    "subjectid" INT REFERENCES subjects (subjectid) not null ,
    UNIQUE(studentid,subjectid),
    marks FLOAT,
    PRIMARY KEY (studentsubjectid)
);
--  declaration of enum in postgres
CREATE TYPE userrole AS ENUM ('admin', 'user');

CREATE TABLE users(
    userid serial,
    guid UUID DEFAULT uuid_generate_v1(),
    datecreated TIMESTAMP DEFAULT now(),
    datemodified TIMESTAMP,
    datedeleted TIMESTAMP,
    username VARCHAR(25),
    password VARCHAR(100),
    userrole userrole,
    PRIMARY KEY (userid)
);

create table userlogininfos(
    userlogininfoid serial,
    guid UUID DEFAULT uuid_generate_v1(),
    loggedindatetime TIMESTAMPTZ,
    loggedoutdatetime TIMESTAMPTZ,
    datecreated TIMESTAMP DEFAULT now(),
    datemodified TIMESTAMP,
    datedeleted TIMESTAMP,
    username VARCHAR(100),
    userid int REFERENCES users (userid),
    PRIMARY KEY (userlogininfoid)
);

create table loginfos(
    loginfoid serial primary key,
    guid UUID DEFAULT uuid_generate_v1(),
    severity char(1),
    processname varchar(255),
    message varchar(255),
    description varchar(500),
    additionaldetails text,
    datecreated TIMESTAMPTZ DEFAULT now(),
    datemodified TIMESTAMPTZ,
    datedeleted TIMESTAMPTZ,
    userid int REFERENCES users (userid)
);


/*Extra SQL functions*/
-- add some column in existing table
ALTER TABLE studentsubjects
    ADD studentid INT REFERENCES students (studentid);

ALTER TABLE studentsubjects
    ADD subjectid INT REFERENCES subjects (subjectid);

/* Not working with serial*/
ALTER TABLE students 
    ALTER COLUMN studentid TYPE serial;

ALTER TABLE students
    ADD studentemail varchar(100);

-- to drop colums from existing table
ALTER TABLE table_name
    DROP COLUMN column_name;

-- adding marks column in studentsubjects table
ALTER TABLE studentsubjects
    ADD marks FLOAT;-- adding result column in student table

alter table students
    add result varchar(100);
