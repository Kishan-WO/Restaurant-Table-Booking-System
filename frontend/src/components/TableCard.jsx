import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PeopleIcon from "@mui/icons-material/People";

const typeColorMap = {
  indoor: "primary",
  outdoor: "success",
  vip: "warning",
};

function TableCard({ table, editClickHandler, deleteClickHandler }) {
  return (
    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
      <Card sx={{ height: "100%" }}>
        <Box
          sx={{
            height: 4,
            background:
              table.type === "vip"
                ? "linear-gradient(90deg, #E65100 0%, #FF8F00 100%)"
                : table.type === "outdoor"
                  ? "linear-gradient(90deg, #2E7D32 0%, #43A047 100%)"
                  : "linear-gradient(90deg, #1565C0 0%, #1E88E5 100%)",
            borderRadius: "12px 12px 0 0",
          }}
        />
        <CardContent sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Table {table.tableNumber}
            </Typography>
            <Chip
              label={table.isActive ? "Active" : "Inactive"}
              size="small"
              color={table.isActive ? "success" : "default"}
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
            <PeopleIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              Capacity: <strong>{table.capacity}</strong>
            </Typography>
          </Box>

          <Box sx={{ mt: 1 }}>
            <Chip
              label={table.type}
              size="small"
              color={typeColorMap[table.type] || "default"}
              sx={{ textTransform: "capitalize" }}
            />
          </Box>
        </CardContent>
        <Divider />
        <CardActions sx={{ py: 0.5, justifyContent: "flex-end" }}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={editClickHandler} color="primary">
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={deleteClickHandler}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  );
}

export default TableCard;