import json
from pymongo import MongoClient
from gridfs import GridFS

container = 'whatsappLogs'

def getAllCollections():
    client = MongoClient('mongodb://localhost:27017/')
    db = client[container]
    #  return all collections in the database and close connection
    data = db.list_collection_names()
    client.close()
    return data

def getCollectionData(collectionName):
    client = MongoClient('mongodb://localhost:27017/')
    db = client[container]
    collection = db[collectionName]
    #  return all documents in collection and close connection
    data = list(collection.find())
    client.close()
    return data

def getCollectionHeaders(collectionName):
    client = MongoClient('mongodb://localhost:27017/')
    db = client[container]
    collection = db[collectionName]
    #  return all documents in collection and close connection
    data = list(collection.find().limit(1))
    keys = []
    for key in data[0].keys():
        keys.append(key)
    client.close()
    return keys

def getCollectionDataQuery(collectionName, query):
    client = MongoClient('mongodb://localhost:27017/')
    db = client[container]
    collection = db[collectionName]
    #  return all documents in collection and close connection
    data = list(collection.find(json.loads(query)))
    client.close()
    return data

def getGridFSFile(filename):
    client = MongoClient('mongodb://localhost:27017/')
    db = client[container]
    fs = GridFS(db, collection="largeFiles")
    #  returns the json data from the file and closes connection
    file = fs.find_one({'filename': filename})
    if file is None:
        return None
    data = json.loads(file.read())
    client.close()
    return data

def getGridFSFileNames(type):
    client = MongoClient('mongodb://localhost:27017/')
    db = client[container]
    fs = GridFS(db, collection="largeFiles")
    #  returns the json data from the file and closes connection
    files = fs.find()
    data = []
    for file in files:
        if file.metadata['originalfilename'] == type:
            data.append({
                "FileName": file.filename,
                "FileSize": file.length,
            })
    client.close()
    return data

def getGridFSMediaFileNames():
    client = MongoClient('mongodb://localhost:27017/')
    db = client[container]
    fs = GridFS(db, collection="largeFiles")
    #  returns the json data from the file and closes connection
    files = fs.find()
    data = []
    for file in files:
        if file.metadata['originalfilename'] != 'message_logs.json' and file.metadata['originalfilename'] != 'chat_logs.json' and file.metadata['originalfilename'] != 'contact_logs.json':
            data.append({
                "FileName": file.filename,
                "FileSize": file.length,
            })
    client.close()
    return data
