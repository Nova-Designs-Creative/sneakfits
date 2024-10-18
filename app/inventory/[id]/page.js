
import React from "react";
import UpdateProductDashboard from "./UpdateShoesForm";
// we got the id from the api route params
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
    console.log(error);
  }
};
// destructure the params and then get the topic by id

const page = async ({ params }) => {
  const { id } = params;
  const { shoes } = await getShoesById(id);
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
    brand,
  } = shoes;
  return (
    <UpdateProductDashboard
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
      brand={brand}
    />
  );
};

export default page;
