import csv

with open('static/data/earthquake.csv', 'r') as f:
    next(f)
    reader = csv.reader(f)
    for row in reader:
        print("lat" + row[11] + "long" + row[12])

# import csv
# import ast
# from geojson import Point, Feature, dump, FeatureCollection

# pointfeatures = []
# with open('static/data/earthquake.csv', 'r') as f:
#     next(f) #ignore headers line - start on second line
#     reader = csv.reader(f)
#     for row in reader:
#         coords = ast.literal_eval(row[3])
#         point = Point(coords)      
#         pointjson = Feature(name="cv"+row[0], geometry=point, style={"color": "#ff46b5"}, properties={"direction":row[1], "status":row[2]})
#         pointfeatures.append(pointjson)

# feature_collection = FeatureCollection(pointfeatures)

# # populate file to confirm content 
# with open('point.geojson', 'w') as f:
#    dump(feature_collection, f)
