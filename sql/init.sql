CREATE TABLE openov_haltes (lat DECIMAL(9,6), lon DECIMAL(9,6), tpc VARCHAR(16), naam VARCHAR(255));
CREATE INDEX tpc ON openov_haltes (tpc);
SELECT st_transform(st_pointfromtext(((('Point('::text || openov_haltes.lon) || ' '::text) || openov_haltes.lat) || ')'::text, 4326), 900913) AS the_geom, openov_haltes.tpc, openov_haltes.naam, openov_haltes.type FROM openov_haltes;
