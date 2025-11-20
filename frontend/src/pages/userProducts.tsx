import React, { useState, useEffect, useMemo } from "react";
import { productApi } from "../lib/api";
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
  Chip,
  Divider, // 👈 Added Divider for visual separation
  useTheme,
} from "@mui/material";

// Ensure your Product type includes stock
export interface Product {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

const StoreCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme(); // Accessing theme for subtle colors

  // Pagination & Search State (kept for large catalogs)
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(12); // Increased default items
  const [searchTerm, setSearchTerm] = useState("");

  // --- Data Fetching Logic (unchanged) ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = (await productApi.getAll()) as Product[];
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please check the network connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // --- Filtering & Pagination Logic (unchanged) ---
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return products.filter((product) =>
      product.name.toLowerCase().includes(lowercasedSearchTerm) || 
      (product.description && product.description.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = useMemo(() => {
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredProducts, currentPage, productsPerPage]);
  
  // --- Handlers (unchanged) ---
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
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

  // --- Conditional Rendering (Loading/Error) ---
  if (loading) {
    return (
      <Container style={{ textAlign: "center", marginTop: "50px" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 1 }}>Loading catalog...</Typography>
      </Container>
    );
  }
  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  if (products.length === 0) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography variant="h6" align="center">
          No products found in the catalog.
        </Typography>
      </Container>
    );
  }

  // --- Main Render: Display Products ---
  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h5" gutterBottom fontWeight="600" color="text.primary">
        Store Inventory Lookup
      </Typography>

      {/* Controls Stack (Compact) */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <TextField
          label="Quick Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: 200 }}
        />
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel>View</InputLabel>
          <Select
            value={productsPerPage}
            onChange={handlePageSizeChange}
            label="View"
          >
            <MenuItem value={8}>8 / page</MenuItem>
            <MenuItem value={12}>12 / page</MenuItem>
            <MenuItem value={20}>20 / page</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* No Search Results */}
      {filteredProducts.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No items match your search term.
        </Alert>
      )}

      {/* Product Listing Grid */}
      <Box
        sx={{
          display: "grid",
          gap: 2, // Reduced gap
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        {currentProducts.map((product) => {
          const isOutOfStock = product.stock <= 0;
          
          return (
            <Card
              key={product.id as React.Key}
              elevation={2} // Reduced elevation for cleaner look
              sx={{
                transition: 'all 0.3s',
                '&:hover': {
                    elevation: 4, // Slight lift on hover
                },
                backgroundColor: isOutOfStock ? theme.palette.grey[50] : 'white',
                borderLeft: isOutOfStock ? `4px solid ${theme.palette.error.main}` : `4px solid ${theme.palette.primary.main}`,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  
                  {/* 1. Product Name */}
                  <Typography variant="subtitle2" component="div" noWrap fontWeight="600">
                    {product.name}
                  </Typography>

                  <Divider sx={{ my: 0.5 }} />
                  
                  {/* 2. Price (Clear, Standard Size) */}
                  <Typography variant="h6" fontWeight="700" color={theme.palette.primary.dark}>
                    {product.price
                      ? `KES ${Number(product.price).toFixed(2)}`
                      : "Price N/A"}
                  </Typography>
                  
                  {/* 3. Stock Status & Count */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                        Stock:
                    </Typography>
                    <Chip
                      label={isOutOfStock ? "Out of Stock" : `${product.stock} units`}
                      size="small"
                      color={isOutOfStock ? "error" : "success"}
                      variant="outlined"
                      sx={{ 
                          fontWeight: 'bold', 
                          height: 24, 
                          fontSize: '0.7rem' 
                      }}
                    />
                  </Stack>
                  

                  {/* 4. Description (Very Subtle) */}
                  <Box sx={{ pt: 1 }}>
                    <Typography variant="caption" color="text.disabled" sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical' 
                    }}>
                      {product.description || "No specific details available."}
                    </Typography>
                  </Box>
                  
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Stack spacing={2} sx={{ mt: 4 }} alignItems="center">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      )}
    </Container>
  );
};

export default StoreCatalog;