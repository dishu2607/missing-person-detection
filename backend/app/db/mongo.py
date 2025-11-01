from pymongo import MongoClient
import os

# MongoDB URI (change if using Atlas)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = MongoClient(MONGO_URI)
db = client["missing_person_db"]  # Database name
references_collection = db["references"]  # Collection for reference images
