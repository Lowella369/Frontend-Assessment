"use client";

import {
  Stack,
  Typography,
  Card,
  CardContent,
  Divider,
  Box,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";
import moment from "moment";

type Op = {
  opId: number;
  publicId: string;
  opTitle: string;
  opDate?: string,
  filledQuantity: number,
  operatorsNeeded: number;
  startTime?: string;
  endTime?: string;
  estTotalHours: number,
  checkInCode: string,
  checkOutCode: string,
  checkInExpirationTime: string,
  checkOutExpirationTime: string,
  operators?: Operators[];
};

type Operators = {
  id: number,
  firstName: string,
  lastName: string,
  opsCompleted: number,
  reliability: number,
  endorsements: string[],
};

type CheckState = {
  [key: number]: {
    checkedIn: boolean;
    checkedOut: boolean;
  };
};

export default function Home() {
  const [ops, setOps] = useState<Op[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkState, setCheckState] = useState<CheckState>({});
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  //Fetch Ops Data 
  useEffect(() => {
    const fetchOps = async () => {
      try {
        const response = await fetch("https://frontend-challenge.veryableops.com/", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch ops data!");
        }

        const data = await response.json();
        setOps(data);
      } catch (err) {
        setError("Unable to load ops data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOps();
  }, []);

  //local storage for check-in/check-out state
  useEffect(() => {
    const stored = localStorage.getItem("checkState");

    if (stored) {
      try {
        setCheckState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse checkState from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("checkState", JSON.stringify(checkState));
  }, [checkState]);

  // Check in / out
  const handleCheckIn = (id: number) => {
    setCheckState((prev) => ({
      ...prev,
      [id]: {
        checkedIn: true,
        checkedOut: false,
      },
    }));
  };

  const handleCheckOut = (id: number) => {
    setCheckState((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        checkedOut: true,
      },
    }));
  };

  const filteredOps = ops.filter((op) => {
    const query = search.toLowerCase();

    const matchesOpTitle =
      op.opTitle?.toLowerCase().includes(query);

    const matchesPublicId =
      op.publicId?.toLowerCase().includes(query);

    const matchesOperator = op.operators?.some((optr) =>
      `${optr.firstName} ${optr.lastName}`
        .toLowerCase()
        .includes(query)
    );

    return matchesOpTitle || matchesPublicId || matchesOperator;
  });

  // sort operators based on selected criteria and order
  const sortOperators = (operators: Operators[]) => {
    const sorted = [...operators];

    sorted.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      }

      if (sortBy === "opsCompleted") {
        return a.opsCompleted - b.opsCompleted;
      }

      if (sortBy === "reliability") {
        return a.reliability - b.reliability;
      }

      return 0;
    });

    return sortOrder === "asc" ? sorted : sorted.reverse();
  };

  if (loading) {
    return (
      <Stack
        sx={{
          width: "100%",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Typography variant="h5">Loading...</Typography>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack
        sx={{
          width: "100%",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Typography variant="h5" color="error">
          Something went wrong...
        </Typography>

        <Typography variant="body1">{error}</Typography>

        <Button variant="contained" onClick={() => window.location.reload()} sx={{ width: "120px" }}>
          Retry
        </Button>
      </Stack>
    )
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold">Operator Dashboard</Typography>

      {/* Search Field */}
      <TextField
        label="Search by Operator Name, Op Title, or Public ID"
        fullWidth
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Sort Options */}
      <Stack direction="row" spacing={2}>
        <FormControl size="small">
          <InputLabel>Sort By</InputLabel>
          <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="name">First & Last Name</MenuItem>
            <MenuItem value="opsCompleted">Ops Completed</MenuItem>
            <MenuItem value="reliability">Reliability</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small">
          <InputLabel>Order</InputLabel>
          <Select value={sortOrder} label="Order" onChange={(e) => setSortOrder(e.target.value)}>
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {filteredOps.map((op) => {
        const q = search.toLowerCase().trim();

        const opMatchesQuery =
          q && (op.publicId?.toLowerCase().includes(q) || op.opTitle?.toLowerCase().includes(q));

        const operatorMatchesList = (op.operators || []).filter((o) =>
          `${o.firstName} ${o.lastName}`.toLowerCase().includes(q)
        );

        const operatorsList =
          operatorMatchesList.length > 0
            ? operatorMatchesList
            : opMatchesQuery || !q
              ? (op.operators || [])
              : [];

        const sortedOperators = sortOperators(operatorsList);

        return (
          <Card key={op.opId} variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {op.opTitle}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Public ID: {op.publicId}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Operators Needed: {op.operatorsNeeded}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Start Time: {moment(op.startTime).format("hh:mm A")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                End Time: {moment(op.endTime).format("hh:mm A")}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography width="25%" variant="h6">Operator Name</Typography>
                <Typography width="15%" variant="h6">Ops Completed</Typography>
                <Typography width="15%" variant="h6">Reliability</Typography>
                <Typography width="25%" variant="h6">Endorsements</Typography>
                <Typography width="20%" />
              </Box>

              <Divider sx={{ mb: 1 }} />

              {
                sortedOperators.map((operator) => {
                  const state = checkState[operator.id] || {
                    checkedIn: false,
                    checkedOut: false,
                  };

                  return (
                    <Box key={operator.id} display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
                      <Typography width="25%">{operator.firstName} {operator.lastName}</Typography>
                      <Typography width="15%">{operator.opsCompleted}</Typography>
                      <Typography width="15%">{operator.reliability * 100}%</Typography>

                      <Stack direction="row" spacing={1} width="25%">
                        {operator.endorsements.map((endorsement, i) => (
                          <Chip key={i} label={endorsement} size="small" />
                        ))}
                      </Stack>

                      <Stack direction="row" spacing={1} width="20%">
                        <Button size="small" variant="contained" disabled={state.checkedIn} onClick={() => handleCheckIn(operator.id)}>
                          Check In
                        </Button>

                        <Button size="small" variant="outlined" disabled={!state.checkedIn || state.checkedOut} onClick={() => handleCheckOut(operator.id)}>
                          Check Out
                        </Button>
                      </Stack>
                    </Box>
                  );
                })
              }
            </CardContent>
          </Card>
        )
      })
      }
    </Stack>
  );
}
