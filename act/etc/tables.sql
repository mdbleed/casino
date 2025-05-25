CREATE TABLE rooms (
	id integer primary key autoincrement,
	name text not null,
	mode text not null,
	at integer not null
);
CREATE TABLE players (
	id integer primary key autoincrement,
	name text not null,
	hash text not null,
	room integer not null,
	at integer not null
);
