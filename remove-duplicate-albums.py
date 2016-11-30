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
        plist_path = sys.argv[1]
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

            sql_find_offenders = "SELECT albumName, artist, MAX(releaseYear) AS year, COUNT(*) AS rowCount FROM album GROUP BY albumName, artist HAVING rowCount > 1 ORDER BY rowCount DESC"
            sql_get_good_id = "SELECT albumID FROM album WHERE albumName = %s AND artist = %s AND releaseYear = %s"
            sql_get_bad_ids = "SELECT albumID FROM album WHERE albumName = %s AND artist = %s AND releaseYear != %s"
            sql_fix_bad = "UPDATE albumordering SET albumordering.album={0} WHERE albumordering.album IN ({1})"
            sql_delete_bad = "DELETE FROM album WHERE album.albumID IN ({0})"
            sql_drop_protections = [
                "ALTER TABLE apollo.albumordering DROP FOREIGN KEY albumordering_album_albumID_fk",
                "ALTER TABLE apollo.albumordering DROP FOREIGN KEY albumordering_track_trackID_fk"
            ]
            sql_add_protections = [
                "ALTER TABLE apollo.albumordering ADD CONSTRAINT albumordering_album_albumID_fk FOREIGN KEY (album) REFERENCES album (albumID)",
                "ALTER TABLE apollo.albumordering ADD CONSTRAINT albumordering_track_trackID_fk FOREIGN KEY (track) REFERENCES track (trackID)"
            ]

            # Drop foreign key protections
            cursor.executemany(";".join(sql_drop_protections))

            # Find all duplicate albums
            cursor.execute(sql_find_offenders)
            offenders = cursor.fetchall()

            # Get rid of all duplicate albums
            for offender in offenders:
                # Make the SQL queries (remember to escape strings!)
                replacements = ('"' + offender['albumName'].replace('"', '\\"') + '"', offender['artist'], offender['year'])
                good = sql_get_good_id % replacements
                bad = sql_get_bad_ids % replacements

                # Get good and bad IDs
                cursor.execute(good)
                good_id = cursor.fetchone()
                cursor.execute(bad)
                bad_ids = [str(x['albumID']) for x in cursor.fetchall()]

                # Replace all the issues
                try:
                    replace = sql_fix_bad.format(str(good_id['albumID']), ", ".join(bad_ids))
                    cursor.execute(replace)
                    delete = sql_delete_bad.format(", ".join(bad_ids))
                    cursor.execute(delete)
                except IntegrityError as e:
                    # Any updates that cause a duplication are printed here for manual fixing.
                    print(e, file=sys.stderr)
                    continue

            # Add foreign key protections
            cursor.executemany(";".join(sql_add_protections))

if __name__ == "__main__":
    main()
