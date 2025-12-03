import React, { useState, useEffect, useMemo } from "react";
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
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { productApi, salesApi } from "../../lib/api";
import { Product } from "../../types";

// --- Types for Form Data ---
interface CartItem {
  product: Product;
  quantity: number;
}

interface SingleSaleForm {
  product_id: number | "";
  quantity: number;
}

// Type for data sent to the bulk endpoint
interface BulkSaleItem {
  product_id: number;
  quantity: number;
  // user_id is handled securely by the backend token
}

interface Props {
  onAdded: () => void;
}

const AddSaleModal: React.FC<Props> = ({ onAdded }) => {
  const [open, setOpen] = useState(false);
  const [isMultiSaleMode, setIsMultiSaleMode] = useState(false);

  // Single Product State
  const [singleForm, setSingleForm] = useState<SingleSaleForm>({
    product_id: "",
    quantity: 1,
  });

  // Multi Product State (The Cart)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");

  // Global State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  // --- Effects and Handlers ---

  useEffect(() => {
    if (open) {
      const fetchProducts = async () => {
        try {
          setProductsLoading(true);
          const productList = (await productApi.getAll()) as Product[];
          setProducts(productList);
        } catch (error) {
          console.error("Failed to fetch products:", error);
        } finally {
          setProductsLoading(false);
        }
      };
      fetchProducts();
    }
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    // Reset states on open
    setSingleForm({ product_id: "", quantity: 1 });
    setCart([]);
    setSelectedProductId("");
    setIsMultiSaleMode(false);
  };

  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsMultiSaleMode(event.target.checked);
    // Clear forms when switching modes
    setSingleForm({ product_id: "", quantity: 1 });
    setCart([]);
    setSelectedProductId("");
  };

  const handleSingleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSingleForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "product_id" ? Number(value) : value,
    }));
  };

  const handleAddToCart = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingIndex !== -1) {
      const updatedCart = [...cart];
      if (updatedCart[existingIndex].quantity < product.stock) {
        updatedCart[existingIndex].quantity += 1;
        setCart(updatedCart);
      }
    } else {
      if (product.stock > 0) {
        setCart((prev) => [...prev, { product, quantity: 1 }]);
      }
    }
    setSelectedProductId("");
  };

  const handleCartQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const maxQuantity = item.product.stock;
          const safeQuantity = Math.min(newQuantity, maxQuantity);
          return { ...item, quantity: safeQuantity };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // --- Submission Logic ---

  const totalAmount = useMemo(() => {
    if (isMultiSaleMode) {
      return cart.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );
    }
    const product = products.find((p) => p.id === singleForm.product_id);
    return product ? Number(product.price) * singleForm.quantity : 0;
  }, [isMultiSaleMode, cart, singleForm, products]);

  const selectedProduct = products.find((p) => p.id === singleForm.product_id);

  // --- SUBMISSION FOR SINGLE SALE ---
  const handleSingleSaleSubmit = async () => {
    if (!singleForm.product_id || singleForm.quantity <= 0) {
      alert("Please select a product and enter a valid quantity.");
      return;
    }
    try {
      setLoading(true);
      await salesApi.create({
        product_id: singleForm.product_id,
        quantity: singleForm.quantity,
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

  // --- SUBMISSION FOR MULTI SALE (OPTIMIZED BULK BACKEND) ---
  const handleMultiSaleSubmit = async () => {
    if (cart.length === 0) {
      alert("The cart is empty.");
      return;
    }

    // 1. Map the cart items to the simple structure the backend expects
    const salesData: BulkSaleItem[] = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    try {
      setLoading(true);

      // ⭐ OPTIMIZED API CALL: Send the entire cart array in one request ⭐
      await salesApi.createBulk(salesData);

      onAdded();
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert(
        "Failed to complete multi-sale. Check the console for server errors."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
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
        maxWidth={isMultiSaleMode ? "md" : "sm"}
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            Add New Sale
            <FormControlLabel
              control={
                <Switch
                  checked={isMultiSaleMode}
                  onChange={handleModeChange}
                  name="saleMode"
                  color="primary"
                />
              }
              label={
                isMultiSaleMode ? "Multi-Product (Cart)" : "Single Product"
              }
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {productsLoading ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress />
              <Typography ml={2}>Loading products...</Typography>
            </Box>
          ) : isMultiSaleMode ? (
            // --- Multi-Sale UI (Cart View) ---
            <Box>
              <Typography variant="h6" gutterBottom>
                Add Items to Cart
              </Typography>

              <Box display="flex" gap={2} mb={3}>
                <TextField
                  select
                  label="Select Product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  fullWidth
                >
                  {products.map((product) => (
                    <MenuItem
                      key={product.id}
                      value={product.id}
                      disabled={product.stock === 0}
                    >
                      {product.name} (Stock: {product.stock}) - KES{" "}
                      {Number(product.price).toFixed(2)}
                    </MenuItem>
                  ))}
                </TextField>
                <IconButton
                  color="primary"
                  onClick={handleAddToCart}
                  disabled={
                    !selectedProductId ||
                    products.find((p) => p.id === selectedProductId)?.stock ===
                      0
                  }
                  size="large"
                >
                  <AddIcon />
                </IconButton>
              </Box>

              <Typography variant="h6" gutterBottom>
                Current Cart ({cart.length} items)
              </Typography>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="center">Unit Price</TableCell>
                      <TableCell align="center" sx={{ width: 150 }}>
                        Quantity
                      </TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Cart is empty.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((item) => (
                        <TableRow key={item.product.id}>
                          <TableCell>{item.product.name}</TableCell>
                          <TableCell align="center">
                            KES {Number(item.product.price).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) =>
                                handleCartQuantityChange(
                                  item.product.id,
                                  Number(e.target.value)
                                )
                              }
                              inputProps={{
                                min: 1,
                                max: item.product.stock,
                              }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            KES{" "}
                            {(
                              Number(item.product.price) * item.quantity
                            ).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleRemoveFromCart(item.product.id)
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Total Display */}
              <Box display="flex" flexDirection="column" gap={2} mt={4}>
                <Typography variant="h5" align="right" mt={1} color="primary">
                  GRAND TOTAL: KES {totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ) : (
            // --- Single-Sale UI ---
            <Box display="flex" flexDirection="column" gap={3} mt={1}>
              <TextField
                select
                label="Product *"
                name="product_id"
                value={singleForm.product_id}
                onChange={handleSingleFormChange}
                fullWidth
                required
              >
                {products.map((product) => (
                  <MenuItem
                    key={product.id}
                    value={product.id}
                    disabled={product.stock === 0}
                  >
                    {product.name} (Stock: {product.stock})
                  </MenuItem>
                ))}
              </TextField>

              {selectedProduct && (
                <TextField
                  label="Unit Price (KES)"
                  value={`KES ${Number(selectedProduct.price).toFixed(2)}`}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  sx={{ pointerEvents: "none" }}
                />
              )}

              <TextField
                label="Quantity *"
                name="quantity"
                type="number"
                value={singleForm.quantity}
                onChange={handleSingleFormChange}
                fullWidth
                required
                inputProps={{ min: 1, max: selectedProduct?.stock || 9999 }}
              />

              <TextField
                label="Total Amount (KES)"
                value={`KES ${totalAmount.toFixed(2)}`}
                InputProps={{ readOnly: true }}
                fullWidth
                sx={{
                  fontWeight: "bold",
                  ".MuiInputBase-input": { fontWeight: "bold", color: "green" },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={
              isMultiSaleMode ? handleMultiSaleSubmit : handleSingleSaleSubmit
            }
            disabled={loading || (isMultiSaleMode && cart.length === 0)}
          >
            {loading ? "Processing..." : "Complete Sale"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddSaleModal;
