import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Helper to trigger browser download
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

interface StoryPageData {
  narration: string;
  imageUrl: string;
}

interface StoryData {
  title: string;
  storybook_data: StoryPageData[];
}

const StorybookGem = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchStory = async () => {
      if (!storyId) {
        toast.error('Story ID is missing.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from('stories').select('title, storybook_data').eq('id', storyId).single();

      if (error || !data || !data.storybook_data) {
        toast.error('Could not fetch the story data.');
        setStory(null);
      } else {
        setStory(data as StoryData);
      }
      setLoading(false);
    };
    fetchStory();
  }, [storyId]);

  const handleDownload = async () => {
    if (!story) return;
    setIsDownloading(true);
    toast.info('Preparing your storybook for download...');

    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);

      const fontUrl = 'https://ytigoauzuwnfkfxoglkp.supabase.co/storage/v1/object/public/assets/NewEraCasualBold.ttf';
      const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer());
      const customFont = await pdfDoc.embedFont(fontBytes);
      
      const imageFetches = story.storybook_data.map(page => 
        fetch(page.imageUrl).then(res => res.arrayBuffer())
      );
      const imageBytesArray = await Promise.all(imageFetches);

      for (let i = 0; i < story.storybook_data.length; i++) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        const embeddedImage = await pdfDoc.embedPng(imageBytesArray[i]);
        const imgDims = embeddedImage.scaleToFit(width - 100, height - 280);

        page.drawImage(embeddedImage, {
          x: (width - imgDims.width) / 2,
          y: height - imgDims.height - 60,
          width: imgDims.width,
          height: imgDims.height,
        });

        page.drawText(story.storybook_data[i].narration, {
          x: 50,
          y: 100,
          font: customFont,
          size: 18,
          lineHeight: 26,
          color: rgb(0.1, 0.1, 0.1),
          maxWidth: width - 100,
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

  const totalPages = story?.storybook_data?.length || 0;
  const nextPage = () => { if (currentPage < totalPages - 1) { setDirection(1); setCurrentPage(currentPage + 1); } };
  const prevPage = () => { if (currentPage > 0) { setDirection(-1); setCurrentPage(currentPage - 1); } };

  const pageVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-red-600">Story Not Found or Data Missing</h2>
        <button onClick={() => navigate('/story-library')} className="mt-4 flex items-center rounded-lg bg-purple-600 px-4 py-2 text-white">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Library
        </button>
      </div>
    );
  }

  const { title, storybook_data } = story;
  const page = storybook_data[currentPage];

  return (
    <div className="flex h-screen flex-col bg-[#FDF8F3] font-serif">
      <header className="flex items-center justify-between border-b border-gray-300 p-4">
        <button onClick={() => navigate('/story-library')} className="rounded-lg bg-gray-200 px-3 py-1.5 text-gray-700 hover:bg-gray-300">
          Back to Library
        </button>
        <h1 className="text-center text-2xl font-bold text-gray-800">{title}</h1>
        <button onClick={handleDownload} disabled={isDownloading} className="flex items-center rounded-lg bg-blue-500 px-3 py-1.5 text-white hover:bg-blue-600 disabled:bg-blue-300">
          {isDownloading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
          Download
        </button>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.5 }}
            className="absolute grid h-full w-full grid-cols-1 md:grid-cols-2"
          >
            <div className="group relative h-full w-full cursor-pointer bg-gray-200" onClick={prevPage}>
              <img src={page.imageUrl} alt={`Illustration for page ${currentPage + 1}`} className="h-full w-full object-cover" />
              {currentPage > 0 && ( <div className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/50 p-2 opacity-0 transition-opacity group-hover:opacity-100"> <ArrowLeft className="h-8 w-8 text-gray-700" /> </div> )}
            </div>
            <div className="group relative flex h-full w-full cursor-pointer items-center justify-center bg-white p-8 md:p-12" onClick={nextPage}>
              <p className="max-w-md text-2xl leading-loose text-gray-800 md:text-3xl">{page.narration}</p>
              {currentPage < totalPages - 1 && ( <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-100/50 p-2 opacity-0 transition-opacity group-hover:opacity-100"> <ArrowLeft className="h-8 w-8 rotate-180 text-gray-700" /> </div> )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default StorybookGem;

