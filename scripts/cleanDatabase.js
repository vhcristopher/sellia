const dbName = 'sellia';
const db = connect('mongodb://localhost:27017/' + dbName);

db.getCollectionNames().forEach(function(c) {
    db[c].deleteMany({});
});

print('Base de datos limpiada');
