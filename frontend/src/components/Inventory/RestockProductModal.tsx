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
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onRestocked: () => void; // reload list after restocking
}

const RestockProductModal: React.FC<Props> = ({
  open,
  product,
  onClose,
  onRestocked,
}) => {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (open) setQty(1);
  }, [open, product]);

  const handleRestock = async () => {
    if (!product || qty <= 0) return;
    try {
      setLoading(true);
      await productApi.patch(product.id, { stock: product.stock + qty });
      onRestocked();
      onClose();
    } catch (err) {
      alert("Failed to restock product.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Restock {product ? `"${product.name}"` : ""}</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Quantity"
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            inputProps={{ min: 1 }}
            fullWidth
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRestock}
          disabled={loading || qty <= 0}
        >
          {loading ? "Restocking..." : "Restock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RestockProductModal;
