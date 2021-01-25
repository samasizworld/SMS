-- dynamic query using execute...using
https://www.postgresql.org/docs/current/plpgsql-statements.html#PLPGSQL-STATEMENTS-EXECUTING-DYN

-- search

create or replace function get_students(text,int,int,text,text) returns 
table(studentguid uuid,studentname text,email varchar(100),subjectName varchar(100),"Marks" float) as 
$$ 
declare
 search alias for $1;
 pagesize alias for $2;
 pageno alias for $3;
 orderby alias for $4;
 orderdir alias for $5;
 offst int;
 stmt text;
begin
offst:= (pageno-1)*pagesize;
if search is null then
    stmt:='select stu.guid,concat(stu.firstname,stu.lastname) as fullname,stu.studentemail,sub.subjectname,stusub.marks
        from 
        (
            select * from students where datedeleted is null
            order by '||orderby||' '||orderdir||' '||'limit '||' '||pagesize||' offset'||' '||offst||'
            ) as stu 
            left join 
        (
            studentsubjects as stusub  inner join subjects as sub
            on sub.subjectid =stusub.subjectid and stusub.datedeleted is null 
        ) 
        on stu.studentid = stusub.studentid;';

    raise notice '%',stmt;
    return query execute stmt;
else
    stmt:='select stu.guid,concat(stu.firstname,stu.lastname) as fullname,stu.studentemail,sub.subjectname,stusub.marks
        from 
        (
            select * from students where datedeleted is null  and firstname ilike ''%'||search||'%'''||
            'order by '||orderby||' '||orderdir||' '||'limit '||' '||pagesize||' offset'||' '||offst||'
            ) as stu 
            left join 
        (
            studentsubjects as stusub  inner join subjects as sub
            on sub.subjectid =stusub.subjectid and stusub.datedeleted is null 
        ) 
    on stu.studentid = stusub.studentid;';

    raise notice '%',stmt;
    return query execute stmt;
end if;
end;
$$
language plpgsql; 



 select stu.guid,concat(stu.firstname,stu.lastname),stu.studentemail,sub.subjectname,stusub.marks
        from
        (
            select * from students where datedeleted is null  and firstname ilike '%p%'
            order by firstname asc limit 1 offset 0
            ) as stu
            left join
        (
            studentsubjects as stusub  inner join subjects as sub
            on sub.subjectid =stusub.subjectid and stusub.datedeleted is null
        )
    on stu.studentid = stusub.studentid;


select stu.guid,concat(stu.firstname,' ',stu.lastname)as fullname,stu.studentemail,sub.subjectname,stusub.marks 
    from 
        (
            select * from students where datedeleted is null 
            order by firstname 
            asc
            limit null 
            offset null
        )   as stu
    left join 
        (
            studentsubjects as stusub  inner join subjects as sub
            on sub.subjectid =stusub.subjectid and stusub.datedeleted is null 
        ) 
    on stu.studentid = stusub.studentid
    where stu.firstname ilike '%aashish%';

-- dynamic query pratice
create or replace function dynamicquery(int,text) returns void as
$$
declare
r1 record;
stmt text;
st text;
begin
    stmt:='select * from students as stu where datedeleted is null and studentid='||$1||';';
    st:='select * from students where datedeleted is null  and firstname'||'ilike ''%'||$2||'%'' ';
    raise notice '%',stmt;
    raise notice '%',st;
end; 
$$
language plpgsql; 

-- do not prevent sql injection
create or replace function get_students(text,int,int,text,text) returns 
table(studentguid uuid,studentname varchar(100),email varchar(100),results varchar(100)) as 
$$ 
declare
 stmt text;
begin
if $1 is null then
    stmt:=
           ' select guid,firstname,studentemail,result from students where datedeleted is null
            order by '||$4||' '||$5||' '||'limit '||' '||$2||' offset'||' '||($3-1)*$2||';';

    raise notice '%',stmt;
    return query execute stmt ;
else
    stmt:=
            'select guid,firstname,studentemail,result from students where datedeleted is null  and 
             firstname ilike ''%'||$1||'%'''||
            'order by '||$4||' '||$5||' '||'limit '||' '||$2||' offset'||' '||($3-1)*$2||';';

    raise notice '%',stmt;
    return query execute stmt;
end if;
end;
$$
language plpgsql; 

--  execute using
create or replace function get_students(text,int,int,text,text) returns 
table(studentguid uuid,studentname varchar(100),email varchar(100),results varchar(100)) as 
$$ 
declare
    search alias for $1;
    pagesize alias for $2;
    pageno alias for $3;
    orderby alias for $4;
    orderdir alias for $5;
    pn int;
    stmt text;
begin
    pn:=(pageno-1)*pagesize;
    raise notice 'pn: %',pn;
    if search is null then
        stmt:=
            'select guid,firstname,studentemail,result from students where datedeleted is null
                order by '||orderby||' '||orderdir||' '||'limit '||' '||pagesize||' offset'||' $1' ;

        raise notice '%',stmt;
        return query execute stmt using pn;
    else
        stmt:=
                'select guid,firstname,studentemail,result from students where datedeleted is null  and 
                firstname ilike ''%'||search||'%'' '||
                'order by '||orderby||' '||orderdir||' '||'limit '||' '||pagesize||' offset '||pn;

        raise notice '%',stmt;
        return query execute stmt; 
    end if;
end;
$$
language plpgsql; 

-- optimized execute using
create or replace function get_students(text,int,int,text,text) returns 
table(studentguid uuid,studentname varchar(100),email varchar(100),results varchar(100)) as 
$$ 
declare
    search alias for $1;
    pagesize alias for $2;
    pageno alias for $3;
    orderby alias for $4;
    orderdir alias for $5;
    pn int;
    stmt text;
begin
    raise notice 'pagesize: % and pageno: %',pagesize,pageno;
    pn:=(pageno-1)*pagesize;
    raise notice 'pn: %',pn;

        if orderby = 'firstname' then
            raise notice 'order by: %',orderby;
            orderby:='firstname';
        else  
            raise notice 'order by: %',orderby;
            orderby:='datecreated';
        end if;

        if orderdir='asc' then
            raise notice 'orderdir: %',orderdir;
            orderdir:='asc';
        else
            raise notice 'orderdir: %',orderdir;
            orderdir:='desc';
        end if;

    if search is null then
    raise notice'Inside if case: orderby : % and order dir: %',orderby,orderdir;
        stmt:=
                'select guid,firstname,studentemail,result from students
                 where datedeleted is null 
                 order by '||orderby||' '||orderdir||' limit '||pagesize||' offset '||pn||';' ;
        raise notice '%',stmt;
        return query execute stmt;
    else
     raise notice'Inside else case: orderby : % and order dir: %',orderby,orderdir;
        search:='%'||search||'%';
        raise notice 'Search : %',search;
        stmt:=
                'select guid,firstname,studentemail,result from students
                 where datedeleted is null 
                 and 
                 firstname ilike $1 '||
                'order by '||orderby||' '||orderdir||' limit '||pagesize||' offset '||pn||';';

        raise notice '%',stmt;
        return query execute stmt using search; 
    end if;
end;
$$
language plpgsql; 