create table openov_tmp (the_geom geometry, tpc varchar(32), naam varchar(255), type varchar(16));
insert into openov_tmp SELECT st_pointfromtext(((('Point('::text || openov_haltes.lon) || ' '::text) || openov_haltes.lat) || ')'::text, 4326) AS the_geom, openov_haltes.tpc, openov_haltes.naam, openov_haltes.type FROM openov_haltes;
CREATE INDEX idx_openov on openov_tmp USING btree(the_geom);
select a.tpc, b.tpc, ST_Distance_Sphere(a.the_geom, b.the_geom) as distance from openov_tmp as a, openov_tmp as b where a.tpc <> b.tpc and ST_Distance_Sphere(a.the_geom, b.the_geom) < 100 and a.type in ('kv55', 'ns') and b.type in ('kv55', 'ns') order by a.tpc;
