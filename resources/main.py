import requests
from tkinter import *
from tkinter import messagebox
import subprocess
from urllib.request import urlretrieve






UPDATE_SERVER = "http://lignux.net/scadenziario/updates/{0}"
RELEASE_SERVER = "http://lignux.net/scadenziario/release/"

def aggiornamento():
    urlretrieve("")

    

req = requests.get("https://google.com")
with open("version.txt","r") as version_file:
    local_version = int(version_file.read())
    server_version = int(requests.get(UPDATE_SERVER.format(local_version)).json()["versione_attuale"])
    if server_version > local_version:
        messagebox.showinfo("aggiornamento","per usare il programma devi fare l'aggiornamento")
        
    else:
        subprocess.Popen(["../../../../scadenziario.exe"])
    version_file.close()
