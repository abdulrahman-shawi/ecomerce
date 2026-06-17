"use server";

import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

export interface HeroSlideItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  image: string;
  buttonText: string | null;
  buttonLink: string | null;
  sortOrder: number;
  isActive: boolean;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
}

export async function getAllHeroSlides(): Promise<HeroSlideItem[]> {
  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    buttonText: slide.buttonText,
    buttonLink: slide.buttonLink,
    sortOrder: slide.sortOrder,
    isActive: slide.isActive,
  }));
}

export async function getHeroSlides(): Promise<HeroSlideItem[]> {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return slides.map((slide) => ({
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    image: slide.image,
    buttonText: slide.buttonText,
    buttonLink: slide.buttonLink,
    sortOrder: slide.sortOrder,
    isActive: slide.isActive,
  }));
}

async function uploadSlideImage(file: File): Promise<string> {
  if (!BLOB_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN غير مُعد");
  }

  const fileName = `hero/${Date.now()}-${sanitizeFileName(file.name)}`;
  const blob = await put(fileName, file, {
    access: "public",
    token: BLOB_TOKEN,
  });

  return blob.url;
}

export async function createHeroSlide(formData: FormData) {
  try {
    const title = (formData.get("title") as string) || null;
    const subtitle = (formData.get("subtitle") as string) || null;
    const buttonText = (formData.get("buttonText") as string) || null;
    const buttonLink = (formData.get("buttonLink") as string) || null;
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "يرجى اختيار صورة للسلايدر" };
    }

    const imageUrl = await uploadSlideImage(imageFile);

    await prisma.heroSlide.create({
      data: {
        title,
        subtitle,
        image: imageUrl,
        buttonText,
        buttonLink,
        sortOrder,
        isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/hero-slides");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating hero slide:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء إنشاء السلايدر" };
  }
}

export async function updateHeroSlide(slideId: string, formData: FormData) {
  try {
    const title = (formData.get("title") as string) || null;
    const subtitle = (formData.get("subtitle") as string) || null;
    const buttonText = (formData.get("buttonText") as string) || null;
    const buttonLink = (formData.get("buttonLink") as string) || null;
    const sortOrder = parseInt((formData.get("sortOrder") as string) || "0", 10);
    const isActive = formData.get("isActive") === "on" || formData.get("isActive") === "true";

    const existing = await prisma.heroSlide.findUnique({ where: { id: slideId } });
    if (!existing) {
      return { success: false, error: "السلايدر غير موجود" };
    }

    let imageUrl = existing.image;
    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      // حذف الصورة القديمة من Blob
      try {
        await del(existing.image);
      } catch (err) {
        console.error("Could not delete old hero slide image:", err);
      }
      imageUrl = await uploadSlideImage(imageFile);
    }

    await prisma.heroSlide.update({
      where: { id: slideId },
      data: {
        title,
        subtitle,
        image: imageUrl,
        buttonText,
        buttonLink,
        sortOrder,
        isActive,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/hero-slides");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating hero slide:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء تحديث السلايدر" };
  }
}

export async function deleteHeroSlide(slideId: string) {
  try {
    const existing = await prisma.heroSlide.findUnique({ where: { id: slideId } });
    if (!existing) {
      return { success: false, error: "السلايدر غير موجود" };
    }

    try {
      await del(existing.image);
    } catch (err) {
      console.error("Could not delete hero slide image:", err);
    }

    await prisma.heroSlide.delete({ where: { id: slideId } });

    revalidatePath("/");
    revalidatePath("/admin/hero-slides");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting hero slide:", error);
    return { success: false, error: error.message || "حدث خطأ أثناء حذف السلايدر" };
  }
}
