from geopy.geocoders import Nominatim
from functools import cache
import sys
import csv
import time
import os

inputfile = sys.argv[1]
outputfile = sys.argv[2]
inputlocation = sys.argv[3]

print("Reading: " + inputfile)
print("Writing: " + outputfile)
print("Address Column: " + inputlocation)

geolocator = Nominatim(user_agent="tracker")

class stats:
    lookups = 0
    totalrows = 0
    skips = 0
    unknowns = 0
    successes = 0
    priorruncachehits = 0

@cache
def lookup(value):
    stats.lookups = stats.lookups + 1
    return geolocator.geocode(locationvalue, language="en")

previous = {}
if (os.path.exists(outputfile)):
    with open(outputfile, newline='') as f:
        reader = csv.DictReader(f)

        for row in reader:
            locationvalue = row[inputlocation]
            resolved = row['resolved_' + inputlocation]

            if (resolved != None and resolved != ""):
                #print('resolved: ' + resolved + " "  + str(row))
                cachedlocation = {}
                cachedlocation[inputlocation] = locationvalue
                cachedlocation['address'] = resolved
                cachedlocation['latitude'] = row['latitude']
                cachedlocation['longitude'] = row['longitude']

                previous[locationvalue] = cachedlocation
with open(outputfile, 'w+', newline='') as f:
    writer = csv.writer(f)

    headers = [inputlocation, 'resolved_' + inputlocation, 'latitude', 'longitude']

    writer.writerow(headers)
    with open('input.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            stats.totalrows = stats.totalrows + 1
            locationvalue = row[inputlocation]

            #print(locationvalue)
            if (locationvalue != ""):
                if (locationvalue in previous.keys()):
                    stats.priorruncachehits = stats.priorruncachehits + 1
                    writer.writerow([locationvalue, previous[locationvalue]['address'], previous[locationvalue]['latitude'], previous[locationvalue]['longitude']])
                else: 
                    location = lookup(locationvalue)
                    if (location == None):
                        stats.unknowns = stats.unknowns + 1
                        print("Failed to find " + locationvalue)
                        writer.writerow([locationvalue, "", "", ""])
                    else: 
                        stats.successes = stats.successes + 1
                        #print(location)
                        writer.writerow([locationvalue, location.address, location.latitude, location.longitude])
                        time.sleep(1)
            else:
                stats.skips = stats.skips + 1
                writer.writerow(["", "", "", ""])


print("rows: " + str(stats.totalrows))
print("successes: " + str(stats.successes))
print("lookups: " + str(stats.lookups))
print("blank lines: " + str(stats.skips))
print("unknowns: " + str(stats.unknowns))
print("cache hits from prior run: " + str(stats.priorruncachehits))
