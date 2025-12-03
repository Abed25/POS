// src/pages/UserManagement.tsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack, // Added Stack for layout control
  Divider, // Added Divider for visual separation
  Container, // Added Container for max-width and centering
  useTheme, // Added useTheme for color/style consistency
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Import your user interface and API service
import { User } from "../types";
import { userApi } from "../lib/api";

// Define the shape of the form data
interface UserFormState {
  id?: number;
  username: string;
  role: "cashier" | "customer" | "admin";
  password?: string;
}

// --- 1. User Management Screen Component ---

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormState>({
    username: "",
    password: "",
    role: "cashier",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const theme = useTheme(); // Use theme for MUI colors/styles

  // --- Fetch Data ---
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Your API automatically filters by the authenticated Admin's business_id
      const data = (await userApi.getAll()) as User[];
      setUsers(data);
    } catch (err) {
      setError("Failed to load users. Check connection or authorization.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Dialog/Form Handlers ---

  const handleOpenDialog = (user?: User) => {
    if (user) {
      // Edit mode: populate form with user data
      setIsEditMode(true);
      setFormData({
        id: user.id,
        username: user.username,
        role: user.role,
        password: "", // Password must always be blanked out for security
      });
    } else {
      // Add mode: reset form
      setIsEditMode(false);
      setFormData({ username: "", password: "", role: "cashier" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // Clear form error when closing
    setError(null);
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } }
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- API Submission Handler ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditMode && formData.id) {
        // Prepare update payload: remove empty password and the ID
        const updatePayload: any = { ...formData };
        delete updatePayload.id;
        if (!updatePayload.password) {
          delete updatePayload.password;
        }

        await userApi.update(formData.id, updatePayload);
      } else {
        // Add new user
        await userApi.add(formData as any);
      }
      handleCloseDialog();
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      // Display error from the backend (e.g., username conflict)
      setError(err.message || "Failed to save user.");
    } finally {
      // Only set loading to false if we didn't close the dialog (i.e., if there was an error)
      if (isDialogOpen) {
        setLoading(false);
      }
    }
  };

  // --- Delete Handler ---

  const handleDelete = async (id: number, username: string) => {
    if (!window.confirm(`Are you sure you want to delete user: ${username}?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await userApi.remove(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine Chip style based on role
  const getRoleChipStyles = (role: UserFormState["role"]) => {
    switch (role) {
      case "admin":
        return {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.contrastText,
        };
      case "cashier":
        return {
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.contrastText,
        };
      case "customer":
        return {
          backgroundColor: theme.palette.info.light,
          color: theme.palette.info.contrastText,
        };
      default:
        return {};
    }
  };

  // --- Render Component ---

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4, minHeight: "100vh" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h5"
          component="h1"
          fontWeight="600"
          color="text.primary"
        >
          User Management 🧑‍💼
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading}
          // Adjusted to use MUI style
          sx={{
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Add New User
        </Button>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading user list...
          </Typography>
        </Box>
      )}
      {error &&
        !isDialogOpen && ( // Only show error outside dialog if it's general
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

      {/* Users Table */}
      {!loading && !error && (
        <TableContainer component={Paper} elevation={2}>
          <Table stickyHeader aria-label="user management table">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.grey[700] }}
                >
                  ID
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.grey[700] }}
                >
                  Username
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.grey[700] }}
                >
                  Role
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: theme.palette.grey[700] }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Typography
                      variant="caption"
                      sx={{
                        padding: "4px 8px",
                        borderRadius: "16px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        textTransform: "capitalize",
                        ...getRoleChipStyles(user.role),
                      }}
                    >
                      {user.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(user)}
                      disabled={user.role === "admin"} // Prevent editing other admins for security
                      title="Edit User"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(user.id, user.username)}
                      disabled={user.role === "admin" || user.id === user.id} // Prevents deleting current admin
                      title="Delete User"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            backgroundColor: theme.palette.grey[50],
          }}
        >
          {isEditMode ? "Edit Existing User" : "Add New Cashier/Customer"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              margin="dense"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isEditMode} // Disable editing username
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="password"
              label={
                isEditMode
                  ? "New Password (Leave blank to keep current)"
                  : "Password"
              }
              type="password"
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              required={!isEditMode}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                label="Role"
                value={formData.role}
                onChange={(e) =>
                  handleChange({
                    target: { name: "role", value: e.target.value } as any,
                  })
                }
                required
              >
                {/* Admin can only create these roles */}
                <MenuItem value={"cashier"}>Cashier</MenuItem>
                <MenuItem value={"customer"}>Customer</MenuItem>
              </Select>
            </FormControl>
            {/* Error alert inside dialog */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: 2,
              backgroundColor: theme.palette.grey[50],
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={handleCloseDialog}
              color="secondary"
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: theme.palette.primary.main,
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isEditMode ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default UserManagement;
