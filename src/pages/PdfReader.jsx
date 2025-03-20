import { useEffect, useState, useRef } from "react";
import * as pdfjs from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?worker&inline";
import { jsPDF } from "jspdf";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sun,
  Moon,
  Search,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import "./PdfReader.css";

// Set the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerPort = new pdfjsWorker();

// List of books
const books = [
  { id: 1, title: "Java Book", file: "/book.pdf" },
  { id: 2, title: "Core Java", file: "/book2.pdf" },
  { id: 3, title: "Collection", file: "/book3.pdf" },
  { id: 4, title: "Core Java Interview QA", file: "/book4.pdf" },
  { id: 5, title: "Spring", file: "/book5.pdf" },
  { id: 6, title: "DSA", file: "/book6.pdf" },
  { id: 7, title: "Microservices", file: "/book7.pdf" },
  { id: 8, title: "Rest API", file: "/book8.pdf" },
  { id: 9, title: "Make MyTrip Rest API", file: "/book9.pdf" },
  { id: 10, title: "JUnit 5", file: "/book10.pdf" },
  { id: 11, title: "Sprin MVC With Mini Project", file: "/book11.pdf" },
  { id: 12, title: "Kafka", file: "/book12.pdf" },
  { id: 13, title: "Spring Security", file: "/book13.pdf" },
  { id: 15, title: "Kubernates", file: "/book14.pdf" },
  { id: 16, title: "Angular", file: "/book15.pdf" },
  { id: 17, title: "Jenkins CICD", file: "/book16.pdf" },
  { id: 18, title: "Logging", file: "/book17.pdf" },
  { id: 19, title: "Sonar Qube", file: "/book18.pdf" },
  { id: 20, title: "SDLC", file: "/book19.pdf" },
  { id: 21, title: "AWS", file: "/book20.pdf" },
  { id: 22, title: "Maven", file: "/book21.pdf" },
];

export default function PdfReader() {
  const [currentBook, setCurrentBook] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [progressMap, setProgressMap] = useState({});
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const userName = localStorage.getItem("userName") || "Learner";

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = JSON.parse(localStorage.getItem("progressMap")) || {};
    setProgressMap(savedProgress);
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("progressMap", JSON.stringify(progressMap));
  }, [progressMap]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => renderPage(currentPage);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentPage, pdfDoc, scale]);

  // Load PDF whenever a new book is selected
  useEffect(() => {
    const loadPDF = async () => {
      if (!currentBook) return;
      try {
        const loadingTask = pdfjs.getDocument(currentBook.file);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);

        const progress = progressMap[currentBook.id];
        if (progress) {
          const savedPage = Math.ceil((progress / 100) * pdf.numPages);
          setCurrentPage(savedPage || 1);
        } else {
          setCurrentPage(1);
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
        // Optionally display an error message here
      }
    };
    loadPDF();
  }, [currentBook]);

  // Render page when the page or scale changes
  useEffect(() => {
    if (pdfDoc) renderPage(currentPage);
  }, [pdfDoc, currentPage, scale]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goToPrevPage();
      if (e.key === "ArrowRight") goToNextPage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const renderPage = async (pageNum) => {
    if (pdfDoc && canvasRef.current && containerRef.current) {
      const page = await pdfDoc.getPage(pageNum);
      const containerWidth = window.innerWidth * 0.9;
      const viewport = page.getViewport({ scale: 1 });
      const fitScale = (containerWidth / viewport.width) * scale;
      const scaledViewport = page.getViewport({ scale: fitScale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;
      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      await page.render(renderContext).promise;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const progress = Math.round((page / numPages) * 100);
    setProgressMap((prev) => ({
      ...prev,
      [currentBook.id]: progress,
    }));
  };

  const goToPrevPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < numPages) handlePageChange(currentPage + 1);
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateCertificate = () => {
    const doc = new jsPDF("landscape", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const freshUserName = localStorage.getItem("userName") || "Learner";

    doc.setFillColor("#f1f5f9");
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    doc.setLineWidth(10);
    doc.setDrawColor(255, 215, 0);
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60);
    doc.setFontSize(60);
    doc.setTextColor(255, 215, 0);
    doc.text("🏅", pageWidth - 80, 120);

    doc.setFontSize(30);
    doc.setTextColor("#1e293b");
    doc.text("Certificate of Completion", pageWidth / 2, 80, {
      align: "center",
    });

    doc.setFontSize(18);
    doc.setTextColor("#334155");
    doc.text("This is to certify that", pageWidth / 2, 140, {
      align: "center",
    });

    doc.setFontSize(26);
    doc.setTextColor("#2563eb");
    doc.text(freshUserName, pageWidth / 2, 180, { align: "center" });

    doc.setFontSize(18);
    doc.setTextColor("#334155");
    doc.text(`has successfully completed the course`, pageWidth / 2, 220, {
      align: "center",
    });

    doc.setFontSize(22);
    doc.setTextColor("#2563eb");
    doc.text(`${currentBook?.title}`, pageWidth / 2, 260, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor("#475569");
    const date = new Date().toLocaleDateString();
    doc.text(`Date: ${date}`, 80, 360);

    doc.setFontSize(14);
    doc.text("E-Books Academy", pageWidth - 120, 360);

    doc.setDrawColor("#2563eb");
    doc.line(70, 380, 200, 380);
    doc.text("Instructor Signature", 80, 400);

    doc.save(`${currentBook?.title}_Certificate.pdf`);
  };

  return (
    <>
      <header className={`global-header ${darkMode ? "dark" : "light"}`}>
        <button
          onClick={toggleDarkMode}
          className={`button ${darkMode ? "dark" : ""}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div
        ref={containerRef}
        className={`container ${darkMode ? "dark" : "light"}`}
      >
        {!currentBook ? (
          <>
            <div className="search-container">
              <Search className="absolute top-2.5 left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                className={`search-input ${darkMode ? "dark" : ""}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <ul className="book-list">
              {filteredBooks.map((book) => (
                <li
                  key={book.id}
                  className={`book-item ${darkMode ? "dark" : ""}`}
                  onClick={() => setCurrentBook(book)}
                >
                  <BookOpen style={{ color: "#2563eb" }} />
                  <span>{book.title}</span>
                  <span style={{ marginLeft: "auto", fontSize: "0.8rem" }}>
                    {progressMap[book.id]
                      ? `${progressMap[book.id]}% read`
                      : "0% read"}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <div className={`viewer-header ${darkMode ? "dark" : ""}`}>
              <button
                onClick={() => setCurrentBook(null)}
                style={{ color: darkMode ? "#60a5fa" : "#2563eb" }}
              >
                ← Back to Book List
              </button>
              <div className="control-buttons">
                <button
                  onClick={() => setScale((prev) => prev + 0.1)}
                  className={`button ${darkMode ? "dark" : ""}`}
                >
                  <ZoomIn />
                </button>
                <button
                  onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
                  className={`button ${darkMode ? "dark" : ""}`}
                >
                  <ZoomOut />
                </button>
                <button
                  onClick={generateCertificate}
                  className={`button ${darkMode ? "dark" : ""}`}
                  disabled={progressMap[currentBook.id] < 100}
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
            <canvas ref={canvasRef} />

            <div className="pagination">
              <button onClick={goToPrevPage} disabled={currentPage === 1}>
                <ChevronLeft />
              </button>
              <span>
                Page {currentPage} of {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage === numPages}
              >
                <ChevronRight />
              </button>
            </div>

            {progressMap[currentBook.id] >= 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="download-message"
              >
                🎉 Congratulations You have SuccessFully earned Certificate...
              </motion.div>
            )}
          </>
        )}
      </div>
      <footer class="footer">
        <p>&copy; 2025 eBook Reader. All Rights Reserved.</p>
      </footer>
    </>
  );
}
