import sqlite3
import shutil
import tempfile
import sys
import json
import os

def query_zotero(db_path=None, action='get_items', collection_id=None):
    if not db_path or db_path == 'default':
        db_path = os.path.expanduser('~/Zotero/zotero.sqlite')
    
    if not os.path.exists(db_path):
        print(json.dumps({'error': f'Zotero database not found at {db_path}'}))
        return

    # Create a temporary copy to avoid database lock issues
    temp_fd, temp_path = tempfile.mkstemp(suffix='.sqlite')
    os.close(temp_fd)
    
    try:
        shutil.copy2(db_path, temp_path)
        
        conn = sqlite3.connect(temp_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        if action == 'get_collections':
            # Query all collections
            query = """
            SELECT collectionID, key, collectionName, parentCollectionID 
            FROM collections
            ORDER BY collectionName ASC
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                results.append({
                    'id': row['collectionID'],
                    'key': row['key'],
                    'name': row['collectionName'],
                    'parent_id': row['parentCollectionID']
                })
                
            print(json.dumps({'success': True, 'data': results, 'type': 'collections'}))
            
        elif action == 'get_collection_items' and collection_id:
            # Query items for a specific collection
            query = """
            SELECT items.itemID, items.key, itemDataValues.value as title, items.dateAdded,
                   (SELECT items_att.key || '/' || substr(itemAttachments.path, 9) 
                    FROM itemAttachments 
                    JOIN items as items_att ON itemAttachments.itemID = items_att.itemID 
                    WHERE itemAttachments.parentItemID = items.itemID 
                    AND itemAttachments.path LIKE 'storage:%.pdf' 
                    LIMIT 1) as pdfPath
            FROM items
            JOIN collectionItems ON items.itemID = collectionItems.itemID
            JOIN itemData ON items.itemID = itemData.itemID
            JOIN fields ON itemData.fieldID = fields.fieldID
            JOIN itemDataValues ON itemData.valueID = itemDataValues.valueID
            WHERE fields.fieldName = 'title' AND collectionItems.collectionID = ?
            ORDER BY items.dateAdded DESC
            LIMIT 50
            """
            cursor.execute(query, (collection_id,))
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                results.append({
                    'id': row['itemID'],
                    'key': row['key'],
                    'title': row['title'],
                    'dateAdded': row['dateAdded'],
                    'pdfPath': row['pdfPath']
                })
                
            print(json.dumps({'success': True, 'data': results, 'type': 'items'}))
            
        else:
            # Default action: get_items (recent)
            query = """
            SELECT items.itemID, items.key, itemDataValues.value as title, items.dateAdded,
                   (SELECT items_att.key || '/' || substr(itemAttachments.path, 9) 
                    FROM itemAttachments 
                    JOIN items as items_att ON itemAttachments.itemID = items_att.itemID 
                    WHERE itemAttachments.parentItemID = items.itemID 
                    AND itemAttachments.path LIKE 'storage:%.pdf' 
                    LIMIT 1) as pdfPath
            FROM items
            JOIN itemData ON items.itemID = itemData.itemID
            JOIN fields ON itemData.fieldID = fields.fieldID
            JOIN itemDataValues ON itemData.valueID = itemDataValues.valueID
            WHERE fields.fieldName = 'title'
            ORDER BY items.dateAdded DESC
            LIMIT 50
            """
            cursor.execute(query)
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                results.append({
                    'id': row['itemID'],
                    'key': row['key'],
                    'title': row['title'],
                    'dateAdded': row['dateAdded'],
                    'pdfPath': row['pdfPath']
                })
                
            print(json.dumps({'success': True, 'data': results, 'type': 'items'}))
        
    except Exception as e:
        print(json.dumps({'error': str(e)}))
    finally:
        # Always clean up the temporary file immediately
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    db_path = sys.argv[1] if len(sys.argv) > 1 else 'default'
    action = sys.argv[2] if len(sys.argv) > 2 else 'get_items'
    collection_id = sys.argv[3] if len(sys.argv) > 3 else None
    
    query_zotero(db_path, action, collection_id)
