import pickle
import os 

DIR = os.path.dirname(os.path.abspath(__file__)) 

def save(badwords):
    with open(DIR + "./badword", 'wb') as w:
        pickle.dump(badwords, w)

def init():
    save([])


def get():
    with open(DIR + "./badword", 'rb') as r:
        return pickle.load(r)

def remove(word):
    badwords = get()
    try:
        badwords.remove(word)
        save(badwords)
        return True
    except:
        return False

def append(word):
    badwords = get()
    badwords.append(word)
    save(badwords)

def check(line):
    badwords = get()
    for word in badwords:
        if line.find(word) != -1:
            return True
    return False