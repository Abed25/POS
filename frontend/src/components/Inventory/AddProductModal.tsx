import React, { useState } from "react";
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
import { Product } from "../../types/index";

interface Props {
  onAdded: () => void; // reload list after adding
}

const AddProductModal: React.FC<Props> = ({ onAdded }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<
    Omit<Product, "id" | "created_at" | "updated_at">
  >({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    sku: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await productApi.add(form);
      onAdded();
      setOpen(false);
      setForm({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category: "",
        sku: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        + Add Product
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Product Name *"
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
              multiline
              rows={2}
            />
            <TextField
              label="Price (KSh) *"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Stock *"
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
              label="SKU *"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddProductModal;
