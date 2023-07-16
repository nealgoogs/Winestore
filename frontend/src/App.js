import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [currentProductUpc, setCurrentProductUpc] = useState("");

  const addLocations = async (upc, locations) => {
    const res = await fetch('http://localhost:5000/api/products/addLocations', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ upc, locations }),
    });

    if (!res.ok) {
      const message = `An error has occurred: ${res.status}`;
      throw new Error(message);
    }

    const data = await res.json();

    // After adding locations, manually update the product details in results array
    setResults(results.map(product => {
      if (product.upc === upc) {
        return { ...product, locations: [...product.locations, ...locations] };
      }
      return product;
    }));
  };

  const deleteLocation = async (upc, location) => {
    const res = await fetch('http://localhost:5000/api/products/deleteLocation', {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ upc, location }),
    });

    if (!res.ok) {
      const message = `An error has occurred: ${res.status}`;
      throw new Error(message);
    }

    const data = await res.json();

    // After deleting a location, manually update the product details in results array
    setResults(results.map(product => {
      if (product.upc === upc) {
        return { ...product, locations: product.locations.filter(loc => loc !== location) };
      }
      return product;
    }));
  };

  useEffect(() => {
    const search = async () => {
      if (searchTerm !== "") {
        const response = await fetch(`/api/products/search?upc=${searchTerm}`);
        const data = await response.json();
        setResults(data);
      } else {
        setResults([]);
      }
    };

    search();
  }, [searchTerm]);

  useEffect(() => {
    if (currentProductUpc) {
      setSearchTerm(currentProductUpc);
    }
  }, [currentProductUpc]);

  return (
    <div className="App">
      <h1>Product Search</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="Search for a product by UPC..."
      />

      {results.map(product => (
        <div key={product.upc}>
          <p>Product Name: {product.name}</p>
          <p>UPC: {product.upc}</p>
          {product.locations.length > 0 && (
            <div>
              <p>Locations:</p>
              {product.locations.map((location, index) => (
                <div key={index}>
                  <p>
                    Aisle: {location.aisle}, Section: {location.section}, Shelf: {location.shelf}
                  </p>
                  <button onClick={() => deleteLocation(product.upc, location)}>
                    Delete Location
                  </button>
                </div>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newLocation = {
                aisle: e.target.aisle.value,
                section: e.target.section.value,
                shelf: e.target.shelf.value,
              };
              addLocations(product.upc, [newLocation]);
              e.target.reset();
            }}
          >
            <label>
              Aisle:
              <input type="text" name="aisle" />
            </label>
            <label>
              Section:
              <input type="text" name="section" />
            </label>
            <label>
              Shelf:
              <input type="text" name="shelf" />
            </label>
            <button type="submit">Add Location</button>
          </form>
        </div>
      ))}
    </div>
  );
}

export default App;
