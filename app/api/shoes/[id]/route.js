import connectMongoDB from "@/libs/mongodb";
import Shoes from "@/models/shoesSchema";
import { NextResponse } from "next/server";


export async function GET(request, { params }) {
  const { id } = params;
  await connectMongoDB();
  const shoes = await Shoes.findOne({ _id: id });
  return NextResponse.json({ shoes }, { status: 200 });
}

export async function PUT(request, { params }) {
  const { id } = params;
  const {
    newShoeImage: shoeImage,
    newShoeId: shoeId,
    newSku: sku,
    newName: name,
    newSize: size,
    newPrice: price,
    newPriceSale: priceSale,
    newOwner: owner,
    newLocation: location,
    newBrand: brand,
    newAvailability: availability,
    newSoldTo: soldTo,
    newSoldBy: soldBy,
    newSoldAt: soldAt,
    newCommission: commission,
  } = await request.json();
  await connectMongoDB();
  await Shoes.findByIdAndUpdate(id, {
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
    availability,
    soldTo: soldTo || null,
    soldBy: soldBy || null,
    soldAt: soldAt || null,
    ...(commission && {
      "commission.fitz": commission.fitz || 0,
      "commission.bryan": commission.bryan || 0,
      "commission.ashley": commission.ashley || 0,
      "commission.sneakergram": commission.sneakergram || 0,
      "commission.sneakfits": commission.sneakfits || 0,
      "commission.profit": commission.profit || 0,
      "commission.dateSold": commission.dateSold || null,
    }),
  });
  return NextResponse.json({ message: "Shoes Updated" }, { status: 200 });
}
