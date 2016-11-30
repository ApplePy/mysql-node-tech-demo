import pymysql
import random

def generateGroupGenreRelationships():
    apollo = pymysql.connect(host='puddleglum.murrayweb.ca',
                             port=3306,
                             user='root',
                             passwd='se3309a',
                             db='apollo')
    cursor = apollo.cursor()
    count = 0
    cursor.execute("SELECT genreID FROM genre")
    genreNums = cursor.fetchall()
    cursor.execute("SELECT musicgroupID FROM musicgroup")
    groupNums = cursor.fetchall()
    setRelation = set()

    while count < len(groupNums):
        randGenre = genreNums[random.randrange(0, len(genreNums)-1)]
        group = groupNums[count]
        if (group, randGenre) in setRelation:
            print "duplicate pair"
            continue
        cursor.execute("INSERT INTO musicgroupgenre(musicgroup, genre) VALUES (%s, %s)", (group, randGenre))
        setRelation.add((group, randGenre))
        count += 1
        print("Relationships going thru loop " + str(count))
    try:
        apollo.commit()
    except:
        print "goofed"
        apollo.rollback()

    cursor.close()

generateGroupGenreRelationships()

# i wish i had time to comment this out but i don't