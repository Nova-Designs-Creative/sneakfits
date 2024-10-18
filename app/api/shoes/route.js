import connectMongoDB from "@/libs/mongodb";
import Shoes from "@/models/shoesSchema";
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectMongoDB();
  const shoes = await Shoes.find();
  return NextResponse.json(shoes);
}

export async function POST(request) {
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
    availability,
  } = await request.json();
  await connectMongoDB();
  await Shoes.create({
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
  });
  return NextResponse.json({ message: "Shoes Created" }, { status: 201 });
}

export async function DELETE(request) {
  const id = request.nextUrl.searchParams.get("id");
  await connectMongoDB();
  await Shoes.findByIdAndDelete(id);
  return NextResponse.json({ message: "Shoes deleted" }, { status: 200 });
}

export async function PUT(request) {
  const id = request.nextUrl.searchParams.get("id");
  const {
    newAvailability: availability,
    newSoldTo: soldTo,
    newSoldBy: soldBy,
    newSoldAt: soldAt,
    newCommission: commission,
  } = await request.json();
  await connectMongoDB();
  await Shoes.findByIdAndUpdate(id, {
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
