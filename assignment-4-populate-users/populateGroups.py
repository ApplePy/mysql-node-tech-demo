from __future__ import unicode_literals
from os.path import abspath, join, dirname
import pymysql
import random
import string


full_path = lambda filename: abspath(join(dirname(__file__), filename))
FILES = {
    'words': full_path('dist.words.random')
}

def get_full_name():
    return "{0} {1}".format(get_last_name(), get_last_name())

def get_last_name():
    return get_name(FILES['words']).capitalize()

def get_name(filename):
    selected = random.random() * 90
    with open(filename) as name_file:
        for line in name_file:
            name, _, cumulative, _ = line.split()
            if float(cumulative) > selected:
                return name
    return ""  # Return empty string if file is empty

def populate():
    apollo = pymysql.connect(host='puddleglum.murrayweb.ca',
                             port=3306,
                             user = 'root',
                             passwd = 'se3309a',
                             db = 'apollo')
    cursor = apollo.cursor()

    count = 0
    while (count < 30):
        musicgroupName = get_full_name()
        cursor.execute("INSERT INTO musicgroup(musicgroupName) VALUES (%s)", (musicgroupName))
        count += 1
        print("going thru loop " + str(count))

    try:
        apollo.commit()
    except:
        apollo.rollback()
        print("goofed")
    cursor.close()

populate()


