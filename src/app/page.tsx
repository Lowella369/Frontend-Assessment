"use client";

import { Stack, Typography, Card, CardContent, Divider, Box, Chip } from "@mui/material";
import { useEffect, useState } from "react";

export default function Home() {
  const [ops, setOps] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading){
    return <Typography variant="h1">Loading...</Typography>;
  }

  return (
    <Stack spacing={3} sx={{p:3}}>
      {ops?.map((op) => (
        <Card key={op.opId} variant="outlined">
          <CardContent>
            <Typography variant="h4" fontWeight="bold">
              {op.opTitle}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Public ID: {op.publicId}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Operators Needed: {op.operatorsNeeded}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Start & End Time: {}
            </Typography>

            <Divider sx={{ my:2}}/>

            <Box sx={{
              display: "flex",
              justifyContent: "space-between",
              px: 1.5,
              py: 1,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              fontWeight: "bold",
              fontSize: "12px",
            }}>
              <Typography sx={{ width: "30%" }}>Operator Name</Typography>
              <Typography sx={{ width: "20%" }}>Ops Completed</Typography>
              <Typography sx={{ width: "20%" }}>Reliability</Typography>
              <Typography sx={{ width: "30%" }}>Endorsements</Typography>
            </Box>

            <Divider sx={{ my: 1}} />

            <Stack spacing={1} >
              {op.operators?.map((operator) => (
                <Box key={operator.operatorId}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 1.5,
                    border: "1px solid #eee",
                    borderRadius: 2,
                    fontSize: "12px",
                  }}
                >
                  <Typography sx={{ width: "30%" }}>{operator.firstName} {operator.lastName}</Typography>
                  <Typography sx={{ width: "20%" }}>{operator.opsCompleted}</Typography>
                  <Typography sx={{ width: "20%" }}>{operator.reliability}</Typography>
                  {/* <Typography sx={{ width: "30%" }}>{operator.endorsements}</Typography> */}
                  <Stack direction="row" spacing={0.5} sx={{ width: "30%", flexWrap: "wrap"}}>
                    {operator.endorsements?.map((endorsement) => (
                      <Chip label={endorsement} size="small" variant="outlined"/>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
