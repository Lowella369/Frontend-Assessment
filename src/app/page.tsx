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
  TextField
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
  const [checkState, setCheckState] = useState<CheckState>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOps = async () => {
      const res = await fetch("https://frontend-challenge.veryableops.com/", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const jsonData = await res.json();

      setOps(jsonData);
      setLoading(false);
    };

    fetchOps();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("checkState");
    if (stored) {
      setCheckState(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("checkState", JSON.stringify(checkState));
  }, [checkState]);

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
    const query = search.toLowerCase().trim();

    if (!query) return true;

    const operatorMatch = op.operators?.some((o) =>
      `${o.firstName} ${o.lastName}`
        .toLowerCase()
        .includes(query)
    );

    return (
      operatorMatch ||
      op.opTitle?.toLowerCase().includes(query) ||
      op.publicId?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <Typography variant="h1">Loading...</Typography>;
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold">Operator Dashboard</Typography>
      <TextField
        label="Search by Operator Name, Op Title, or Public ID"
        fullWidth
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      {filteredOps?.map((op) => (
        <Card key={op.opId} variant="outlined">
          <CardContent>
            <Typography variant="h5" fontWeight="bold">
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

            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 1.5,
              py: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
            }}>
              <Typography sx={{ width: "25%" }} variant="h6">Operator Name</Typography>
              <Typography sx={{ width: "15%" }} variant="h6">Ops Completed</Typography>
              <Typography sx={{ width: "15%" }} variant="h6">Reliability</Typography>
              <Typography sx={{ width: "25%" }} variant="h6">Endorsements</Typography>
              <Typography sx={{ width: "20%" }} variant="h6"></Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1} >
              {(() => {
                const operatorList = (op.operators || []).slice().sort((a, b) =>
                  a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
                );
                
                const matchingOperators = operatorList.filter((operator) =>
                  `${operator.firstName} ${operator.lastName}`
                    .toLowerCase()
                    .includes(search.toLowerCase().trim())
                );

                const operatorsToShow =
                  search.trim() && matchingOperators.length > 0
                    ? matchingOperators
                    : operatorList;

                return operatorsToShow.map((operator) => {
                  const state = checkState[operator.id] || {
                    checkedIn: false,
                    checkedOut: false,
                  };

                  return (
                    <Box key={operator.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 1.5,
                        py: 1,
                        border: "1px solid #eee",
                        borderRadius: 2,
                      }}
                    >
                      <Typography sx={{ width: "25%" }} variant="body2">{operator.firstName} {operator.lastName}</Typography>
                      <Typography sx={{ width: "15%" }} variant="body2">{operator.opsCompleted}</Typography>
                      <Typography sx={{ width: "15%" }} variant="body2">{operator.reliability}</Typography>

                      <Stack direction="row" spacing={0.5} sx={{ width: "25%", flexWrap: "wrap" }}>
                        {operator.endorsements?.map((endorsement, index) => (
                          <Chip key={index} label={endorsement} size="small" variant="outlined" />
                        ))}
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ width: "20%" }}>
                        <Button size="small"
                          variant="contained"
                          onClick={() =>
                            handleCheckIn(operator.id)
                          }
                          disabled={state.checkedIn}>
                          Check In
                        </Button>

                        <Button size="small"
                          variant="outlined"
                          onClick={() => handleCheckOut(operator.id)}
                          disabled={!state.checkedIn || state.checkedOut}>
                          Check Out
                        </Button>
                      </Stack>
                    </Box>
                  );
                });
              })()}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
