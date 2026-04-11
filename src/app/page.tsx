"use client";

import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function Home() {
  const [ops, setOps] = useState([]);

  useEffect(() => {
    const fetchOps = async () => {
      const res = await fetch("https://frontend-challenge.veryableops.com/", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const jsonData = await res.json();

      setOps(jsonData);
    };

    fetchOps();
  }, []);

  return (
    <Stack
      sx={{
        width: "100%",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography variant="h1">Ops</Typography>
      {ops.map((op) => (
        <div key={op.opId}>
          <h3>{op.opTitle}</h3>
        </div>
      ))}
    </Stack>
  );
}
