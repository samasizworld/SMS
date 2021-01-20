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
    -- if there is value in datedeleted do  update
        if new.datedeleted is not null then 
        update studentsubjects set datedeleted = now() where studentid = new.studentid and datedeleted is null;
        return new;
        end if;
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
        if new.datedeleted is not null then
        update studentsubjects set datedeleted = now() where subjectid = new.subjectid and datedeleted is null;
        return new;
        end if;
        return new;
    elsif TG_OP ='DELETE' then
        delete from studentsubjects where subjectid=old.subjectid;
        return old;
    end if;
    return null;
end;
$$
language plpgsql;




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
        elsif percent >= 60 and percent<80 then
            score:='First Division';
        elsif percent >= 50 and percent<60 then
            score:='Second Division';
        elsif percent >= 40 and percent<50 then
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
        elsif percent >= 60 and percent<80 then
            score:='First Division';
        elsif percent >= 50 and percent<60 then
            score:='Second Division';
        elsif percent >= 40 and percent<50 then
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

