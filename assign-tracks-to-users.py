#! /usr/bin/env python3

import sys
import random
import pymysql.cursors
from pymysql.err import *


def main():

    # Sanity check
        if len(sys.argv) != 5:
            print("Wrong number of arguments specified!")
            return

        # Get commandline arguments
        base_path = sys.argv[1]
        db_url = sys.argv[2]
        db_user = sys.argv[3]
        db_pass = sys.argv[4]

    # Connect to the database
        with pymysql.connect(host=db_url,
                             user=db_user,
                             password=db_pass,
                             db='apollo',
                             charset='utf8',
                             cursorclass=pymysql.cursors.DictCursor) as cursor:

            def shimfunction():
                cursor.execute("SELECT trackID FROM track WHERE trackID NOT IN (SELECT trackID FROM usertracks)")
                unassigned = [x['trackID'] for x in cursor.fetchall()]
                nonlocal track_ids
                track_ids = unassigned
                return bool(len(unassigned))


            # Get all users
            cursor.execute("SELECT userID FROM user")
            user_ids = [x['userID'] for x in cursor.fetchall()]

            # Get all tracks
            cursor.execute("SELECT trackID FROM track")
            track_ids = [x['trackID'] for x in cursor.fetchall()]

            # Randomly assign tracks to users. There will be user-less tracks and track-less users at the end.
            while shimfunction():
                for i in range(0, 1000):
                    while True:
                        try:
                            cursor.execute("INSERT INTO usertracks VALUES(%s, %s)" % (user_ids[random.randint(0, len(user_ids)-1)],
                                                                                      track_ids[random.randint(0, len(track_ids)-1)]))
                            break
                        except IntegrityError as e:
                            print(e, file=sys.stderr)
                            if "Duplicate" not in str(e):
                                print(cursor._last_executed, file=sys.stderr)
                                print("Bad luck, trying again.")
                                continue    # By pure bad luck, randint gave the same combo twice



if __name__ == "__main__":
    main()
