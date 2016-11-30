import pymysql
import randomName
import random
import string

def populate():
    apollo = pymysql.connect(host='localhost',
                             port=3306,
                             user = 'root',
                             passwd = 'test',
                             db = 'apollo_test')
    cursor = apollo.cursor()

    count = 0
    while (count < 10000):
        firstName = randomName.get_first_name()
        lastName = randomName.get_last_name()
        username = (firstName[0] + lastName + str(count)).lower()
        passwd = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(20))
        cursor.execute("INSERT INTO user(username, password, prefFirstName, lastName) VALUES (%s, %s, %s, %s)", (username, passwd, firstName, lastName))
        count += 1
        #print("going thru loop " + str(count))

    try:
        apollo.commit()
    except:
        apollo.rollback()
        print("goofed")
    cursor.close()

populate()


