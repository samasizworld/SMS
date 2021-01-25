
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


select stu.guid ,stu.studentemail,stu.firstname,(json_object_agg(coalesce(sub.subjectname,'a'), stusub.marks)::jsonb || json_object_agg('score',stu.result)::jsonb )::json as results from 
    (select studentid,firstname ,guid ,result,studentemail from students where datedeleted is null) as stu
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


-- link student by passing json object array used in database
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

-- link stusub without using loop (best way)
create or replace function linkstudentsubjects(uuid,json) returns table (stusub_operations varchar(50)) as
$$
declare
 s1 int;
 statuss int;
begin
    select studentid from students where guid=$1 and datedeleted is null into s1;
     drop table if exists statustable;
     drop table if exists stusub_operations;
        create temp table statustable("status" int, "marks" float,"subjectid" int,"subjectname" varchar(100));
        create temp table stusub_operations("operations" varchar(50));

        insert into statustable
        select ss.status,ss.marks,subjects.subjectid,subjects.subjectname 
        from 
        (
            select * from json_to_recordset($2) 
            as t("subjectId" uuid ,"status" int,"marks" float)
        )as ss 
        inner join subjects 
        on subjects.datedeleted is null and subjects.guid = ss."subjectId";

    -- upsert on status 1
        insert into studentsubjects(studentid,subjectid,marks) 
        (
         select s1,subjectid,marks 
         from statustable 
         where status=1
        )
        on conflict(studentid,subjectid) do update set marks=excluded.marks,datedeleted=null;
    
     -- delete on status 0
        update studentsubjects 
        set datedeleted =now() 
        from statustable
        where studentid=s1 and studentsubjects.subjectid =statustable.subjectid and status=0;
    
        insert into stusub_operations values('Operation done in studentsubjects');
    
    return query select * from stusub_operations;

end;
$$
language plpgsql;



-- 
select stusub('0fe2a20c-4915-11eb-ba57-7f663eec4970','[{"subjectId": "a25e881c-4938-11eb-98fd-8bd47dd23175","status": "0","marks": 55},{"subjectId": "fac3d750-492e-11eb-98f3-a32c9105e8f4","status": "0","marks": 65}]');



