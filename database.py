from pymongo import MongoClient

client = None

REMOTE_URI = "mongodb+srv://TavishiS:Abcd%2A1234@users.wlgnv.mongodb.net/"
LOCAL_URI = "mongodb://localhost:27017/"

# try connecting to the preferred remote database
try:
    # Set a timeout to avoid waiting too long if the remote server is unreachable
    client = MongoClient(REMOTE_URI, serverSelectionTimeoutMS=5000)
    # The ping command is to establish connection as client is lazy initially
    client.admin.command('ping')
    print("✅ Connected successfully to the remote database.")

# try the local database
except:
    print(f"⚠️ Could not connect to remote database")
    print("Attempting to connect to the local database instead...")
    
    try:
        client = MongoClient(LOCAL_URI, serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        print("✅ Connected successfully to the local database.")
    
    # 3. If the local connection also fails, print an error and exit
    except:
        print(f"❌ Failed to connect to both remote and local databases")
        client = None # Ensure client is None
        exit() # Exit the script as no database is available


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


def show_entries():
    return list(collection.find({}, {'_id':0}))

def compute_avg(model_no):
    instance = show_entries()

    emotions={}
    count={}

    for entry in instance:
        if entry.get("model") == model_no:
            for key, val in entry.items():
                if key == "model":
                    continue
                if key in emotions:
                    emotions[key]+=val
                    count[key]+=1
                else:
                    emotions[key]=val
                    count[key]=1

    avg = {emotion : emotions[emotion]/count[emotion] for emotion in emotions}
    
    return avg


if __name__=="__main__":
    # display all entries
    instance = show_entries()
    for entry in instance:
        print(entry)

    print("\nTotal number of entries = ", len(instance), "\n")

    choice = input("Want to see avarage surity of all emotions for a particular model? (y/n) : ")

    if choice in ['Y', 'y']:
        mn=input("Enter model number : ")
        if mn == '1' or mn == '2':
            avg = compute_avg(mn)
            # print(type(avg))
            print("\n*** Average surity for all emotions by model-",mn,"***\n")
            for emo, surity in avg.items():
                print(emo, " : ", surity, " %")
        else:
            print("Invalid model number entered...(model = 1 or 2)")

    elif choice in ['N', 'n']:
        print("Okay...you can check it out next time :)")

    else:
        print("Invalid choice...you acting smart...hmmm?!:)")