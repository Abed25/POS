import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { productApi } from "../../lib/api";
import { Product } from "../../types";

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onEdited: () => void; // reload list after editing
}

const EditProductModal: React.FC<Props> = ({
  open,
  product,
  onClose,
  onEdited,
}) => {
  const [form, setForm] = useState<
    Omit<Product, "id" | "created_at" | "updated_at">
  >({
    name: "",
    description: "",
    price: 0,
    cost_price: 0,
    stock: 0,
    max_stock: 0,
    min_stock: 0,
    category: "",
    supplier: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && open) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        cost_price: product.cost_price || 0,
        stock: product.stock || 0,
        max_stock: product.max_stock || 0,
        min_stock: product.min_stock || 0,
        category: product.category || "",
        supplier: product.supplier || "",
      });
    }
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" || name === "maxStockLevel"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async () => {
    if (!product) return;
    try {
      setLoading(true);
      await productApi.update(product.id, {
        name: form.name,
        description: form.description,
        price: form.price,
        cost_price: form.cost_price,
        stock: form.stock,
        max_stock: form.max_stock,
        min_stock: form.min_stock,
        category: form.category,
        supplier: form.supplier,
      });
      onEdited();
      onClose();
    } catch (err) {
      alert("Failed to edit product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Cost price"
            name="cost_price"
            type="number"
            value={form.cost_price}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Stock"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Maximun stock"
            name="max_stock"
            type="number"
            value={form.max_stock}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Minimum stock"
            name="min_stock"
            type="number"
            value={form.min_stock}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Supplier"
            name="supplier"
            value={form.supplier}
            onChange={handleChange}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductModal;
