import sqlite3
import os
import shutil
import tempfile
import sys
import json

def get_pdf(item_key):
    db_path = os.path.expanduser('~/Zotero/zotero.sqlite')
    if not os.path.exists(db_path):
        print(json.dumps({'error': 'No local db'}))
        return
    temp_fd, temp_path = tempfile.mkstemp(suffix='.sqlite')
    os.close(temp_fd)
    try:
        shutil.copy2(db_path, temp_path)
        conn = sqlite3.connect(temp_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # item_key could be the parent item's key or the attachment itself.
        query = """
        SELECT items_att.key || '/' || substr(itemAttachments.path, 9) as pdfPath
        FROM itemAttachments
        JOIN items as items_att ON itemAttachments.itemID = items_att.itemID
        LEFT JOIN items as items_parent ON itemAttachments.parentItemID = items_parent.itemID
        WHERE (items_parent.key = ? OR items_att.key = ?)
        AND itemAttachments.path LIKE 'storage:%.pdf'
        LIMIT 1
        """
        cursor.execute(query, (item_key, item_key))
        row = cursor.fetchone()
        if row and row['pdfPath']:
            print(json.dumps({'success': True, 'pdfPath': row['pdfPath']}))
        else:
            print(json.dumps({'success': False, 'error': 'No PDF attachment found'}))
    except Exception as e:
        print(json.dumps({'error': str(e)}))
    finally:
        os.remove(temp_path)

if __name__ == '__main__':
    get_pdf(sys.argv[1])
