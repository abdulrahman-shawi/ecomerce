import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug, getPublishedPages } from "@/server/pages";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {
      title: "الصفحة غير موجودة",
    };
  }

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function StaticPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-light py-12 px-4 md:px-8 font-tajawal" dir="rtl">
      <article className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-dark mb-8 pb-4 border-b border-gray-100">
          {page.title}
        </h1>
        <div
          className="text-gray-700 leading-relaxed space-y-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-dark [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-dark [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pr-6 [&_ol]:mb-4 [&_a]:text-pink [&_a]:hover:underline [&_strong]:text-gray-dark"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </main>
  );
}
