import MySQLdb
import math
import uwsgi
import simplejson
from webob import Request


def getfeature(environ, start_response):
	start_response('200 OK', [('Content-Type', 'application/json'), ('Access-Control-Allow-Origin', '*')])
	request = Request(environ)

	lat = None
	lon = None

	if 'lat' in request.params and 'lon' in request.params:
		try:
			lat = float(request.params["lat"])
			lon = float(request.params["lon"])
		except:
			pass


	if lat is not None and lon is not None:
		db = MySQLdb.connect(host="127.0.0.1", port=9306)
		c = db.cursor()
		if 'query' in request.params:
			query = request.params["query"]
			c.execute("""SELECT tpc, naam, lat_radians, lon_radians, geodist(%s, %s, lat_radians, lon_radians) AS distance, type FROM openov, openov_metaphone WHERE match(%s) ORDER BY distance ASC;""", (math.radians(lat), math.radians(lon), query))

		else:
			c.execute("""SELECT tpc, naam, lat_radians, lon_radians, geodist(%s, %s, lat_radians, lon_radians) AS distance, type FROM openov, openov_metaphone WHERE distance <= 40.0 ORDER BY distance ASC;""", (math.radians(lat), math.radians(lon)))

		rows = c.fetchall()
		c.close()
		results = []
		for row in rows:
			results.append({'tpc': row[0], 'naam': row[1], 'lat': math.degrees(row[2]), 'lon': math.degrees(row[3]), 'distance': row[4], 'type': row[5]})
		db.close()
		yield simplejson.dumps(results)

	elif 'query' in request.params:
		query = request.params["query"]

		db = MySQLdb.connect(host="127.0.0.1", port=9306)
		c = db.cursor()
		c.execute("""SELECT tpc, naam, lat_radians, lon_radians, type FROM openov, openov_metaphone WHERE match(%s);""", (query))
		rows = c.fetchall()
		c.close()
		results = []
		for row in rows:
			results.append({'tpc': row[0], 'naam': row[1], 'lat': math.degrees(row[2]), 'lon': math.degrees(row[3]), 'type': row[4]})


		db.close()
		yield simplejson.dumps(results)

	else:
		yield '[]'

uwsgi.applications = {'':getfeature}
