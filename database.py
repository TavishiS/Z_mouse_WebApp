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