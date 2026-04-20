/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import TableDialog from "../../components/TableDialog";
import TableCard from "../../components/TableCard";
import {
  useDeleteTableMutation,
  useGetMyRestaurantsQuery,
  useGetTablesByRestaurantQuery,
} from "../../store/api/restaurant.api";

function TableManagement() {
  const { data: res, isLoading: restLoading } = useGetMyRestaurantsQuery();
  const [deleteTableMutation, { isLoading: isDeleting }] = useDeleteTableMutation();

  const myRestaurants = res?.data || [];

  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [deleteTable, setDeleteTable] = useState(null);

  const selectedRestaurant =
    myRestaurants.find((r) => r._id === selectedRestaurantId) ||
    myRestaurants[0];

  useEffect(() => {
    if (myRestaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(myRestaurants[0]._id);
    }
  }, [myRestaurants, selectedRestaurantId]);

  const { data: tablesRes, isLoading: tablesLoading } =
    useGetTablesByRestaurantQuery(
      { resId: selectedRestaurant?._id },
      { skip: !selectedRestaurant?._id }
    );

  const tables = tablesRes?.data || [];

  const addTableClickHandler = () => {
    setEditTable(null);
    setEditDialogOpen(true);
  };

  const editTableClickHandler = (table) => {
    setEditTable(table);
    setEditDialogOpen(true);
  };

  const editDialogCloseHandler = () => {
    setEditTable(null);
    setEditDialogOpen(false);
  };

  if (restLoading) {
    return (
      <Container sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (myRestaurants.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have no restaurants yet.
        </Alert>
        <Button
          variant="contained"
          component={RouterLink}
          to="/owner/restaurants/new"
        >
          Add Restaurant
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Manage Tables</Typography>
        <Typography variant="body2" color="text.secondary">
          Add, edit or remove tables for your restaurants
        </Typography>
      </Box>

      {/* Restaurant Selector */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Restaurant</InputLabel>
        <Select
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          label="Select Restaurant"
        >
          {myRestaurants.map((r) => (
            <MenuItem key={r._id} value={r._id}>
              {r.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Sub-header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          <strong>{selectedRestaurant?.name}</strong> —{" "}
          {tablesLoading
            ? "loading..."
            : `${tables.length} table${tables.length !== 1 ? "s" : ""}`}
        </Typography>

        <Button
          variant="contained"
          onClick={addTableClickHandler}
          startIcon={<AddIcon />}
        >
          Add Table
        </Button>
      </Box>

      {/* Tables */}
      {tablesLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : tables.length === 0 ? (
        <Alert severity="info">No tables yet. Add your first table.</Alert>
      ) : (
        <Grid container spacing={2}>
          {tables.map((table) => (
            <TableCard
              key={table._id}
              table={table}
              editClickHandler={() => editTableClickHandler(table)}
              deleteClickHandler={() => setDeleteTable(table)}
            />
          ))}
        </Grid>
      )}

      {/* Dialogs */}
      <TableDialog
        open={editDialogOpen}
        onClose={editDialogCloseHandler}
        restaurantId={selectedRestaurant?._id}
        existing={editTable}
      />

      <Dialog open={!!deleteTable} onClose={() => setDeleteTable(null)}>
        <DialogTitle>Delete Table?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently remove{" "}
            <strong>Table {deleteTable?.tableNumber}</strong>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTable(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={isDeleting}
            onClick={async () => {
              try {
                await deleteTableMutation({
                  restaurantId: selectedRestaurant._id,
                  tableId: deleteTable?._id,
                }).unwrap();
                setDeleteTable(null);
              } catch (err) {
                console.error("Delete failed", err);
              }
            }}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TableManagement;