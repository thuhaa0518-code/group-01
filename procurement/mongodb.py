import os
import json
from pymongo import MongoClient
from django.conf import settings

_mongo_client = None
TMP_CACHE_FILE = '/tmp/procureai_state.json' if os.name != 'nt' else os.path.join(os.environ.get('TEMP', '.'), 'procureai_state.json')

def get_mongo_client():
    global _mongo_client
    uri = getattr(settings, 'MONGODB_URI', os.getenv('MONGODB_URI', ''))
    if not uri or 'cluster0.mongodb.net' in uri:
        return None
    if _mongo_client is None:
        try:
            _mongo_client = MongoClient(uri, serverSelectionTimeoutMS=2000, connectTimeoutMS=2000)
            # Ping to verify connection
            _mongo_client.admin.command('ping')
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            _mongo_client = None
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

def save_state_to_cache(state_data):
    # 1. Try MongoDB first
    success = save_state_to_mongo(state_data)
    # 2. Always update local /tmp file cache
    try:
        with open(TMP_CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(state_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to write to tmp file cache: {e}")
    return success

def load_state_from_cache():
    # 1. Try MongoDB first
    mongo_state = load_state_from_mongo()
    if mongo_state:
        return mongo_state
    # 2. Fallback to /tmp file cache
    if os.path.exists(TMP_CACHE_FILE):
        try:
            with open(TMP_CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Failed to load from tmp file cache: {e}")
    return None
