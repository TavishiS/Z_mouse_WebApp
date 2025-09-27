from pymongo import MongoClient

client = MongoClient("mongodb+srv://TavishiS:Abcd%2A1234@users.wlgnv.mongodb.net/")

db = client['Users']
collection = db['models']

def insert_entry(model_no, surity):
    if not model_no or not surity or len(surity)<2:
        raise ValueError("Invalid data for MongoDB insertion")
    
    doc = {
        "model" : model_no,
        surity[0]['emotion'] : surity[0]['surity'],
        surity[1]['emotion'] : surity[1]['surity']
    }

    collection.insert_one(doc)
    print("Inserted entry : ", doc)