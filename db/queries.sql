--Author table
create table Author(
    aid int auto_increment not null,
    author_name varchar(30) default "Anonymous",
    nationality varchar(30),
    pid int,
    DOB DATE NOT NULL,
    Death DATE default NULL,
    primary key(aid),
    foreign key(pid) references Period(pid)
);

--contents
 insert into Author values(1,"Leo Tolstoy","Russian",3,"1828-08-09","1910-09-20");
 insert into Author values(2,"Harper Lee","American",4,"1926-04-28","2016-02-19");
 insert into Author values(3,"F. Scott Fitzgerald","American",3,"1896-10-28","1940-12-21");
 insert into Author values(4,"Gabriel García Márquez","Columbian",4,"1927-03-06","2014-04-17");
 insert into Author values(5,"E. M. Forster","English",4,"1879-01-01","1970-06-07");
 insert into Author values(6,"Ralph Ellison","American",4,"1914-03-01","1994-04-16"); 
 insert into Author values(7,"J. K. Rowling","British",4,"1965-07-31",default);



-- Book Table
create table Book(
    bno int auto_increment not null,
    aid int,
    title varchar(50) not null,
    pages int,
    pid int,
    Year Date,
    primary key(bno),
    foreign key(aid) references author(aid),
    foreign key (pid) references Period(pid)
);
--contents
insert into book(aid,title,pid) values (7,"Harry Potter and the Philosopher's Stone",6);
insert into book(aid,title,pid) values (7,"Harry Potter and the Chambers of Secrets",6);
insert into book(aid,title,pid) values (7,"Harry Potter and the Prisoner of Azkaban",6);
insert into book(aid,title,pid) values  (7,"Harry Potter and the Goblet of Fire",6);
insert into book(aid,title,pid) values  (7,"Harry Potter and the Order of the Phoenix",6);
insert into book(aid,title,pid) values  (7,"Harry Potter and the Half-Blood prince",6);
insert into book(aid,title,pid) values  (7,"Harry Potter and the Deathly Hallows",6);


-- Period Table
create table Period(
    pid int primary key auto_increment,
    era int not NULL unique
);

--conetnts
insert into Period values(1,16);
insert into Period values(2,17);
insert into Period values(3,18);
insert into Period values(4,19);
insert into Period values(5,20);
insert into Period values(6,21);

--Page number Table

create table Pageno(
    Pgid int primary key auto_increment,
    Pgno int,
    bno int,
    foreign key(bno) references Book(bno),
    unique(bno,pgno)
);

-- Words Table
create table Words(
    wid int primary key auto_increment,
    word varchar(50) unique
);

--auxillary table (word instance)
create table Wordinst(
    wiid int primary key auto_increment,
    pgid int not null,
    wid int not null,
    foreign key(pgid) references Pageno(pgid),
    foreign key(wid) references Words(wid)
);

-- word context 
create table Wordctxt(
    wcxtid int,
    leftword varchar(50),
    rightword varchar(50),
    foreign key(wcxtid) references wordinst(wiid)
)

--main search query

create view searchtable as
select * from pageno natural join wordinst natural join words
cross join wordctxt on wiid=wcxtid;

--this statement has to be executed before next procedure
drop table if exists temp;
CREATE TEMPORARY TABLE temp select * from searchtable;

--First procedure 
drop procedure if exists presearch;
DELIMITER $$

create procedure presearch(
    in w varchar(50),
    in rightw varchar(50)
)
begin

    drop table if exists temp;

    create temporary table temp select * from searchtable;

    drop temporary table if exists q;

    create temporary table q select pgid from temp where w=word and rightw=rightword;

    drop temporary table temp;

    create temporary table temp select * from q;

end$$

DELIMITER ;

--second Procedure

drop procedure if exists search;

DELIMITER $$

create procedure search(
    in leftw varchar(50),
    in w varchar(50),
    in rightw varchar(50)
)
begin

    drop temporary table if exists r;

    drop temporary table if exists v;

    create temporary table r select pgid,wcxtid from searchtable where w=word and leftw=leftword 
    and pgid in (select * from temp);

    create temporary table v select pgid from searchtable where w=word and rightw=rightword 
    and (pgid,wcxtid) in (select * from r);

    drop temporary table temp;

    create temporary table temp select * from v;

end$$

DELIMITER ;


-- query for one word
select Pgno,title from ((select pgid from searchtable
    where word="ass") as tt natural join pageno natural join book); 