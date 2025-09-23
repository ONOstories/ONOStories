import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const logoUrl = '/ONOstories_logo.jpg';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface StoryPageData { narration: string; imageUrl: string; }
interface StoryData { title: string; storybook_data: StoryPageData[]; }

const StorybookGem = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    (async () => {
      if (!storyId) { toast.error('Story ID is missing.'); setLoading(false); return; }
      try {
        const res = await fetch(`/edge/get-story?storyId=${encodeURIComponent(storyId)}`, { credentials: 'include' });
        const j = await res.json();
        if (!res.ok || !j.story || !j.story.storybook_data)
          throw new Error(j.error || 'Could not fetch the story data.');
        setStory(j.story as StoryData);
      } catch (e: any) {
        toast.error(e.message || 'Could not fetch the story data.');
        setStory(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [storyId]);

  const handleDownload = async () => {
    if (!story) return;
    const resp = await fetch('/edge/track-download', { method: 'POST', credentials: 'include' });
    if (!resp.ok) {
      const j = await resp.json().catch(() => ({}));
      toast.error(j.error || 'Download limit reached, please renew your plan!');
      return;
    }
    setIsDownloading(true);
    toast.info('Preparing your storybook for download...');
    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const fontUrl = 'https://ytigoauzuwnfkfxoglkp.supabase.co/storage/v1/object/public/assets/NewEraCasualBold.ttf';
      const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
      const customFont = await pdfDoc.embedFont(fontBytes);
      const logoBytes = await fetch(logoUrl).then((r) => r.arrayBuffer());
      const logoImage = await pdfDoc.embedJpg(logoBytes);
      const imageBytesArray = await Promise.all(
        story.storybook_data.map(p => fetch(p.imageUrl).then(r => r.arrayBuffer()))
      );
      for (let i = 0; i < story.storybook_data.length; i++) {
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();
        const logoH = 38, logoMargin = 16;
        const logoDims = logoImage.scale(logoH / logoImage.height);
        let y = height - logoDims.height - logoMargin;
        page.drawImage(logoImage, {
          x: (width - logoDims.width) / 2,
          y,
          width: logoDims.width,
          height: logoDims.height,
        });
        if (i === 0) {
          y -= logoMargin + 28;
          const title = story.title;
          const titleFontSize = 24;
          const textWidth = customFont.widthOfTextAtSize(title, titleFontSize);
          page.drawText(title, {
            x: (width - textWidth) / 2,
            y,
            font: customFont,
            size: titleFontSize,
            color: rgb(0.17, 0.11, 0.5),
          });
        }
        const maxImgWidth = width - 100; const maxImgHeight = height * 0.58;
        const embeddedImage = await pdfDoc.embedPng(imageBytesArray[i]);
        const imgDims = embeddedImage.scaleToFit(maxImgWidth, maxImgHeight);
        const imgX = (width - imgDims.width) / 2;
        const imgY = (i === 0 ? y - 32 : y - 80);
        page.drawImage(embeddedImage, {
          x: imgX,
          y: imgY - imgDims.height,
          width: imgDims.width,
          height: imgDims.height,
        });
        const narration = story.storybook_data[i].narration;
        const narrationFontSize = 16; const maxTextWidth = width - 116;
        const lines = splitByWidth(narration, customFont, narrationFontSize, maxTextWidth);
        let textY = imgY - imgDims.height - 26;
        lines.forEach((line, idx) => {
          const tw = customFont.widthOfTextAtSize(line, narrationFontSize);
          page.drawText(line, {
            x: (width - tw) / 2,
            y: textY - idx * (narrationFontSize + 5),
            font: customFont,
            size: narrationFontSize,
            color: rgb(0.13, 0.13, 0.13),
          });
        });
        const pageStr = `Page ${i + 1} of ${story.storybook_data.length}`;
        const pageNumFontSize = 11;
        const pageNumWidth = customFont.widthOfTextAtSize(pageStr, pageNumFontSize);
        page.drawText(pageStr, {
          x: (width - pageNumWidth) / 2,
          y: 32, // Just above page bottom
          font: customFont,
          size: pageNumFontSize,
          color: rgb(0.5, 0.5, 0.5),
        });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const fileName = `${story.title.replace(/\s+/g, '_')}.pdf`;
      download(blob, fileName);
      toast.success('Download complete!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create PDF for download.');
    } finally {
      setIsDownloading(false);
    }
  };

  function splitByWidth(text: string, font: any, size: number, maxWidth: number) {
    const words = text.split(' ');
    let lines: string[] = [];
    let curr = '';
    for (let word of words) {
      const test = curr ? curr + ' ' + word : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        if (curr) lines.push(curr);
        curr = word;
      } else {
        curr = test;
      }
    }
    if (curr) lines.push(curr);
    return lines;
  }

  const totalPages = story?.storybook_data?.length || 0;
  const nextPage = () => { if (currentPage < totalPages - 1) { setDirection(1); setCurrentPage(currentPage + 1); } };
  const prevPage = () => { if (currentPage > 0) { setDirection(-1); setCurrentPage(currentPage - 1); } };
  const pageVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 })
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
    </div>
  );
  if (!story) return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <h2 className="text-2xl font-bold text-red-600">Story Not Found or Data Missing</h2>
      <button onClick={() => navigate('/story-library')} className="mt-4 flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white">
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Library
      </button>
    </div>
  );

  const { title, storybook_data } = story;
  const page = storybook_data[currentPage];

  return (
    <div className="flex h-screen flex-col bg-[#FDF8F3] font-serif">
       <header className="flex items-center justify-between border-b border-gray-300 p-3 md:p-4">
        <button
          onClick={() => navigate('/story-library')}
          className="rounded-lg bg-gray-200 px-2 md:px-4 py-1.5 text-gray-700 hover:bg-gray-300 flex items-center"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex flex-col items-center flex-1">
          <h1 className="text-center text-base sm:text-lg md:text-2xl font-bold text-gray-800 leading-tight line-clamp-2 max-w-[86vw]">{title}</h1>
          <span className="text-xs md:text-sm text-gray-500 font-normal mt-1">{`Page ${currentPage + 1} of ${totalPages}`}</span>
        </div>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex items-center rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
          title="Download PDF"
        >
          {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          <span className="hidden sm:inline ml-2">Download</span>
        </button>
      </header>
      <main className="flex-1 flex flex-col items-stretch relative overflow-auto">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
            className="flex flex-col md:flex-row h-full w-full items-stretch justify-center gap-0 absolute inset-0"
          >
            {/* Image Section */}
            <div className="
              flex
              md:items-center
              justify-center
              md:w-1/2
              w-full
              bg-white/0
              p-2
              md:p-6
              cursor-pointer
              " onClick={prevPage}
            >
              <img
                src={page.imageUrl}
                alt={`Illustration for page ${currentPage + 1}`}
                className="object-contain max-h-[45vh] md:max-h-full w-full rounded-lg shadow-lg border"
                style={{ background: "#fff" }}
              />
              {currentPage > 0 && (
                <button aria-label="Previous Page"
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gray-200 p-2 rounded-full shadow md:left-4 md:p-3"
                >
                  <ArrowLeft className="h-7 w-7 text-[#3b3b73]" />
                </button>
              )}
            </div>
            {/* Narration Section */}
            <div className="
              flex
              flex-col
              w-full
              md:w-1/2
              items-center
              justify-center
              bg-white
              p-4
              md:p-12
              cursor-pointer
              border-t
              md:border-t-0
              md:border-l
              border-gray-100
              " onClick={nextPage}
            >
              <div className="flex flex-col items-center justify-center w-full h-full">
                <p className="w-full max-w-full md:max-w-md text-lg md:text-3xl text-gray-800 leading-relaxed text-center break-words" style={{ wordBreak: "break-word" }}>
                  {page.narration}
                </p>
              </div>
              {currentPage < totalPages - 1 && (
                <button aria-label="Next Page"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center bg-gray-100 p-2 rounded-full shadow md:right-4 md:p-3"
                >
                  <ArrowLeft className="h-7 w-7 rotate-180 text-[#2e2e6d]" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StorybookGem;
