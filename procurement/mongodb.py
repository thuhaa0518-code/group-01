import os
from pymongo import MongoClient
from django.conf import settings

_mongo_client = None

def get_mongo_client():
    global _mongo_client
    uri = getattr(settings, 'MONGODB_URI', os.getenv('MONGODB_URI', ''))
    if not uri:
        return None
    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Quick ping to verify connection
            _mongo_client.admin.command('ping')
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            return None
    return _mongo_client

def get_mongo_db():
    client = get_mongo_client()
    if client is None:
        return None
    db_name = getattr(settings, 'MONGODB_DB_NAME', os.getenv('MONGODB_DB_NAME', 'procureai'))
    return client[db_name]

def save_state_to_mongo(state_data):
    """Saves complete procurement state dictionary into MongoDB 'procure_state' collection."""
    db = get_mongo_db()
    if db is None:
        return False
    try:
        collection = db['procure_state']
        # Upsert document with fixed _id 'current_state'
        collection.replace_one({'_id': 'current_state'}, {'_id': 'current_state', **state_data}, upsert=True)
        print("Successfully saved state to MongoDB!")
        return True
    except Exception as e:
        print(f"Failed to save state to MongoDB: {e}")
        return False

def load_state_from_mongo():
    """Loads procurement state dictionary from MongoDB 'procure_state' collection."""
    db = get_mongo_db()
    if db is None:
        return None
    try:
        collection = db['procure_state']
        doc = collection.find_one({'_id': 'current_state'})
        if doc:
            doc.pop('_id', None)
            return doc
    except Exception as e:
        print(f"Failed to load state from MongoDB: {e}")
    return None
