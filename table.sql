CREATE DATABASE sms;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- We have made database asper as models
CREATE TABLE students( 
    studentid serial,
    guid UUID DEFAULT uuid_generate_v1(),
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    address VARCHAR(255),
    datecreated TIMESTAMP DEFAULT now(),
    datemodified TIMESTAMP,
    datedeleted TIMESTAMP,
    PRIMARY KEY (studentid)
);
CREATE TABLE subjects(
    subjectid serial,
    guid UUID DEFAULT uuid_generate_v1(),
    subjectname VARCHAR(100),
    subjectcode VARCHAR(50),
    datecreated TIMESTAMP DEFAULT now(),
    datemodified TIMESTAMP,
    datedeleted TIMESTAMP,
    PRIMARY KEY(subjectid)
);

CREATE TABLE studentsubjects(
    studentsubjectid serial ,
    guid UUID DEFAULT uuid_generate_v1(),
    datecreated TIMESTAMP DEFAULT now(),
    datemodified TIMESTAMP,
    datedeleted TIMESTAMP,
    "studentid" INT REFERENCES students (studentid) ,
    "subjectid" INT REFERENCES subjects (subjectid) ,
    UNIQUE(studentid,subjectid),
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
    ADD marks FLOAT;

-- cursor for many to many relation
create or replace function printstudentbyuuid(var1 uuid) returns int as
$body$
declare
    c1 cursor for select * from students where datedeleted is null;
    c2 cursor for select * from studentsubjects where datedeleted is null;
    c3 cursor for select * from subjects where datedeleted is null;
    r1 students%rowtype;
    r2 studentsubjects%rowtype;
    r3 subjects%rowtype;
    cnt int:=0;
begin
    open c1;
        loop
        fetch c1 into r1;
        exit when not found;
        if r1.guid= var1 then
            open c2;
            loop
            fetch c2 into r2;
            exit when not found;
            if r1.studentid = r2.studentid then
                open c3;
                loop
                fetch c3 into r3;
                exit when not found;
                if r2.subjectid =r3.subjectid then
                 raise notice '% % %',r1.firstname,r3.subjectname,r2.marks;
                 cnt:=cnt+1;
                end if;
                end loop;
                close c3;
            end if;
            end loop;
            close c2;
        end if;
        end loop;
    close c1;
    return cnt;
end;
$body$
language plpgsql;

-- for M:M using join with results as json store
create or replace function getstudentbyuuid(uuid) returns table(
    "studentId" uuid,"firstName" varchar(50), "results" json
) as
$$
declare
    r json;
    sid uuid;
    "first_name" varchar(50);
begin
    select stu.guid ,stu.firstname,(json_object_agg(coalesce(sub.subjectname,'a'), stusub.marks)::jsonb || json_object_agg('score',stu.result)::jsonb )::json from 
    (select studentid,firstname ,guid ,result from students where datedeleted is null and guid = $1 ) as stu
    left join (studentsubjects as stusub  inner join subjects as sub on sub.subjectid =stusub.subjectid and stusub.datedeleted is null ) 
    on stu.studentid = stusub.studentid
    GROUP BY stu.guid,stu.firstname into sid,"first_name",r;
    drop table if exists savestudentdata;
        create temp table savestudentdata("studentId" uuid,"fn" varchar(50),"resultss" json);

    if  '{"a":null,"score":null}'::jsonb @> r::jsonb then
        r:='{}'::json;
        insert into savestudentdata("studentId","fn","resultss") values(sid,"first_name",r);
        return query select * from savestudentdata;
    else
        insert into savestudentdata("studentId","fn","resultss") values(sid,"first_name",r);
        return query select * from savestudentdata;
    end if;

end;
$$ 
language plpgsql; 

-- returning query directly 
create or replace function getstudentbyuuid(uuid) returns table(
    "studentId" uuid,"firstName" varchar(50),"email" varchar(50), "results" json
) as
$$
declare
    r json;
    sid uuid;
    "first_name" varchar(50);
begin
    return query select stu.guid ,stu.firstname,stu.studentemail,(json_object_agg(coalesce(sub.subjectname,'a'), stusub.marks)::jsonb || json_object_agg('score',stu.result)::jsonb )::json from 
    (select studentid,firstname ,guid ,result,studentemail from students where datedeleted is null and guid = $1 ) as stu
    left join (studentsubjects as stusub  inner join subjects as sub on sub.subjectid =stusub.subjectid and stusub.datedeleted is null ) 
    on stu.studentid = stusub.studentid
    GROUP BY stu.guid,stu.firstname,stu.studentemail;

end;
$$ 
language plpgsql; 


select stu.guid ,stu.studentemail,stu.firstname,(json_object_agg(coalesce(sub.subjectname,'a'), stusub.marks)::jsonb || json_object_agg('score',stu.result)::jsonb )::json from 
    (select studentid,firstname ,guid ,result,studentemail from students where datedeleted is null and guid = '0cd95bee-55b0-11eb-88ab-d38d5071f639' ) as stu
    left join (studentsubjects as stusub  inner join subjects as sub on sub.subjectid =stusub.subjectid and stusub.datedeleted is null ) 
    on stu.studentid = stusub.studentid
    GROUP BY stu.guid,stu.firstname,stu.studentemail;
-- get student result
create or replace function getstudentresult(uuid) returns json as
$$
declare
    "studentId" uuid;
    first_name varchar(100);
    "Result" json;
begin
    select stu.guid ,stu.firstname,(json_object_agg(coalesce(sub.subjectname,'a'), stusub.marks)::jsonb || json_object_agg('score',stu.result)::jsonb )::json from 
    (select studentid,firstname ,guid ,result from students where datedeleted is null and guid = $1 ) as stu
    left join (studentsubjects as stusub  inner join subjects as sub on sub.subjectid =stusub.subjectid and stusub.datedeleted is null ) 
    on stu.studentid = stusub.studentid
    GROUP BY stu.guid,stu.firstname into "studentId",first_name,"Result";
    raise notice '%',"Result"->'a';
    if  '{"a":null,"score":null}'::jsonb @> "Result"::jsonb then
    return '{}'::json;
    else
        return "Result";
    end if;
end;
$$ 
language plpgsql; 

-- 
create or replace function ps(uuid) returns json as 
$$
declare
    r1 students%rowtype;
    r2 studentsubjects%rowtype;
    r3 subjects%rowtype;
    result json;
begin
    drop table if exists savestudentdata;
        create temp table savestudentdata("id" serial primary key ,"studentId" uuid,"firstName" varchar(100),"Results" varchar(100),"subjectName" varchar(100),"Marks" float);
    for r1 in select * from students where datedeleted is null and guid= $1 loop
    for r2 in select * from studentsubjects where datedeleted is null loop
    if r1.studentid=r2.studentid then
    for r3 in select * from subjects where datedeleted is null loop
    if r2.subjectid =r3.subjectid then
        raise notice'.........';
        raise notice 'firstname: %, subjectname: % ,marks : %',r1.firstname,r3.subjectname,r2.marks;
        raise notice '%',json_object_agg(r3.subjectname,r2.marks);
        insert into savestudentdata("studentId","firstName","Results","subjectName","Marks") values(r1.guid,r1.firstname,r1.result,r3.subjectname,r2.marks);
    end if;
    end loop;
    end if;
    end loop;
    end loop;
    select (json_object_agg("subjectName","Marks")::jsonb ||json_object_agg('result',"Results")::jsonb)::json  from savestudentdata group by "firstName","studentId" into result;
    return result;
end;
$$
language plpgsql;


-- extract studentid from uuid 
create or replace  function extractstudentidfromguid(uuid) RETURNS INT AS 
$$
  DECLARE
    student_guid alias FOR $1;
    row_data students%ROWTYPE;
    result int;
  
  BEGIN
    FOR row_data IN SELECT * FROM students
    WHERE guid = student_guid and datedeleted is null LOOP
      result := row_data.studentid;
    END LOOP;
    RETURN result;
  END;
$$ 
LANGUAGE plpgsql;

-- link student
create or replace function stusub(uuid,uuid,varchar(1),float) returns text as
$$
declare
statuss alias for $3;
marks alias for $4;
student_id int;
subject_id int;
r1 studentsubjects%rowtype;
r2 studentsubjects%rowtype;
result text;

begin
    select into student_id studentid from students where guid=$1 and datedeleted is null;
    select into subject_id subjectid from subjects where guid=$2 and datedeleted is null;
    select into r1 * from studentsubjects where studentid=student_id and subjectid=subject_id and datedeleted is null;
    select into r2 * from studentsubjects where studentid=student_id and subjectid=subject_id;
    raise notice '............';
    raise notice '%',r1.datedeleted;
    raise notice '............';
    raise notice '%',r2.datedeleted;
    raise notice '............';
    raise notice 'R1: %',r1;
    raise notice '............';
    raise notice 'R2: %',r2;
    if statuss ='1' and r1 is null then
        raise notice 'Create Link';
        if r2.datedeleted is null then
            raise notice 'Inserting into new rows';
            insert into studentsubjects(studentid,subjectid,marks) values(student_id,subject_id,marks);
            result:='Link created';
        else
            raise notice 'Updating existing row';
            update studentsubjects set datedeleted =null where studentid=student_id and subjectid=subject_id;
            result:='Link Created';
        end if;
    elsif statuss ='1'  then
        raise notice 'Create Link';
        result:='Link Already Created';
    elsif statuss='0' and r1 is null then
        raise notice 'Link deleted';
        result:='Link already deleted';
    elsif statuss ='0' then
        raise notice 'Delete link';
        update studentsubjects set datedeleted = now() where studentid=student_id and subjectid=subject_id and datedeleted is null;
        result:='Link deleted';
    end if;
    return result;
end;
$$
language plpgsql;
 
-- 
select stusub('0fe2a20c-4915-11eb-ba57-7f663eec4970','6574cf1a-4915-11eb-ba5c-136b12acb956','1',95);
-- 
-- create or replace function objarr() returns json as
-- $$
-- declare
-- joa json:='[{"status":"1","marks":77},{"status":"1","marks":88}]';
-- i json;
-- result json;
-- begin
--     for i in select * from json_array_elements(joa) loop
--     =RAISE NOTICE 'output from space %', i->'status';
--     result:i;
--     raise notice 'output % ',i;
--     end loop;
--     return result;
-- end;
-- $$
-- language plpgsql; 


-- link student by passing json object array
create or replace function stusub(uuid,json) returns table("subjectID" uuid,"operation_in_stusub" text) as
$$
declare
jsonobjectarray alias for $2;
each_json_object json;
student_id int;
subject_id int;
r1 studentsubjects%rowtype;
r2 studentsubjects%rowtype;
begin
    drop table if exists stusub_operations;
    create temp table stusub_operations("subjectId" uuid,operations text);
    for each_json_object in select * from json_array_elements(jsonobjectarray) loop
    raise notice 'output % ',each_json_object;
     raise notice '............';
    --  ->> returns text 
     raise notice '% ,%',each_json_object->>'status',each_json_object->>'subjectId';
    select into student_id studentid from students where guid= $1 and datedeleted is null;
    select into subject_id subjectid from subjects where guid= cast(each_json_object->>'subjectId' as uuid) and datedeleted is null;
    select into r1 * from studentsubjects where studentid=student_id and subjectid=subject_id and datedeleted is null;
    select into r2 * from studentsubjects where studentid=student_id and subjectid=subject_id;
    raise notice '............';
    raise notice '%',r1.datedeleted;
    raise notice '............';
    raise notice '%',r2.datedeleted;
    raise notice '............';
    raise notice 'R1: %',r1;
    raise notice '............';
    raise notice 'R2: %',r2;
    if cast(each_json_object->>'status' as varchar) ='1' and r1 is null then
        raise notice 'Create Link';
        if r2.datedeleted is null then
            raise notice 'Inserting into new rows';
            insert into studentsubjects(studentid,subjectid,marks) values(student_id,subject_id,cast(each_json_object->>'marks' as float));
            insert into stusub_operations("subjectId",operations) values(cast(each_json_object->>'subjectId' as uuid),'Link Created by adding into new rows');
            
        else
            raise notice 'Updating existing row';
            update studentsubjects set datedeleted =null,marks=cast(each_json_object->>'marks' as float) where studentid=student_id and subjectid=subject_id;
            insert into stusub_operations("subjectId",operations) values(cast(each_json_object->>'subjectId' as uuid),'Link Created by Updating');
        end if;
    elsif cast(each_json_object->>'status' as varchar) ='1'  then
        raise notice 'Create Link';
        update studentsubjects set marks=cast(each_json_object->>'marks' as float) where studentid=student_id and subjectid=subject_id and datedeleted is null;
        insert into stusub_operations("subjectId",operations) values(cast(each_json_object->>'subjectId' as uuid),'Link already created but updating marks');
    elsif cast(each_json_object->>'status' as varchar) ='0' and r1 is null then
        raise notice 'Link deleted';
        insert into stusub_operations("subjectId",operations) values(cast(each_json_object->>'subjectId' as uuid),'Link already deleted');
    elsif cast(each_json_object->>'status' as varchar) ='0' then
        raise notice 'Delete link';
        update studentsubjects set datedeleted = now() where studentid=student_id and subjectid=subject_id and datedeleted is null;
        insert into stusub_operations("subjectId",operations) values(cast(each_json_object->>'subjectId' as uuid),'Link deleted');
    end if;
    end loop;
    return query select * from stusub_operations;
end;
$$
language plpgsql;

-- 
select stusub('0fe2a20c-4915-11eb-ba57-7f663eec4970','[{"subjectId": "a25e881c-4938-11eb-98fd-8bd47dd23175","status": "0","marks": 55},{"subjectId": "fac3d750-492e-11eb-98f3-a32c9105e8f4","status": "0","marks": 65}]');

-- TRIGGER RELATED Things
-- students related trigger
create trigger triggerdeletestudentrelated_data
before update on students
for each row execute procedure deletestudents();

create or replace function deletestudents() returns trigger as
$$
begin
    update studentsubjects set datedeleted = now() where studentid = new.studentid and datedeleted is null;
    return new;
end;
$$
language plpgsql;

-- subject related trigger
create trigger triggerdeletesubjectrelated_data
before update on subjects
for each row execute procedure deletesubjects();

create or replace function deletesubjects() returns trigger as
$$
begin
    update studentsubjects set datedeleted = now() where subjectid = new.subjectid and datedeleted is null;
    return new;
end;
$$
language plpgsql;



-- doing delete and update trigger from same trigger and function on students
create trigger studentrelatedtrigger
before update or delete on students
for each row
when(pg_trigger_depth()=0)
execute procedure students();

create or replace function students() returns trigger as 
$$
begin
    if TG_OP ='UPDATE' then
        update studentsubjects set datedeleted = now() where studentid = new.studentid and datedeleted is null;
        return new;
    elsif TG_OP ='DELETE' then
        delete from studentsubjects where studentid=old.studentid;
        return old;
    end if;
    return null;
end;
$$
language plpgsql;

-- doing delete and update trigger from same trigger and function on subjects
create trigger subjectrelatedtrigger
before update or delete on subjects
for each row
when(pg_trigger_depth()=0)
execute procedure subjects();

create or replace function subjects() returns trigger as 
$$
begin
    if TG_OP ='UPDATE' then
        update studentsubjects set datedeleted = now() where subjectid = new.subjectid and datedeleted is null;
        return new;
    elsif TG_OP ='DELETE' then
        delete from studentsubjects where subjectid=old.subjectid;
        return old;
    end if;
    return null;
end;
$$
language plpgsql;


-- adding result column in student table
alter table students
    add result varchar(100);

-- trigger on studentsubjects
create trigger triggeronstusub
after insert or update or delete on studentsubjects
for each row
when(pg_trigger_depth()=0)
execute procedure trigger_result();

-- function for trigger
create or replace function trigger_result() returns trigger as
$$
declare 
    total_linked_subjects int;
    total_marks float;
    percent float;
    score varchar(100);
begin
    if TG_OP ='INSERT' then
        select count(*) from studentsubjects where studentid=new.studentid  and datedeleted is null into total_linked_subjects;
        select sum(marks) from studentsubjects where studentid=new.studentid and datedeleted is null into total_marks;
        percent:=(total_marks/total_linked_subjects); 
        if percent>=80 then
            score:='Distinction';
        elsif percent between 60 and 80 then
            score:='First Division';
        elsif percent between 50 and 60 then
            score:='Second Division';
        elsif percent between 40 and 50 then
            score:='Third Division';
        else
            score:='Fail';
        end if;
        update students set result=score where studentid=new.studentid and datedeleted is null;
        return new;
    elsif TG_OP ='UPDATE' then
        select count(*) from studentsubjects where studentid=new.studentid   and datedeleted is null into total_linked_subjects;
        select sum(marks) from studentsubjects where studentid=new.studentid and datedeleted is null into total_marks;
        percent:=(total_marks/total_linked_subjects);
        if percent>=80 then
            score:='Distinction';
        elsif percent between 60 and 80 then
            score:='First Division';
        elsif percent between 50 and 60 then
            score:='Second Division';
        elsif percent between 40 and 50  then
            score:='Third Division';
        else
            score:='Fail';
        end if;
        update students set result=score where studentid=new.studentid and datedeleted is null;
        return new;
    elsif TG_OP='DELETE' then
        select count(*) from studentsubjects where studentid=old.studentid   and datedeleted is null into total_linked_subjects;
        select sum(marks) from studentsubjects where studentid=old.studentid and datedeleted is null into total_marks;
        percent:=(total_marks/total_linked_subjects);
        if percent>=80 then
            score:='Distinction';
        elsif percent between 60 and 80 then
            score:='First Division';
        elsif percent between 50 and 60 then
            score:='Second Division';
        elsif percent between 40 and 50  then
            score:='Third Division';
        else
            score:='Fail';
        end if;
        update students set result=score where studentid=old.studentid and datedeleted is null;
        return old;  
    end if;
    return null;
 end;
$$
language plpgsql;
