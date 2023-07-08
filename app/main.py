import json
from bs4 import BeautifulSoup
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from selenium import webdriver
animeList = []
dr = webdriver.Chrome()
dr.get("https://www.wcoanimesub.tv/subbed-anime-list")
soup = BeautifulSoup(dr.page_source,"html.parser")

animes = soup.find_all("li")
for i in animes:
    #if not nonetype
    try:
        titleArray = str(i).split("title=\"")
        anime = titleArray[1][0:titleArray[1].find("\">")]
        animeList.append(anime)
        
    except:
        pass

        # anime = anime.substring(1,anime.find("<"))

json_data = json.dumps(animeList)

cred = credentials.Certificate("wcomobileviewer-firebase-adminsdk-p9vkh-71daafb596.json")
firebase_admin.initialize_app(cred)

# Create a Firestore client
db = firestore.client()

doc_ref = db.collection('animes').document('animes')

doc_ref.set({"animes": firestore.ArrayUnion(animeList)})
doc_ref = db.collection('animes').document("animes")
exisitingList = doc_ref.get()
exisitingList.to_dict()
for i in exisitingList.to_dict():
    if i in animeList:
        animeList.remove(i)
for i in animeList:
    doc_ref.update({:0})