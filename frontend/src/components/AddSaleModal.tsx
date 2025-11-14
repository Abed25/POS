// src/components/AddSaleModal.tsx (Create this new file)
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { productApi, salesApi } from "../lib/api"; // Ensure productApi is available
import { Product } from "../types";

interface SaleForm {
  product_id: number | "";
  quantity: number;
  seller: string; // Corresponds to the 'seller' field in your backend
}

interface Props {
  onAdded: () => void; // Reload sales list after adding
}

const AddSaleModal: React.FC<Props> = ({ onAdded }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SaleForm>({
    product_id: "",
    quantity: 1,
    seller: "", // Default seller/cashier
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  // Fetch product list for the dropdown
  useEffect(() => {
    if (open) {
      const fetchProducts = async () => {
        try {
          setProductsLoading(true);
          // Assuming productApi.list() fetches all products for selection
          const productList = await productApi.getAll();
          setProducts(productList);
        } catch (error) {
          console.error("Failed to fetch products:", error);
          // Handle error display
        } finally {
          setProductsLoading(false);
        }
      };
      fetchProducts();
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "product_id" ? Number(value) : value,
    }));
  };

  const handleOpen = () => {
    setOpen(true);
    // Reset form on open
    setForm({ product_id: "", quantity: 1, seller: "" });
  };

  const handleSubmit = async () => {
    if (!form.product_id || form.quantity <= 0) {
      alert("Please select a product and enter a valid quantity.");
      return;
    }

    // You only send product_id, quantity, and seller.
    // The backend is expected to calculate total_price and update stock.
    try {
      setLoading(true);

      // The salesApi.create method expects the data for the new sale.
      await salesApi.create({
        product_id: form.product_id,
        quantity: form.quantity,
        seller: form.seller,
        // Optional: Add other fields if required by your backend
      });

      onAdded();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add sale");
    } finally {
      setLoading(false);
    }
  };

  // Find the selected product to display its unit price (in KES)
  const selectedProduct = products.find((p) => p.id === form.product_id);

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        // Tailwind equivalent: bg-blue-600 hover:bg-blue-700
        sx={{
          backgroundColor: "#2563EB",
          "&:hover": { backgroundColor: "#1D4ED8" },
        }}
      >
        + Add New Sale
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Sale</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={1}>
            {/* Product Dropdown */}
            {productsLoading ? (
              <Box display="flex" justifyContent="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <TextField
                select
                label="Product *"
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                fullWidth
                required
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock})
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Price Display */}
            {selectedProduct && (
              <TextField
                label="Unit Price (KES)"
                value={`KES ${Number(selectedProduct.price).toFixed(2)}`}
                InputProps={{ readOnly: true }}
                fullWidth
                sx={{ pointerEvents: "none" }}
              />
            )}

            {/* Quantity */}
            <TextField
              label="Quantity *"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />

            {/* Calculated Total */}
            <TextField
              label="Total Amount (KES)"
              value={`KES ${(selectedProduct
                ? selectedProduct.price * form.quantity
                : 0
              ).toFixed(2)}`}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{
                fontWeight: "bold",
                ".MuiInputBase-input": { fontWeight: "bold", color: "green" },
              }}
            />

            {/* Seller/Cashier Name */}
            <TextField
              label="Cashier/Seller Name"
              name="seller"
              value={form.seller}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : "Complete Sale"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddSaleModal;
