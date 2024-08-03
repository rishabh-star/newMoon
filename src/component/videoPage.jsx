"use client";
// pages/video/[id].jsx
import React, { useEffect, useState } from "react";

const VideoPage = (props) => {
  const id = props.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/extract-page?impo=${id}`, {
          cache: "force-cache",
        });
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div>
      <h1>{data.title}</h1>
      <p>Views: {data.views}</p>
      <h2>{data.url}</h2>
      {/* Render other data fields as needed */}
    </div>
  );
};

export default VideoPage;
