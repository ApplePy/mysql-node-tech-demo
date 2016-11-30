#! /usr/bin/env python3

import sys
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
            # Get all tracks (The count/group-by eliminates multiple locations as a side effect)
            cursor.execute("SELECT trackID, trackName, albumName, artistName, COUNT(trackID) AS locations"
                           " FROM track"
                           " JOIN albumordering ON track.trackID = albumordering.track"
                           " JOIN album ON albumordering.album = album.albumID"
                           " JOIN artist ON album.artist = artist.artistID"
                           " GROUP BY trackID")
            tracks = cursor.fetchall()

            # Create entry
            for track in tracks:
                # Create paths (truncate to fit)
                path_name = "/".join([base_path,
                                     track["artistName"][:70],
                                     track["albumName"][:70],
                                     track["trackName"]])[:255]
                try:
                    cursor.execute("INSERT INTO tracklocation VALUES(%s, %s)", (track['trackID'], path_name))
                except DataError as e:
                    print(cursor._last_executed)    # Catch any mistakes
                    raise e


if __name__ == "__main__":
    main()
