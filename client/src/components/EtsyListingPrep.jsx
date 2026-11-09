import React, { useState } from 'react';
import { ShoppingCart, Copy, Check, Info } from 'lucide-react';

export default function EtsyListingPrep({ project }) {
  const [copiedField, setCopiedField] = useState(null);

  const titleSuggestion = `${project.title} - ${project.pageCount} Cute Animals Printable Coloring Pages for Kids, US Letter PDF Instant Download`;

  const tags = [
    "coloring book",
    "coloring pages",
    "kids coloring",
    "animal coloring",
    "printable pdf",
    "instant download",
    "cute animals",
    "toddler activities",
    "preschool art",
    "homeschool activity",
    "kids printable",
    "kindergarten",
    "activity book"
  ];

  const descriptionDraft = `🐾 Welcome to ${project.title}! 🐾

Looking for an engaging, creative, and screen-free activity for your children? This instant download printable coloring book features ${project.pageCount} cute and friendly animal coloring pages, designed specially for young kids aged ${project.targetAge}.

✨ WHAT IS INCLUDED:
• 1 High-Resolution Print-Ready PDF (${project.pageCount} unique coloring pages + full-color cover page).
• Standard US Letter Size (8.5 x 11 inches) - prints easily on any home printer or at a local print shop.
• Clean, bold black outlines with easy-to-color spaces.
• Subjects included: Baby elephant, lion cub, friendly bear, playful giraffe, baby panda, dolphins, and many more!

🖨️ HOW IT WORKS:
1. Purchase this listing.
2. Once payment is confirmed, instantly download your PDF file.
3. Print as many times as you like for personal or classroom use!

📌 PLEASE NOTE:
• This is a DIGITAL DOWNLOAD product. No physical item will be shipped.
• For personal or educational classroom use only. Reselling is prohibited.`;

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Etsy Listing Kit & Metadata</h3>
          </div>
          <p className="text-xs text-slate-500">
            Copy-paste optimized title, tags, description, and specifications directly into your Etsy Shop listing form.
          </p>
        </div>

        {/* Title Suggestion */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 uppercase">Suggested Etsy Listing Title (Max 140 chars)</label>
            <button
              onClick={() => copyToClipboard(titleSuggestion, 'title')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              {copiedField === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'title' ? 'Copied' : 'Copy Title'}</span>
            </button>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium">
            {titleSuggestion}
          </div>
        </div>

        {/* Suggested 13 Etsy Tags */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 uppercase">13 Recommended Etsy Tags</label>
            <button
              onClick={() => copyToClipboard(tags.join(', '), 'tags')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              {copiedField === 'tags' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'tags' ? 'Copied All' : 'Copy All 13 Tags'}</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description Draft */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700 uppercase">Etsy Description Template</label>
            <button
              onClick={() => copyToClipboard(descriptionDraft, 'description')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
            >
              {copiedField === 'description' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedField === 'description' ? 'Copied Description' : 'Copy Description'}</span>
            </button>
          </div>
          <textarea
            readOnly
            rows={10}
            value={descriptionDraft}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 focus:outline-none"
          />
        </div>

        {/* Etsy AI Disclosure Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-800">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold text-amber-900">Etsy AI Policy Compliance Reminder</h5>
            <p className="mt-0.5">
              Etsy requires sellers to disclose when AI tools are used to assist in the creation of digital products. When listing your item, toggle the "Created with AI" disclosure in the product details section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}