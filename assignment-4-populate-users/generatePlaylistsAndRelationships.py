from __future__ import unicode_literals
from os.path import abspath, join, dirname
import pymysql
import random

full_path = lambda filename: abspath(join(dirname(__file__), filename))
FILES = {
    'words': full_path('dist.words.random')
}

def get_a_word():
    return get_name(FILES['words']).capitalize()

def get_name(filename):
    selected = random.random() * 90
    with open(filename) as name_file:
        for line in name_file:
            name, _, cumulative, _ = line.split()
            if float(cumulative) > selected:
                return name
    return "Swag-alicious"  # Return swaggy string if file is empty


def generatePlaylists():
    apollo = pymysql.connect(host='puddleglum.murrayweb.ca',
                             port=3306,
                             user='root',
                             passwd='se3309a',
                             db='apollo')
    cursor = apollo.cursor()
    count = 0
    cursor.execute("SELECT userID FROM user")
    userNums = cursor.fetchall()
    while (count < 1000):
        playlistName = get_a_word() + " Playlist"
        randUser = userNums[random.randrange(0, len(userNums) - 1)]
        cursor.execute("INSERT INTO playlist(playlistName, datetimeCreated, createdBy) VALUES (%s, NOW(), %s)", (playlistName, randUser))
        count += 1
        print("Playlist going thru loop " + str(count))
    try:
        apollo.commit()
    except:
        apollo.rollback()
        print("goofed")
    cursor.close()


def generateRelationships():
    apollo = pymysql.connect(host='puddleglum.murrayweb.ca',
                             port=3306,
                             user='root',
                             passwd='se3309a',
                             db='apollo')
    cursor = apollo.cursor()
    count = 0
    cursor.execute("SELECT playlistID FROM playlist")
    playlistNums = cursor.fetchall()
    cursor.execute("SELECT userID FROM user")
    userNums = cursor.fetchall()
    cursor.execute("SELECT musicgroupID FROM musicgroup")
    groupNums = cursor.fetchall()
    set1 = set()
    set2 = set()
    while count < 500:
        randPlaylist = playlistNums[random.randrange(0, len(playlistNums)-1)]
        randUser = userNums[random.randrange(0, len(userNums)-1)]
        randGroup = groupNums[random.randrange(0, len(groupNums)-1)]
        if (randGroup, randUser) in set1:
            print "duplicate group user"
            continue
        if (randGroup, randPlaylist) in set2:
            print "duplicate group playlist"
            continue
        cursor.execute("INSERT INTO musicgroupmembership(musicgroup, user) VALUES (%s, %s)", (randGroup, randUser))
        set1.add((randGroup, randUser))
        cursor.execute("INSERT INTO sharedplaylists(musicgroup, playlist) VALUES (%s, %s)", (randGroup, randPlaylist))
        set2.add((randGroup, randPlaylist))
        count += 1
        print("Relationships going thru loop " + str(count))
    try:
        apollo.commit()
    except:
        print "goofed"
        apollo.rollback()

    cursor.close()

generatePlaylists()
generateRelationships()

# super messy code, super rushed, apologies