#! /usr/bin/env python3

import sys
import random
import pymysql.cursors
from pymysql.err import *
import xml.etree.ElementTree as ET


def gen_tuple(track, *args, failed=None, append=list()):
    """
    Searches the iTunes track object for the requested keys and generates a list of the results, in order of args given.

    :param track: The iTunes object to search.
    :param args: The keys to search for, or a tuple with (key, custom fail value)
    :param failed: The value to use by default if the search fails. Defaults to None
    :param append: A list to append to the end of the tuple.
    :return: The list of results, plus the contents of append.
    """

    def multi_search(key, inner_failed=failed):
        """
        Dynamically replaces searches asking for Artist/Sort Artist or Album/Sort Album with a search for both.

        :param key: The key to search for
        :param inner_failed: The value to use if the search fails. Defaults to outer function's failed value
        :return: The search list
        """
        search = []
        search_artist = ["Album Artist", "Sort Artist", "Artist"]
        search_album = ["Sort Album", "Album"]
        if key in search_artist:
            search = search_artist
        elif key in search_album:
            search = search_album
        else:
            res = track.get(key, inner_failed)
            if arg == "Year" and (int(res) < 1000 or int(res) > 3000):
                res = 1945
            return res

        search.remove(key)
        aResult = track.get(key)

        if not aResult:
            for option in search:
                aResult = track.get(option, inner_failed)
                if aResult: break

        return aResult

    result = []
    for arg in args:
        if type(arg) != str:
            result.append(multi_search(arg[0], arg[1]))
        else:
            result.append(multi_search(arg, failed))

    result.extend(append)

    return result


def convert_xml_dict_to_json(element):
    """
    Converts a dict representing an iTunes media item into a python object.

    :param element: The XML object
    :return: The python object equivalent
    """
    result = {}
    last_tag = None

    for tag in element:
        # Create new dict elements
        if tag.tag == "key":
            last_tag = tag.text
            result[tag.text] = None

        elif tag.tag == "dict" or tag.tag == "array":
            print("Not supported: {0} Last Tag: {1}".format(tag.tag, last_tag), file=sys.stderr)

        elif tag.tag == "true":
            result[last_tag] = True
        elif tag.tag == "false":
            result[last_tag] = False
        elif tag.tag == "integer":
            result[last_tag] = int(tag.text)
        else:
            result[last_tag] = tag.text

    return result


def main():
    """
    TODO: finish this docstring
    :return:
    """
    # Sanity check
    if len(sys.argv) != 5:
        print("Wrong number of arguments specified!")
        return

    # Get commandline arguments
    plist_path = sys.argv[1]
    db_url = sys.argv[2]
    db_user = sys.argv[3]
    db_pass = sys.argv[4]

    # Parse XML doc
    tree = ET.parse(plist_path)

    # Get track dict
    tracks_dict = tree.find("./dict/dict[1]")

    # Get all tracks
    tracks_xml_list = tracks_dict.findall("./dict")

    # Convert tracks to python objects
    tracks = []
    for track in tracks_xml_list:
        tracks.append(convert_xml_dict_to_json(track))

    # Filter out protected files, videos, and non-file objects
    exclude_track_types = [
        #"Remote",
        "URL"
    ]
    exclude_kinds = [
        None,
        'MPEG-4 video file',
        #'Apple Music AAC audio file',
        'Internet audio stream',
        'Purchased AAC audio file',
        'Purchased MPEG-4 video file',
        'Protected AAC audio file',
        'Protected MPEG-4 video file'
    ]
    tracks = [x for x in tracks if
              x.get("Track Type") not in exclude_track_types and
              x.get("Kind") not in exclude_kinds]

    # Connect to the database
    with pymysql.connect(host=db_url,
                         user=db_user,
                         password=db_pass,
                         db='apollo',
                         charset='utf8') as cursor:

        # TODO: Totally ignoring any concurrency issues. Fix. Sometime.

        sql_genre = "INSERT INTO genre(genreName) VALUES (%s)"
        sel_genre = "SELECT genreID FROM genre WHERE genreName = %s"
        sql_artist = "INSERT INTO artist(artistName, artistOrigin, startYear) VALUES (%s,%s,%s)"    # TODO: Uh oh...
        sel_artist = "SELECT artistID FROM artist WHERE artistName = %s"
        sql_album = "INSERT INTO album(albumName, releaseYear, artist, genre) VALUES (%s, %s, %s, %s)"
        sel_album = "SELECT albumID FROM album WHERE albumName = %s AND releaseYear = %s AND artist = %s"
        sql_track = "INSERT INTO track(trackName, length, genre, artist) VALUES (%s, %s, %s, %s)"
        sel_track = "SELECT trackID from track WHERE trackName = %s AND artist = %s"
        sql_albumordering = "INSERT INTO albumordering(position, album, track) VALUES (%s, %s, %s)"

        # Push tracks to DB
        for track in tracks:

            # Bump track numbers up if they're on disk 2, 3, 4, etc.
            if "Track Number" in track:
                track["Track Number"] += (int(track.get("Disc Number", 1)) - 1) * int(track.get("Track Count", 0))

            # Create genre - if already exists, continue
            try:
                cursor.execute(sql_genre, gen_tuple(track, "Genre", failed="1945"))
            except DataError as e:
                print("Create Genre failed. Last query: " + cursor._last_executed, file=sys.stderr)
                raise e
            except IntegrityError as e:
                if "Duplicate" in str(e):
                    pass
                else:
                    raise e

            # Get genre ID
            try:
                cursor.execute(sel_genre, gen_tuple(track, "Genre", failed="1945"))
                genre_id = int(cursor.fetchone()[0])
            except BaseException as e:
                raise e

            # Create artist - if already exists, continue
            try:
                cursor.execute(sql_artist, gen_tuple(track, ("Album Artist", "1945"), "C", "C"))
            except DataError as e:
                print("Create Artist failed. Last query: " + cursor._last_executed, file=sys.stderr)
                raise e
            except IntegrityError as e:
                if "Duplicate" in str(e):
                    pass
                else:
                    raise e

            # Get artist ID
            try:
                cursor.execute(sel_artist, gen_tuple(track, "Album Artist", failed="1945"))
                artist_id = int(cursor.fetchone()[0])
            except BaseException as e:
                raise e

            # Create album - if already exists, continue
            try:
                tup = gen_tuple(track, ("Sort Album", "1945"), "Year", failed=1945, append=[artist_id, genre_id])
                cursor.execute(sql_album, tup)
            except DataError as e:
                print("Create Album failed. Last query: " + cursor._last_executed, file=sys.stderr)
                raise e
            except IntegrityError as e:
                if "Duplicate" in str(e):
                    pass
                else:
                    raise e

            # Get album ID
            try:
                tup = gen_tuple(track, ("Sort Album", "1945"), "Year", failed=1945, append=[artist_id])
                cursor.execute(sel_album, tup)
                album_id = int(cursor.fetchone()[0])
            except BaseException as e:
                continue    # HAX
                raise e

            # Create track - if already exists, continue
            try:
                cursor.execute(sql_track, gen_tuple(track, "Name", "Total Time", append=[genre_id, artist_id]))
            except DataError as e:
                print("Create Artist failed. Last query: " + cursor._last_executed, file=sys.stderr)
                raise e
            except IntegrityError as e:
                if "Duplicate" in str(e):
                    pass
                else:
                    raise e

            # Get track ID
            try:
                cursor.execute(sel_track, gen_tuple(track, "Name", append=[artist_id]))
                track_id = int(cursor.fetchone()[0])
            except BaseException as e:
                raise e

            # Add to album ordering
            last_num = None
            while True:
                try:
                    cursor.execute(sql_albumordering,
                                   gen_tuple(track,
                                             "Track Number",
                                             failed=random.randrange(100, 999),
                                             append=[album_id, track_id])
                                   )
                except BaseException as e:      # Hack
                    print(e, file=sys.stderr)
                    break
                except IntegrityError:
                    if track.get('Track Number', 1945) == last_num:
                        track['Track Number'] = random.randrange(100, 999)
                    else:
                        last_num = track['Track Number']
                    continue
                break


if __name__ == "__main__":
    main()
