const express = require('express');
const app = express();
const fs = require('fs');
const port = 5000;
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let products = [];

fs.readFile('./products.json', 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file from disk: ${err}`);
  } else {
    products = JSON.parse(data);
  }
});

app.get('/', (req, res) => {
  let data = '<table>';

  for (let product of products) {
    data += `<tr><td>${product.upc}</td><td>${product.name}</td><td>`;
    
    // Iterate over each location for the product
    for (let location of product.locations) {
      data += `Aisle: ${location.aisle}, Section: ${location.section}, Shelf: ${location.shelf}<br>`;
    }
    
    data += '</td></tr>';
  }

  data += '</table>';

  res.send(data);
});

app.get('/api/products/search', (req, res) => {
  let searchTerm = req.query.upc.replace(/^0+/, ''); // remove leading zeros from searchTerm
  let searchResults = products.filter(product => product.upc.replace(/^0+/, '') === searchTerm); // remove leading zeros from product.upc before comparison
  res.json(searchResults);
});

app.post('/api/products/addLocations', (req, res) => {
    const { upc, locations } = req.body;
  
    fs.readFile('products.json', (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
  
      const products = JSON.parse(data);
      const productIndex = products.findIndex(product => product.upc === upc);
  
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Add the new locations to the product's locations array
      products[productIndex].locations.push(...locations);
  
      fs.writeFile('products.json', JSON.stringify(products, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        res.json({ message: 'Locations added' });
      });
    });
  });

  app.delete('/api/products/deleteLocation', (req, res) => {
    const { upc, location } = req.body;
  
    const productIndex = products.findIndex(product => product.upc === upc);
  
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Product not found' });
    }
  
    // Find the location in the product's locations array
    const locationIndex = products[productIndex].locations.findIndex(loc =>
      loc.aisle === location.aisle &&
      loc.section === location.section &&
      loc.shelf === location.shelf
    );
  
    if (locationIndex === -1) {
      return res.status(404).json({ message: 'Location not found' });
    }
  
    // Remove the location
    products[productIndex].locations.splice(locationIndex, 1);
  
    // Write the updated data back to the file
    fs.writeFile('products.json', JSON.stringify(products, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
  
      res.json({ message: 'Location deleted' });
    });
  });
  

  

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
