# from sqlalchemy import create_engine # type: ignore
# from sqlalchemy.orm import sessionmaker, declarative_base # type: ignore

# SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost:5432/db_final"

# engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine
# )

# Base = declarative_base()

from pymongo import MongoClient
import json
# Connect to local MongoDB
client = MongoClient("mongodb://localhost:27017/")

# Database & Collection
db = client["db_final"]
collection = db["medicinal_images"]

# Read JSON file
with open("../Data/Output/neem/structured_dataset.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Insert into MongoDB
if isinstance(data, list):
    result = collection.insert_many(data)
    print(f"{len(result.inserted_ids)} documents inserted")
else:
    result = collection.insert_one(data)
    print("1 document inserted")

print("Done")
