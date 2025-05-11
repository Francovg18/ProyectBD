from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider


cluster = Cluster(['127.0.0.1'])
session = cluster.connect()
session.set_keyspace('elecciones')
