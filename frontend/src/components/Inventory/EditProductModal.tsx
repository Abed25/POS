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
    stock: 0,
    category: "",
    sku: "",
    supplier: "",
    maxStockLevel: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && open) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        stock: product.stock || 0,
        category: product.category || "",
        sku: product.sku || "",
        supplier: product.supplier || "",
        maxStockLevel: product.maxStockLevel || 0,
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
        stock: form.stock,
        category: form.category,
        sku: form.sku,
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
            label="Stock"
            name="stock"
            type="number"
            value={form.stock}
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
            label="SKU"
            name="sku"
            value={form.sku}
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
          <TextField
            label="Max Stock Level"
            name="maxStockLevel"
            type="number"
            value={form.maxStockLevel}
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
