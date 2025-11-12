import React, { useState, useEffect, useMemo } from "react";
import { productApi } from "../lib/api";
import { Product } from "../types";

// Import Material-UI components
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

const UserProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(8);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Data Fetching Logic (unchanged)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = (await productApi.getAll()) as Product[];
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(
          "Failed to load products. Please check the network connection."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }

    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return products.filter((product) => {
      const nameMatch = product.name
        .toLowerCase()
        .includes(lowercasedSearchTerm);
      const descriptionMatch = product.description
        ? product.description.toLowerCase().includes(lowercasedSearchTerm)
        : false;

      return nameMatch || descriptionMatch;
    });
  }, [products, searchTerm]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = useMemo(() => {
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [
    filteredProducts,
    currentPage,
    productsPerPage,
    indexOfFirstProduct,
    indexOfLastProduct,
  ]);

  // Handlers (unchanged)
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event: any) => {
    setProductsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  // --- Conditional Rendering ---
  if (loading) {
    return (
      <Container style={{ textAlign: "center", marginTop: "50px" }}>
        <CircularProgress />
        <Typography variant="h6" style={{ marginTop: "10px" }}>
          Loading products...
        </Typography>
      </Container>
    );
  }
  if (error) {
    return (
      <Container style={{ marginTop: "50px" }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (products.length === 0) {
    return (
      <Container style={{ marginTop: "50px" }}>
        <Typography variant="h5" align="center">
          No products found.
        </Typography>
      </Container>
    );
  }

  // Success State: Display Products
  return (
    <Container maxWidth="lg" style={{ marginTop: "40px" }}>
      <Typography variant="h4" gutterBottom>
        📦 Available Products
      </Typography>

      {/* Controls Stack */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        {/* Search Bar */}
        <TextField
          label="Search Products"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            flexGrow: 1,
            minWidth: 200,
            maxWidth: { xs: "100%", sm: "400px" },
          }}
        />

        {/* Page Size Select */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="page-size-label">Per Page</InputLabel>
          <Select
            labelId="page-size-label"
            value={productsPerPage}
            onChange={handlePageSizeChange}
            label="Per Page"
          >
            <MenuItem value={4}>4</MenuItem>
            <MenuItem value={8}>8</MenuItem>
            <MenuItem value={12}>12</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Display "No Results Found" for filtered list */}
      {filteredProducts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No products match your search term.
        </Alert>
      )}

      {/* Product Listing Box */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        {currentProducts.map((product) => (
          <Card key={product.id as React.Key} elevation={3}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6" component="div">
                  {product.name}
                </Typography>

                {/* 🌟 CURRENCY FIX APPLIED HERE 🌟 */}
                <Typography color="primary" variant="h5">
                  {product.price
                    ? `KES ${Number(product.price).toFixed(2)}` // Changed $ to KES
                    : "Price N/A"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {product.description ||
                    "A brief product description is missing."}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Stack spacing={2} sx={{ mt: 4 }} alignItems="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Stack>
      )}
    </Container>
  );
};

export default UserProducts;
