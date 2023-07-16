const fs = require('fs');

// read the file
fs.readFile('./Last-Upload (1).txt', 'utf8', (err, data) => {
  if (err) {
    console.log(`Error reading file from disk: ${err}`);
  } else {
    // split the file into lines
    const lines = data.split('\n');

    // initialize an array to hold your products
    const products = [];

    // process each line
    for (const line of lines) {
      // split the line into fields using tab as the delimiter
      const fields = line.split('\t');

      // parse the fields into a product
      const product = {
        upc: fields[0],
        name: fields[1],
        size: fields[4],
        locations: [
          {
            aisle: "Not assigned",
            section: "Not assigned",
            shelf: "Not assigned"
          }
        ]
      };

      // add product to array
      products.push(product);
    }

    // print all products
    console.log(products);

    // if you want to write the products to a JSON file
    fs.writeFile('products.json', JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.log('Error writing file:', err);
      } else {
        console.log('Successfully wrote products to file');
      }
    });
  }
});
