"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SellShoesForm from "./SellShoesForm";

const getShoesById = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/shoes/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch shoes");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching shoe data:", error);
    throw error;
  }
};

const SellShoesPage = ({ params }) => {
  const { id } = params;
  const [shoeData, setShoeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signIn");
    } else if (status === "authenticated") {
      const fetchShoeData = async () => {
        try {
          const { shoes } = await getShoesById(id);
          setShoeData(shoes);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchShoeData();
    }
  }, [id, status, router]);

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return null; // This will prevent any flash of content before redirect
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!shoeData) {
    return <div>No shoe data found</div>;
  }

  const {
    shoeImage,
    shoeId,
    sku,
    name,
    size,
    price,
    priceSale,
    owner,
    location,
  } = shoeData;

  return (
    <SellShoesForm
      id={id}
      shoeImage={shoeImage}
      shoeId={shoeId}
      sku={sku}
      name={name}
      size={size}
      price={price}
      priceSale={priceSale}
      owner={owner}
      location={location}
    />
  );
};

export default SellShoesPage;
