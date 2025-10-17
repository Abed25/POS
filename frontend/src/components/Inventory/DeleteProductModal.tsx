import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { productApi } from "../../lib/api";
import { Product } from "../../types";

interface Props {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onDeleted: () => void;
}

const DeleteProductModal: React.FC<Props> = ({
  open,
  product,
  onClose,
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open, product]);

  const handleDelete = async () => {
    if (!product) return;
    try {
      setLoading(true);
      await productApi.remove(product.id);
      onDeleted();
      onClose();
    } catch (err: any) {
      console.error("Delete failed:", err);
      setError(err?.message || "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>Delete product</DialogTitle>
      <DialogContent>
        <Box display="flex" gap={2} alignItems="flex-start" mt={0.5}>
          <Typography variant="body1">
            Are you sure you want to delete{" "}
            <strong>{product ? product.name : "this product"}</strong>? This
            action cannot be undone.
          </Typography>
        </Box>
        {error && (
          <Typography variant="body2" color="error" mt={1}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {loading ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProductModal;
