import sqlite3
import os
import shutil
import tempfile
db_path = os.path.expanduser('~/Zotero/zotero.sqlite')
temp_fd, temp_path = tempfile.mkstemp(suffix='.sqlite')
os.close(temp_fd)
shutil.copy2(db_path, temp_path)
conn = sqlite3.connect(temp_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT itemTypeID FROM items WHERE itemID = 4389")
print(dict(cursor.fetchone()))
os.remove(temp_path)
